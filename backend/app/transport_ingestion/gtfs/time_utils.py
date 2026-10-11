import re
from typing import Tuple


def parse_gtfs_time(time_str: str) -> Tuple[str, int]:
    """
    Parses GTFS time format 'H:MM:SS' or 'HH:MM:SS'.
    GTFS allows hours >= 24 to denote trips operating past midnight on the same service day.
    
    Returns:
        Tuple[str, int]: (normalized_clock_str 'HH:MM:SS', day_offset)
        
    Examples:
        '08:30:00' -> ('08:30:00', 0)
        '24:15:00' -> ('00:15:00', 1)
        '26:40:00' -> ('02:40:00', 1)
        '48:10:00' -> ('00:10:00', 2)
    """
    if not time_str or not isinstance(time_str, str):
        raise ValueError(f"Invalid GTFS time value: '{time_str}'")

    cleaned = time_str.strip()
    match = re.match(r'^(\d{1,2}):(\d{2}):(\d{2})$', cleaned)
    if not match:
        raise ValueError(f"Malformed GTFS time string (expected H:MM:SS or HH:MM:SS): '{cleaned}'")

    hours = int(match.group(1))
    minutes = int(match.group(2))
    seconds = int(match.group(3))

    if hours < 0:
        raise ValueError(f"Negative GTFS hours not permitted: {hours}")
    if minutes < 0 or minutes > 59:
        raise ValueError(f"Invalid GTFS minutes ({minutes}) - must be 00-59: '{cleaned}'")
    if seconds < 0 or seconds > 59:
        raise ValueError(f"Invalid GTFS seconds ({seconds}) - must be 00-59: '{cleaned}'")

    day_offset = hours // 24
    clock_hour = hours % 24

    normalized_clock = f"{clock_hour:02d}:{minutes:02d}:{seconds:02d}"
    return normalized_clock, day_offset


def format_gtfs_time(normalized_clock: str, day_offset: int = 0) -> str:
    """Formats normalized clock back into 24+ hour representation if day_offset > 0."""
    parts = normalized_clock.split(":")
    hours = int(parts[0]) + (day_offset * 24)
    return f"{hours:02d}:{parts[1]}:{parts[2]}"
