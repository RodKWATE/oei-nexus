"""Import all models so Alembic autogenerate can discover them."""
from app.models.assessment import OeiAssessment, OeiDimensionScore  # noqa: F401
from app.models.metric import ImpactMetric  # noqa: F401
from app.models.organization import Organization  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.user import User  # noqa: F401
