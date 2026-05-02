import anthropic
import os
from services.memory import build_memory_context
from services.learning_style import get_style_instruction

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def build_system_prompt(user_name, subject, current_topic, learning_style, user_id):
    memory_context = build_memory_context(user_id, subject)
    style_instruction = get_style_instruction(learning_style)

    return f"""
You are a world-class personalized tutor named Alex. You are tutoring {user_name} on {subject}.

## Current Topic
You are currently teaching: {current_topic}

## Teaching Style
{style_instruction}

## Student Memory (from past sessions)
{memory_context}

## Core Rules
- NEVER just give the answer. Guide the student to it.
- Always check for understanding before moving to the next concept.
- If the student seems confused, try a completely different explanation approach.
- After every 3-4 exchanges, briefly summarize what was covered.
- If the student masters the topic, say: "TOPIC_COMPLETE" at the end of your message.
- If you notice the student struggling, note it as: "WEAK_AREA: <topic>"

## End of Session
When the student says goodbye or ends the session, output a JSON block like this:
{{
  "session_summary": "brief summary",
  "weak_areas": ["topic1", "topic2"],
  "completed_topics": ["topic1"]
}}
"""

def chat_with_tutor(messages, user_name, subject, current_topic, learning_style, user_id):
    system = build_system_prompt(user_name, subject, current_topic, learning_style, user_id)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system,
        messages=messages
    )
    return response.content[0].text
