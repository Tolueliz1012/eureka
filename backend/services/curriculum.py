import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def generate_curriculum(subject: str, goal: str, level: str) -> list:
    prompt = f"""
Create a personalized learning curriculum for a student.

Subject: {subject}
Their goal: {goal}
Current level: {level}

Return ONLY a JSON array of 8-12 topic strings, ordered from foundational to advanced.
Example: ["Topic 1", "Topic 2", "Topic 3"]
No explanation, just the JSON array.
"""
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    topics = json.loads(response.content[0].text)
    return topics
