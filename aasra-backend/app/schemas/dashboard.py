from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.asset import AssetResponse
from app.schemas.task import TaskResponse

class DashboardMetrics(BaseModel):
    assets_found: int
    liabilities_found: int
    high_priority_tasks: int
    claims_in_progress: int
    documents_missing: int
    closure_percentage: int
    needs_verification: int

class ConfidenceBreakdown(BaseModel):
    high_confidence: int
    medium_confidence: int
    needs_verification: int

class AnalysisResponse(BaseModel):
    status: str
    case_id: str
    documents_analyzed: int
    assets_found: int
    tasks_generated: int
    confidence_breakdown: ConfidenceBreakdown
    discovered_assets: List[AssetResponse]
    generated_tasks: List[TaskResponse]
