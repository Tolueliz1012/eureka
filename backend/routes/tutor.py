from fastapi import APIRouter
from pydantic import BaseModel
from services.claude import chat_with_tutor
from services.memory import update_memory
from services.learning_style import detect_style_from_message
from database import supabase
import json

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    user_name: str
    subject: str
    current_topic: str
    messages: list

@router.post("/chat")
async def chat(req: ChatRequest):
    # Auto-create user if not exists
    user = supabase.table("users").select("*").eq("id", req.user_id).execute()
    if not user.data:
        supabase.table("users").insert({
            "id": req.user_id,
            "name": req.user_name,
            "learning_style": "unknown"
        }).execute()
        user = supabase.table("users").select("*").eq("id", req.user_id).execute()
    learning_style = user.data[0]["learning_style"] if user.data else "unknown"

    last_msg = req.messages[-1]["content"] if req.messages else ""
    detected = detect_style_from_message(last_msg)
    if detected and detected != learning_style:
        supabase.table("users").update({"learning_style": detected}).eq("id", req.user_id).execute()
        learning_style = detected

    reply = chat_with_tutor(
        messages=req.messages,
        user_name=req.user_name,
        subject=req.subject,
        current_topic=req.current_topic,
        learning_style=learning_style,
        user_id=req.user_id
    )

    if "{" in reply and "session_summary" in reply:
        try:
            start = reply.index("{")
            end = reply.rindex("}") + 1
            summary = json.loads(reply[start:end])
            update_memory(
                user_id=req.user_id,
                subject=req.subject,
                weak_areas=summary.get("weak_areas", []),
                completed_topics=summary.get("completed_topics", []),
                session_notes=summary.get("session_summary", "")
            )
        except:
            pass

    return {"reply": reply, "learning_style": learning_style}
