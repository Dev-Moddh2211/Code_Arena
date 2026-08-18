import json
from typing import Any, Tuple

def normalize_string_output(s: str) -> str:
    """
    Normalizes string line endings to Unix '\\n' and trims ONLY trailing newlines/carriage returns.
    Does NOT trim spaces inside lines or leading spaces.
    Handles UTF-8 and unicode characters without degradation.
    """
    if s is None:
        return ""
    # Normalize Windows CRLF and CR to Unix LF
    normalized = str(s).replace("\r\n", "\n").replace("\r", "\n")
    # Trim only trailing newlines
    return normalized.rstrip("\n")

def parse_json_safely(data: str) -> Tuple[bool, Any]:
    """Tries to parse a string as JSON; returns (is_json, parsed_value_or_normalized_str)."""
    if not isinstance(data, str):
        return False, data
    trimmed = data.strip()
    try:
        parsed = json.loads(trimmed)
        return True, parsed
    except Exception:
        return False, normalize_string_output(data)

def deep_sort(obj: Any) -> Any:
    """Recursively sorts nested lists for order-independent comparison."""
    if isinstance(obj, list):
        sorted_elements = [deep_sort(item) for item in obj]
        try:
            return sorted(sorted_elements)
        except TypeError:
            return sorted(sorted_elements, key=lambda x: json.dumps(x, sort_keys=True, default=str))
    elif isinstance(obj, dict):
        return {k: deep_sort(v) for k, v in sorted(obj.items())}
    elif isinstance(obj, float):
        return round(obj, 6)
    return obj

def values_match(a: Any, b: Any, order_matters: bool = True) -> bool:
    """
    Recursively compares two data structures with both absolute and relative tolerance for floats:
    abs(a - b) <= 1e-5 or abs(a - b) <= 1e-5 * max(abs(a), abs(b))
    """
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        diff = abs(a - b)
        if diff <= 1e-5:
            return True
        max_abs = max(abs(a), abs(b))
        if max_abs > 0 and (diff <= 1e-5 * max_abs):
            return True
        return False

    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return False
        if not order_matters:
            a_sorted = deep_sort(a)
            b_sorted = deep_sort(b)
            return all(values_match(x, y, True) for x, y in zip(a_sorted, b_sorted))
        return all(values_match(x, y, order_matters) for x, y in zip(a, b))

    if isinstance(a, dict) and isinstance(b, dict):
        if set(a.keys()) != set(b.keys()):
            return False
        return all(values_match(a[k], b[k], order_matters) for k in a)

    return a == b

def compare_outputs(actual: str, expected: str, order_matters: bool = True) -> bool:
    """
    Compares actual execution output with expected output:
    1. If both are valid JSON structures, recursively compares with float absolute & relative epsilon tolerance.
    2. Otherwise compares normalized strings (CRLF normalized, trailing newlines stripped, spaces preserved).
    """
    if actual is None or expected is None:
        return actual == expected

    actual_is_json, actual_val = parse_json_safely(actual)
    expected_is_json, expected_val = parse_json_safely(expected)

    if actual_is_json and expected_is_json:
        return values_match(actual_val, expected_val, order_matters)

    # String comparison with normalized line endings and only trailing newlines stripped
    norm_actual = normalize_string_output(actual)
    norm_expected = normalize_string_output(expected)
    return norm_actual == norm_expected
