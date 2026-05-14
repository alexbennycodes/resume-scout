"""Resume matching API endpoints for SaaS."""

import logging
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_auth, AuthUser
from app.database import db
from app.services.usage import usage_tracker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/matching", tags=["matching"])


MATCH_PROMPT = """You are a resume matching expert. Analyze how well a resume matches a job description.

Resume:
{resume}

Job Description:
{job}

Provide a JSON response with:
{{
    "match_score": <score 0-100>,
    "strengths": ["list of resume strengths for this job"],
    "gaps": ["list of missing skills/experience"],
    "recommendations": ["specific suggestions to improve the resume for this role"]
}}
"""


@router.post("/score/{resume_id}/{job_id}")
async def score_resume_job_match(
    resume_id: str,
    job_id: str,
    current_user: AuthUser = Depends(require_auth),
) -> dict:
    """Score how well a resume matches a job description.

    Returns a match score and recommendations for improvement.
    Requires authentication.
    """
    # Check usage limit
    allowed, message, _ = usage_tracker.check_limit(
        current_user.user_id,
        usage_tracker.ACTION_RESUME_TAILOR,
    )
    if not allowed:
        raise HTTPException(status_code=403, detail=message)

    # Get resume
    try:
        resume_uuid = UUID(resume_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid resume ID")

    resume = db.get_resume(resume_uuid, current_user.user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Get job
    try:
        job_uuid = UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = db.get_job(job_uuid, current_user.user_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get processed resume data
    processed_data = resume.get("processed_data", {})
    if not processed_data:
        raise HTTPException(
            status_code=400,
            detail="Resume not processed. Please upload and process first.",
        )

    # Build resume text from processed data
    resume_text = _build_resume_text(processed_data)
    job_content = job.get("content", "")

    # Call LLM for matching
    try:
        from app.llm import complete_json

        prompt = MATCH_PROMPT.format(resume=resume_text, job=job_content)
        result = complete_json(
            prompt=prompt,
            system_prompt="You are a resume matching expert. Provide detailed, actionable feedback.",
            max_tokens=2000,
            schema_type="enrichment",
        )

        # Log usage
        usage_tracker.log_action(
            user_id=current_user.user_id,
            action_type=usage_tracker.ACTION_RESUME_TAILOR,
        )

        return {
            "resume_id": resume_id,
            "job_id": job_id,
            "match_data": result,
        }

    except Exception as e:
        logger.error(f"Resume matching failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze resume-job match",
        )


def _build_resume_text(processed_data: dict) -> str:
    """Build a text representation of the resume for LLM analysis."""
    parts = []

    # Summary
    if summary := processed_data.get("summary"):
        parts.append(f"Summary: {summary}")

    # Work Experience
    for exp in processed_data.get("workExperience", []):
        title = exp.get("title", "")
        company = exp.get("company", "")
        desc = " ".join(exp.get("description", []))
        parts.append(f"Experience: {title} at {company}. {desc}")

    # Education
    for edu in processed_data.get("education", []):
        degree = edu.get("degree", "")
        institution = edu.get("institution", "")
        parts.append(f"Education: {degree} at {institution}")

    # Skills
    if skills := processed_data.get("additional", {}).get("technicalSkills", []):
        parts.append(f"Skills: {', '.join(skills)}")

    return "\n\n".join(parts)