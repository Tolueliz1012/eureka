from fastapi import APIRouter
from pydantic import BaseModel
from services.curriculum import generate_curriculum
from database import supabase

router = APIRouter()

class CurriculumRequest(BaseModel):
    user_id: str
    subject: str
    goal: str
    level: str

@router.post("/generate")
async def create_curriculum(req: CurriculumRequest):
    topics = generate_curriculum(req.subject, req.goal, req.level)
    try:
        # Create user if not exists
        existing = supabase.table("users").select("id").eq("id", req.user_id).execute()
        if not existing.data:
            supabase.table("users").insert({
                "id": req.user_id,
                "name": "Student",
                "learning_style": "unknown"
            }).execute()
        # Delete existing curriculum for this subject if any
        supabase.table("curricula").delete().eq("user_id", req.user_id).eq("subject", req.subject).execute()
        # Insert new curriculum
        supabase.table("curricula").insert({
            "user_id": req.user_id,
            "subject": req.subject,
            "topics": topics,
            "current_topic_index": 0
        }).execute()
    except Exception as e:
        print("DB error:", e)
    return {"topics": topics}

@router.get("/get/{user_id}/{subject}")
async def get_curriculum(user_id: str, subject: str):
    result = supabase.table("curricula")\
        .select("*")\
        .eq("user_id", user_id)\
        .eq("subject", subject)\
        .execute()
    return result.data[0] if result.data else None

@router.post("/advance/{curriculum_id}")
async def advance_topic(curriculum_id: str):
    curr = supabase.table("curricula").select("*").eq("id", curriculum_id).execute()
    if curr.data:
        new_index = curr.data[0]["current_topic_index"] + 1
        supabase.table("curricula").update({"current_topic_index": new_index}).eq("id", curriculum_id).execute()
    return {"ok": True}
