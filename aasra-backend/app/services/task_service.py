import logging
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.task import Task
from app.models.asset import Asset

logger = logging.getLogger(__name__)

TASK_TEMPLATES = {
    "EPF": {
        "title": "Contact EPFO regarding deceased member's PF balance",
        "priority": "HIGH",
        "description": "Submit Form 20 (PF withdrawal), Form 10D (pension), and Form 5IF (EDLI insurance benefit) with original death certificate to the regional EPFO office.",
    },
    "Insurance": {
        "title": "Contact insurance provider — policy claim",
        "priority": "HIGH",
        "description": "Submit death claim intimation with original policy bond, certified death certificate, and claimant/nominee KYC documents.",
    },
    "Loan": {
        "title": "Notify loan provider of demise",
        "priority": "HIGH",
        "description": "Formally inform lending institution of demise, verify if loan protection insurance exists, and obtain full closure statement.",
    },
    "Mutual Fund": {
        "title": "Verify mutual fund folio with AMC/RTA",
        "priority": "MEDIUM",
        "description": "Submit Transmission Request Form (TRF) to CAMS / KFintech along with notarized death certificate and nominee bank details.",
    },
    "Bank Account": {
        "title": "Request bank account settlement and closure",
        "priority": "HIGH",
        "description": "Visit branch manager with death certificate and nominee/legal heir claim forms to transfer balance and close account.",
    }
}


def generate_task_for_asset(
    db: Session,
    case_id: str,
    asset: Asset,
    assigned_to: Optional[str] = None
) -> Optional[Task]:
    """Generate a recommended follow-up task for an identified asset, avoiding duplicates."""
    # Check if a task for this specific asset already exists
    existing = db.query(Task).filter(Task.case_id == case_id, Task.asset_id == asset.id).first()
    if existing:
        logger.info(f"Task already exists for asset {asset.id} in case {case_id}")
        return existing

    template = TASK_TEMPLATES.get(str(asset.category))
    if not template:
        # Fallback generic task
        template = {
            "title": f"Follow up on {asset.category} with {asset.institution}",
            "priority": "MEDIUM",
            "description": f"Verify records and submit claim documentation to {asset.institution}."
        }

    task = Task(
        case_id=case_id,
        asset_id=asset.id,
        title=template["title"],
        description=template["description"],
        priority=template["priority"],
        assigned_to=assigned_to,
        status="pending",
    )
    db.add(task)
    logger.info(f"Generated task '{task.title}' for asset {asset.id}")
    return task


def generate_tasks_for_case_assets(
    db: Session,
    case_id: str,
    assets: List[Asset],
    assigned_to: Optional[str] = None
) -> List[Task]:
    """Auto-generate closing tasks for a list of newly discovered/updated assets."""
    created_tasks = []
    for asset in assets:
        task = generate_task_for_asset(db, case_id, asset, assigned_to=assigned_to)
        if task:
            created_tasks.append(task)
    db.commit()
    for t in created_tasks:
        db.refresh(t)
    return created_tasks
