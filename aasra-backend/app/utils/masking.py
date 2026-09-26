def mask_identifier(identifier: str | None) -> str:
    """Mask account/policy numbers showing only the last 4 characters.
    
    Example:
        '9876543210' -> '******3210'
        '123' -> '****123'
    """
    if not identifier:
        return ""
    clean = str(identifier).strip()
    if len(clean) <= 4:
        return "*" * 4 + clean
    return "*" * (len(clean) - 4) + clean[-4:]
