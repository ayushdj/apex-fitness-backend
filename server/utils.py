import re


def strip_fences(raw: str) -> str:
    """Remove markdown code fences from a string."""
    return re.sub(r'^```(?:json)?[\r\n]*', '', raw, flags=re.IGNORECASE).rstrip().rstrip('`').strip()


def serialize_doc(doc: dict | None) -> dict | None:
    """Convert MongoDB document ObjectIds to strings."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "userId" in doc:
        doc["userId"] = str(doc["userId"])
    return doc
