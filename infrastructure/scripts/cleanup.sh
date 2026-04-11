#!/usr/bin/env bash
# =============================================================================
# OEI Nexus — Script de suppression (Cleanup)
# Supprime toutes les ressources GCP déployées pour le projet OEI Nexus.
# =============================================================================
set -uo pipefail

# Configuration (doit correspondre à provision.sh)
PROJECT_ID="cloudnativedemo1"
REGION="us-central1"

echo -e "\033[0;34m[cleanup]\033[0m Début de la suppression des ressources pour le projet : $PROJECT_ID"

# 1. Services Cloud Run
echo "Suppression des services Cloud Run..."
for svc in oei-api oei-worker oei-frontend; do
  gcloud run services delete "$svc" --region="$REGION" --quiet 2>/dev/null && echo "✓ Service $svc supprimé" || echo "- Service $svc non trouvé"
done

# 2. Jobs Cloud Run
echo "Suppression des jobs Cloud Run..."
for job in oei-migrate oei-seed; do
  gcloud run jobs delete "$job" --region="$REGION" --quiet 2>/dev/null && echo "✓ Job $job supprimé" || echo "- Job $job non trouvé"
done

# 3. Secret Manager
echo "Suppression des secrets..."
for secret in oei-secret-key oei-db-url oei-db-url-sync oei-redis-url oei-admin-email oei-admin-password; do
  gcloud secrets delete "$secret" --quiet 2>/dev/null && echo "✓ Secret $secret supprimé" || echo "- Secret $secret non trouvé"
done

# 4. Cloud Build Trigger
echo "Suppression du trigger Cloud Build..."
gcloud builds triggers delete oei-deploy-main --region=global --quiet 2>/dev/null && echo "✓ Trigger oei-deploy-main supprimé" || echo "- Trigger non trouvé"

# 5. Memorystore Redis
echo "Suppression de l'instance Redis..."
gcloud redis instances delete oei-redis --region="$REGION" --quiet 2>/dev/null && echo "✓ Redis oei-redis supprimé" || echo "- Instance Redis non trouvée"

# 6. Cloud SQL
echo "Suppression de l'instance Cloud SQL (cela peut prendre quelques minutes)..."
gcloud sql instances delete oei-postgres --quiet 2>/dev/null && echo "✓ SQL oei-postgres supprimé" || echo "- Instance SQL non trouvée"

# 7. Artifact Registry
echo "Suppression du dépôt Artifact Registry..."
gcloud artifacts repositories delete oei-nexus --location="$REGION" --quiet 2>/dev/null && echo "✓ Dépôt oei-nexus supprimé" || echo "- Dépôt non trouvé"

# 8. Service Account
echo "Suppression du compte de service..."
SA_EMAIL="oei-cloudrun@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts delete "$SA_EMAIL" --quiet 2>/dev/null && echo "✓ SA $SA_EMAIL supprimé" || echo "- Compte de service non trouvé"

# 9. Connecteur VPC (si existant)
echo "Suppression du connecteur VPC Access..."
gcloud compute networks vpc-access connectors delete oei-connector --region="$REGION" --quiet 2>/dev/null && echo "✓ Connecteur supprimé" || echo "- Connecteur non trouvé"

# 10. Peering de services (requis pour supprimer le VPC)
echo "Suppression du peering de services et des adresses réservées..."
gcloud services vpc-peerings delete \
    --service=servicenetworking.googleapis.com \
    --network=oei-vpc \
    --project="$PROJECT_ID" --quiet 2>/dev/null && echo "✓ Peering supprimé" || echo "- Peering non trouvé"

# Suppression des plages d'adresses IP réservées (souvent ce qui bloque la suppression du VPC)
for addr in $(gcloud compute addresses list --global --filter="network:oei-vpc" --format="value(name)" 2>/dev/null); do
  gcloud compute addresses delete "$addr" --global --quiet 2>/dev/null && echo "✓ Adresse réservée $addr supprimée"
done

# 11. Règles de pare-feu
echo "Suppression des règles de pare-feu..."
for rule in $(gcloud compute firewall-rules list --filter="network:oei-vpc" --format="value(name)" 2>/dev/null); do
  gcloud compute firewall-rules delete "$rule" --quiet 2>/dev/null && echo "✓ Règle pare-feu $rule supprimée"
done

# 12. Réseau VPC (avec boucle de retry car la libération des ressources par GCP est asynchrone)
echo "Suppression du réseau VPC (cela peut nécessiter plusieurs tentatives)..."
for i in {1..5}; do
  gcloud compute networks delete oei-vpc --quiet 2>/dev/null && { echo "✓ Réseau oei-vpc supprimé"; break; }
  echo "... réseau encore utilisé, nouvelle tentative dans 20s (tentative $i/5)..."
  sleep 20
done

echo ""
echo -e "\033[0;32m✓ Nettoyage terminé.\033[0m"
