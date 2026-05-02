from database import supabase

def get_memory(user_id: str, subject: str):
    result = supabase.table("memory")\
        .select("*")\
        .eq("user_id", user_id)\
        .eq("subject", subject)\
        .execute()
    return result.data[0] if result.data else None

def update_memory(user_id: str, subject: str, weak_areas: list, completed_topics: list, session_notes: str):
    existing = get_memory(user_id, subject)
    if existing:
        supabase.table("memory").update({
            "weak_areas": weak_areas,
            "completed_topics": completed_topics,
            "session_notes": session_notes
        }).eq("id", existing["id"]).execute()
    else:
        supabase.table("memory").insert({
            "user_id": user_id,
            "subject": subject,
            "weak_areas": weak_areas,
            "completed_topics": completed_topics,
            "session_notes": session_notes
        }).execute()

def build_memory_context(user_id: str, subject: str) -> str:
    memory = get_memory(user_id, subject)
    if not memory:
        return "This is the student's first session on this subject."
    return f"""
Previous session notes: {memory['session_notes']}
Topics already completed: {', '.join(memory['completed_topics'])}
Areas the student struggled with: {', '.join(memory['weak_areas'])}
"""
