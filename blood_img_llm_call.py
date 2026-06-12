import base64
import json
import re
import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

# Lazy initialization
_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model_name="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.0
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


def encode_image_bytes(image_bytes: bytes) -> str:
    """Encode raw image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def analyze_blood_report_image(image_bytes: bytes, diet_type: str = "Vegetarian") -> dict:
    """
    Analyze blood report from an image and return structured JSON output.
    Uses Groq's vision model to extract text from the image, then returns
    the same structured format as the text-based analyze_blood_report().
    """
    llm = _get_llm()

    base64_string = encode_image_bytes(image_bytes)

    prompt = f"""
    You are a medical + nutrition AI.

    Analyze the blood report image provided and return a structured analysis.

    STRICTLY return ONLY valid JSON (no explanation, no markdown).

    Format:
    {{
        "summary": "4-5 line simple health summary based on the blood report values seen in the image",
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
    - Extract all visible test names, values, and reference ranges from the image
    - Status must be ONLY: HIGH, LOW, NORMAL (compare values against reference ranges in the image)
    - Use Indian diet recommendations
    - Keep food items short (1-3 words)
    - Diet must be suitable for: {diet_type}
    - Do NOT include anything outside JSON
    """

    message_content = [
        {"type": "text", "text": prompt},
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{base64_string}"
            }
        }
    ]

    human_message = HumanMessage(content=message_content)
    response = llm.invoke([human_message])
    raw_output = response.content.strip()

    parsed = _safe_json_parse(raw_output)

    # ------------------ FALLBACK ------------------ #
    if not parsed:
        return {
            "summary": "Unable to fully parse the blood report image. Please try again with a clearer image or use text input.",
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
