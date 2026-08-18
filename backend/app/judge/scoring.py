from typing import Dict

DIFFICULTY_BASE_POINTS: Dict[str, int] = {
    "easy": 10,
    "medium": 20,
    "hard": 30,
}

def calculate_submission_score(difficulty: str, passed_count: int, total_count: int, base_points: int = None) -> int:
    """Calculates points earned from a submission."""
    points = base_points or DIFFICULTY_BASE_POINTS.get(difficulty.lower(), 10)
    if total_count <= 0:
        return 0
    if passed_count == total_count:
        return points
    # Partial score if required (or 0 for non-accepted)
    return int((passed_count / total_count) * points * 0.5)
