from datetime import datetime
from app.algorithms.types import TransportMode, TransferStatus, TransferValidationResult


def get_required_transfer_minutes(
    prev_mode: TransportMode,
    prev_node_id: str,
    next_mode: TransportMode,
    next_node_id: str
) -> int:
    """
    Determines minimum required transfer buffer minutes based on transport modes
    and hub locations.
    """
    # 1. Local-to-Local transfers
    if prev_mode == TransportMode.LOCAL and next_mode == TransportMode.LOCAL:
        return 15

    # 2. Same Hub / Node Transfers
    if prev_node_id == next_node_id:
        if prev_mode == next_mode:
            return 20  # Same terminal & mode
        if {prev_mode, next_mode} == {TransportMode.TRAIN, TransportMode.BUS}:
            return 45  # Train station to Bus stand in same city/hub
        return 30

    # 3. Inter-Node / Inter-Terminal Transfers (requires travel between nodes)
    if {prev_mode, next_mode} == {TransportMode.TRAIN, TransportMode.BUS}:
        return 60  # e.g. Delhi Railway Station to Kashmiri Gate ISBT
    
    return 45


def validate_transfer(
    prev_arrival: datetime,
    prev_mode: TransportMode,
    prev_dest_node_id: str,
    next_departure: datetime,
    next_mode: TransportMode,
    next_source_node_id: str
) -> TransferValidationResult:
    """
    Deterministically validates a transfer connection between two transit segments.
    """
    # Check chronological validity
    if next_departure <= prev_arrival:
        layover = int((next_departure - prev_arrival).total_seconds() / 60)
        return TransferValidationResult(
            status=TransferStatus.INVALID,
            layover_minutes=layover,
            required_minutes=0,
            reason=f"Departure time ({next_departure}) is on or before previous arrival time ({prev_arrival})."
        )

    layover = int((next_departure - prev_arrival).total_seconds() / 60)
    required = get_required_transfer_minutes(
        prev_mode, prev_dest_node_id, next_mode, next_source_node_id
    )

    if layover < required:
        return TransferValidationResult(
            status=TransferStatus.TIGHT,
            layover_minutes=layover,
            required_minutes=required,
            reason=f"Layover of {layover} min is less than required {required} min transfer buffer."
        )

    return TransferValidationResult(
        status=TransferStatus.SAFE,
        layover_minutes=layover,
        required_minutes=required,
        reason=f"Safe connection: {layover} min layover meets required {required} min buffer."
    )
