STYLE_INSTRUCTIONS = {
    "examples": "Always teach by showing 2-3 worked examples before explaining the concept. Say 'Let me show you an example first.'",
    "socratic": "Never give answers directly. Ask guiding questions to help the student discover the answer themselves.",
    "visual":   "Use analogies, real-world comparisons, and described concepts visually. Use phrases like 'Imagine...' or 'Think of it like...'",
    "direct":   "Be concise and clear. State the concept plainly, give one example, then quiz the student.",
    "unknown":  "Try a balanced approach. After your first explanation, ask: 'Would you like more examples, or shall I ask you questions to test your understanding?'"
}

def get_style_instruction(learning_style: str) -> str:
    return STYLE_INSTRUCTIONS.get(learning_style, STYLE_INSTRUCTIONS["unknown"])

def detect_style_from_message(message: str):
    message = message.lower()
    if any(w in message for w in ["show me", "example", "how does it look"]):
        return "examples"
    if any(w in message for w in ["just tell me", "get to the point", "short"]):
        return "direct"
    if any(w in message for w in ["imagine", "like what", "analogy", "real life"]):
        return "visual"
    return None
