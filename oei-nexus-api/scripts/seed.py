"""
Database seed script.
Creates the first superuser and a set of demo projects.
Safe to run multiple times (idempotent).

Usage:
  python scripts/seed.py
"""
import asyncio
import sys
from pathlib import Path

# Ensure project root is on path when run directly
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.organization import Organization
from app.models.project import Project
from app.models.user import User
from app.services.oei_scoring import compute_oei_score
from app.models.assessment import OeiAssessment, OeiDimensionScore


DEMO_PROJECTS = [
    {
        "name": "Sahel Solar Grid",
        "slug": "sahel-solar-grid",
        "description": "100 MW solar farm providing electricity to 500,000 households in Mali.",
        "project_type": "solar",
        "status": "active",
        "country": "Mali",
        "region": "West Africa",
        "latitude": 12.65,
        "longitude": -8.0,
        "capacity_mw": 100.0,
        "investment_usd": 85_000_000,
        "beneficiaries": 500_000,
        "dimensions": {"digitalization": 72, "sdg7": 91, "finance": 68, "inclusion": 85, "governance": 78, "impact": 88},
    },
    {
        "name": "Andean Wind Corridor",
        "slug": "andean-wind-corridor",
        "description": "Wind farm in the Chilean Andes supplying 3 rural provinces.",
        "project_type": "wind",
        "status": "active",
        "country": "Chile",
        "region": "South America",
        "latitude": -33.45,
        "longitude": -70.65,
        "capacity_mw": 60.0,
        "investment_usd": 62_000_000,
        "beneficiaries": 210_000,
        "dimensions": {"digitalization": 80, "sdg7": 82, "finance": 75, "inclusion": 70, "governance": 83, "impact": 79},
    },
    {
        "name": "Mekong Micro-Hydro Network",
        "slug": "mekong-micro-hydro",
        "description": "Distributed micro-hydro stations along the Mekong delta in Cambodia.",
        "project_type": "hydro",
        "status": "active",
        "country": "Cambodia",
        "region": "South-East Asia",
        "latitude": 11.56,
        "longitude": 104.92,
        "capacity_mw": 15.0,
        "investment_usd": 18_000_000,
        "beneficiaries": 75_000,
        "dimensions": {"digitalization": 60, "sdg7": 78, "finance": 55, "inclusion": 82, "governance": 65, "impact": 74},
    },
    {
        "name": "Lagos Island Solar + Storage",
        "slug": "lagos-solar-storage",
        "description": "Urban solar + battery storage project reducing outages in Lagos Island.",
        "project_type": "storage",
        "status": "active",
        "country": "Nigeria",
        "region": "West Africa",
        "latitude": 6.46,
        "longitude": 3.39,
        "capacity_mw": 25.0,
        "investment_usd": 30_000_000,
        "beneficiaries": 180_000,
        "dimensions": {"digitalization": 88, "sdg7": 85, "finance": 80, "inclusion": 76, "governance": 72, "impact": 82},
    },
    {
        "name": "Bangladesh Floating Solar",
        "slug": "bangladesh-floating-solar",
        "description": "Floating solar on irrigation reservoirs serving 200 villages.",
        "project_type": "solar",
        "status": "active",
        "country": "Bangladesh",
        "region": "South Asia",
        "latitude": 23.68,
        "longitude": 90.35,
        "capacity_mw": 40.0,
        "investment_usd": 35_000_000,
        "beneficiaries": 320_000,
        "dimensions": {"digitalization": 65, "sdg7": 87, "finance": 62, "inclusion": 90, "governance": 70, "impact": 85},
    },
]


async def seed(db: AsyncSession) -> None:
    # ── Superuser ─────────────────────────────────────────────────────────────
    result = await db.execute(select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL))
    admin = result.scalar_one_or_none()
    if not admin:
        admin = User(
            email=settings.FIRST_SUPERUSER_EMAIL,
            hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="OEI Nexus Admin",
            role="admin",
            is_superuser=True,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        await db.flush()
        print(f"[seed] Created superuser: {admin.email}")
    else:
        print(f"[seed] Superuser already exists: {admin.email}")

    # ── Demo organization ─────────────────────────────────────────────────────
    result = await db.execute(select(Organization).where(Organization.slug == "oei-demo"))
    org = result.scalar_one_or_none()
    if not org:
        org = Organization(
            name="OEI Demo Initiative",
            slug="oei-demo",
            description="Demo organization for development and testing.",
            org_type="ngo",
        )
        db.add(org)
        await db.flush()
        print("[seed] Created demo organization")

    # ── Demo projects + assessments ───────────────────────────────────────────
    for pd in DEMO_PROJECTS:
        dims = pd.pop("dimensions")
        result = await db.execute(select(Project).where(Project.slug == pd["slug"]))
        project = result.scalar_one_or_none()
        if not project:
            project = Project(**pd, created_by_id=admin.id, organization_id=org.id)
            db.add(project)
            await db.flush()

            # Score it
            scored = compute_oei_score(dims)
            assessment = OeiAssessment(
                project_id=project.id,
                assessed_by_id=admin.id,
                total_score=scored.total_score,
                level=scored.level,
                score_version=scored.score_version,
                is_published=True,
            )
            db.add(assessment)
            await db.flush()

            for dr in scored.dimension_results:
                db.add(OeiDimensionScore(
                    assessment_id=assessment.id,
                    dimension=dr.dimension,
                    raw_score=dr.raw_score,
                    weight=dr.weight,
                    weighted_score=dr.weighted_score,
                ))

            # Sync score to project
            project.oei_score = scored.total_score
            project.oei_level = scored.level
            print(f"[seed] Created project: {project.name} → {scored.level} ({scored.total_score})")
        else:
            print(f"[seed] Project already exists: {project.name}")

    await db.commit()
    print("[seed] Done.")


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(main())
