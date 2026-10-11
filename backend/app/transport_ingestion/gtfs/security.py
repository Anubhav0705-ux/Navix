import os
import zipfile
from typing import List


class GtfsSecurityError(Exception):
    """Raised when an untrusted GTFS archive violates security policies."""
    pass


def validate_zip_archive(
    zip_path: str,
    max_uncompressed_bytes: int = 100 * 1024 * 1024,  # 100 MB max
    max_files: int = 500,
    max_compression_ratio: float = 100.0
) -> List[str]:
    """
    Validates a zip archive for security risks:
    1. Zip-Slip (Path traversal using '..' or absolute paths)
    2. Zip-Bomb (Excessive decompressed size or abnormal compression ratios)
    3. File count limits
    """
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"GTFS archive not found at: {zip_path}")

    total_uncompressed = 0
    file_list = []

    with zipfile.ZipFile(zip_path, 'r') as zf:
        infolist = zf.infolist()

        if len(infolist) > max_files:
            raise GtfsSecurityError(
                f"GTFS archive contains {len(infolist)} files, exceeding limit of {max_files}."
            )

        for info in infolist:
            # Check for path traversal / zip slip
            norm_name = os.path.normpath(info.filename)
            if norm_name.startswith("..") or os.path.isabs(norm_name) or ".." in norm_name.split(os.sep):
                raise GtfsSecurityError(
                    f"Zip-slip path traversal attempt detected in entry: {info.filename}"
                )

            # Check uncompressed size
            total_uncompressed += info.file_size
            if total_uncompressed > max_uncompressed_bytes:
                raise GtfsSecurityError(
                    f"Decompressed size exceeds limit of {max_uncompressed_bytes} bytes."
                )

            # Check compression ratio for non-empty files
            if info.compress_size > 0:
                ratio = info.file_size / info.compress_size
                if ratio > max_compression_ratio and info.file_size > 1024 * 1024:
                    raise GtfsSecurityError(
                        f"Zip-bomb suspicious compression ratio ({ratio:.1f}) in {info.filename}."
                    )

            file_list.append(info.filename)

    return file_list


def safe_extract_zip(zip_path: str, target_dir: str) -> List[str]:
    """Safely extracts zip contents only within the designated target_dir."""
    validate_zip_archive(zip_path)
    os.makedirs(target_dir, exist_ok=True)
    real_target = os.path.realpath(target_dir)

    extracted_files = []
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for member in zf.infolist():
            dest = os.path.realpath(os.path.join(real_target, member.filename))
            if not dest.startswith(real_target + os.sep) and dest != real_target:
                raise GtfsSecurityError(
                    f"Extraction target '{dest}' resolves outside '{real_target}'."
                )
            if member.is_dir():
                os.makedirs(dest, exist_ok=True)
            else:
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with zf.open(member) as source, open(dest, 'wb') as target:
                    target.write(source.read())
                extracted_files.append(dest)

    return extracted_files
