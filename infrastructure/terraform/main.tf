# =============================================================================
# OEI Nexus — Terraform Infrastructure
# Alternative to provision.sh — use one or the other, not both.
# =============================================================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  # Store state in GCS (recommended for teams)
  # backend "gcs" {
  #   bucket = "oei-nexus-tf-state"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── Variables ─────────────────────────────────────────────────────────────────

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "PostgreSQL user password"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "API SECRET_KEY"
  type        = string
  sensitive   = true
}

# ── APIs ──────────────────────────────────────────────────────────────────────

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "vpcaccess.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "servicenetworking.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

# ── VPC ───────────────────────────────────────────────────────────────────────

resource "google_compute_network" "vpc" {
  name                    = "oei-vpc"
  auto_create_subnetworks = true
  depends_on              = [google_project_service.apis]
}

resource "google_compute_global_address" "private_range" {
  name          = "oei-private-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "vpc_peering" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_range.name]
}

resource "google_vpc_access_connector" "connector" {
  name          = "oei-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"
  min_instances = 2
  max_instances = 10
  depends_on    = [google_project_service.apis]
}

# ── Artifact Registry ────────────────────────────────────────────────────────

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "oei-nexus"
  format        = "DOCKER"
}

# ── Cloud SQL ─────────────────────────────────────────────────────────────────

resource "google_sql_database_instance" "postgres" {
  name             = "oei-postgres"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-g1-small"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled            = true
      start_time         = "03:00"
      binary_log_enabled = false
    }

    disk_autoresize = true
    disk_size       = 20
  }

  deletion_protection = true
  depends_on          = [google_service_networking_connection.vpc_peering]
}

resource "google_sql_database" "db" {
  name     = "oei_nexus"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "user" {
  name     = "oei"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# ── Memorystore Redis ─────────────────────────────────────────────────────────

resource "google_redis_instance" "redis" {
  name           = "oei-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region
  redis_version  = "REDIS_7_0"
  authorized_network = google_compute_network.vpc.id
}

# ── Secret Manager ────────────────────────────────────────────────────────────

locals {
  cloud_sql_connection = "${var.project_id}:${var.region}:${google_sql_database_instance.postgres.name}"
  db_url_async = "postgresql+asyncpg://oei:${var.db_password}@/oei_nexus?host=/cloudsql/${local.cloud_sql_connection}"
  db_url_sync  = "postgresql://oei:${var.db_password}@/oei_nexus?host=/cloudsql/${local.cloud_sql_connection}"
  redis_url    = "redis://${google_redis_instance.redis.host}:6379/0"
}

resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(["oei-secret-key", "oei-db-url", "oei-db-url-sync", "oei-redis-url"])
  secret_id = each.key
  replication { auto {} }
}

resource "google_secret_manager_secret_version" "values" {
  for_each = {
    "oei-secret-key"  = var.secret_key
    "oei-db-url"      = local.db_url_async
    "oei-db-url-sync" = local.db_url_sync
    "oei-redis-url"   = local.redis_url
  }
  secret      = google_secret_manager_secret.secrets[each.key].id
  secret_data = each.value
}

# ── Service Account ───────────────────────────────────────────────────────────

resource "google_service_account" "cloudrun_sa" {
  account_id   = "oei-cloudrun"
  display_name = "OEI Nexus Cloud Run SA"
}

resource "google_project_iam_member" "sa_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/redis.editor",
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "cloud_sql_connection" {
  value = local.cloud_sql_connection
}

output "redis_host" {
  value = google_redis_instance.redis.host
}

output "artifact_registry" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/oei-nexus"
}

output "service_account" {
  value = google_service_account.cloudrun_sa.email
}
