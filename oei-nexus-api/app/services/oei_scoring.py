"""
OEI Scoring Engine v2.4

Computes a weighted aggregate score across 6 dimensions and
assigns a level (Bronze / Silver / Gold / Platinum).

Dimension weights (must sum to 1.0):
  digitalization   0.15
  sdg7             0.20
  finance          0.15
  inclusion        0.25
  governance       0.15
  impact           0.10
"""
from dataclasses import dataclass, field
from typing import Dict, List

import structlog

from app.core.config import settings
from app.core.exceptions import OEIScoringError

logger = structlog.get_logger(__name__)

# ── Weights ───────────────────────────────────────────────────────────────────
DIMENSION_WEIGHTS: Dict[str, float] = {
    "digitalization": 0.15,
    "sdg7":           0.20,
    "finance":        0.15,
    "inclusion":      0.25,
    "governance":     0.15,
    "impact":         0.10,
}
assert abs(sum(DIMENSION_WEIGHTS.values()) - 1.0) < 1e-9, "Weights must sum to 1.0"

REQUIRED_DIMENSIONS = frozenset(DIMENSION_WEIGHTS.keys())

# ── Levels ────────────────────────────────────────────────────────────────────
_LEVEL_THRESHOLDS = [
    (90, "Platinum"),
    (75, "Gold"),
    (55, "Silver"),
    (0,  "Bronze"),
]


@dataclass
class DimensionResult:
    dimension: str
    raw_score: float       # 0–100
    weight: float
    weighted_score: float  # raw_score * weight


@dataclass
class ScoringResult:
    total_score: float
    level: str
    score_version: str
    dimension_results: List[DimensionResult] = field(default_factory=list)


def score_level(total: float) -> str:
    for threshold, level in _LEVEL_THRESHOLDS:
        if total >= threshold:
            return level
    return "Bronze"


def compute_oei_score(dimension_inputs: Dict[str, float]) -> ScoringResult:
    """
    Args:
        dimension_inputs: mapping of dimension_name → raw_score (0–100)
    Returns:
        ScoringResult with total_score, level, and per-dimension breakdown
    Raises:
        OEIScoringError: if any required dimension is missing or score out of range
    """
    missing = REQUIRED_DIMENSIONS - set(dimension_inputs.keys())
    if missing:
        raise OEIScoringError(
            f"Missing required dimensions: {sorted(missing)}",
            missing_dimensions=sorted(missing),
        )

    out_of_range = {
        dim: score
        for dim, score in dimension_inputs.items()
        if dim in REQUIRED_DIMENSIONS and not (0 <= score <= 100)
    }
    if out_of_range:
        raise OEIScoringError(
            "Dimension scores must be between 0 and 100",
            out_of_range=out_of_range,
        )

    results: List[DimensionResult] = []
    total = 0.0

    for dim, weight in DIMENSION_WEIGHTS.items():
        raw = dimension_inputs[dim]
        ws = round(raw * weight, 4)
        total += ws
        results.append(DimensionResult(
            dimension=dim,
            raw_score=raw,
            weight=weight,
            weighted_score=ws,
        ))

    total = round(total, 2)
    level = score_level(total)

    logger.debug(
        "oei_score_computed",
        total_score=total,
        level=level,
        version=settings.OEI_SCORE_VERSION,
    )

    return ScoringResult(
        total_score=total,
        level=level,
        score_version=settings.OEI_SCORE_VERSION,
        dimension_results=results,
    )
