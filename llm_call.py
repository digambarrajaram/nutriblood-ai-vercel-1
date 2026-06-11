from dotenv import load_dotenv
from langchain_groq import ChatGroq
import json
import re
import os

load_dotenv()

# Lazy initialization - only create the LLM when first needed
_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model="qwen/qwen3-32b",
            temperature=0,
            max_tokens=None,
            reasoning_format="parsed",
            timeout=None,
            max_retries=2,
        )
    return _llm


def _safe_json_parse(text: str):
    """Extract JSON safely from LLM response."""
    try:
        return json.loads(text)
    except:
        # Try to extract JSON block if wrapped in text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
    return None


def analyze_blood_report(blood_report_text: str, diet_type: str = "Vegetarian") -> dict:
    """
    Analyze blood report and return structured JSON output.
    """
    llm = _get_llm()

    prompt = f"""
    You are a medical + nutrition AI.

    STRICTLY return ONLY valid JSON (no explanation, no markdown).

    Format:
    {{
        "summary": "4-5 line simple health summary",
        "extracted_values": [
            {{
                "test": "Hemoglobin",
                "value": "15.1 g/dL",
                "status": "NORMAL"
            }}
        ],
        "foods_to_avoid": ["item1", "item2"],
        "foods_to_eat": ["item1", "item2"]
    }}

    Rules:
    - Status must be ONLY: HIGH, LOW, NORMAL
    - Use Indian diet recommendations
    - Keep food items short (1-3 words)
    - Diet must be suitable for: {diet_type}
    - Do NOT include anything outside JSON

    Blood Report:
    {blood_report_text}
    """

    response = llm.invoke(prompt)
    raw_output = response.content.strip()

    parsed = _safe_json_parse(raw_output)

    # ------------------ FALLBACK (VERY IMPORTANT) ------------------ #
    if not parsed:
        return {
            "summary": "Unable to fully parse report. Please try again.",
            "extracted_values": [],
            "foods_to_avoid": [],
            "foods_to_eat": []
        }

    # ------------------ VALIDATION ------------------ #
    parsed.setdefault("summary", "")
    parsed.setdefault("extracted_values", [])
    parsed.setdefault("foods_to_avoid", [])
    parsed.setdefault("foods_to_eat", [])

    # Normalize statuses
    for item in parsed["extracted_values"]:
        status = item.get("status", "").upper()
        if status not in ["HIGH", "LOW", "NORMAL"]:
            item["status"] = "NORMAL"

    return parsed
