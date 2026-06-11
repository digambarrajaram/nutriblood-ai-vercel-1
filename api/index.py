import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import from app.py
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
import llm_call

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# Jinja2 templates
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request, "index.html", {"request": request})


@app.post("/analyze")
async def analyze(
    blood_report: str = Form(...),
    diet_preference: str = Form(...)
):
    try:
        result = llm_call.analyze_blood_report(blood_report, diet_preference)
        return JSONResponse({
            "status": "success",
            "summary": result["summary"],
            "extracted_values": result["extracted_values"],
            "foods_to_avoid": result["foods_to_avoid"],
            "foods_to_eat": result["foods_to_eat"]
        })
    except Exception as e:
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=400
        )
