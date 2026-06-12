import os
from pathlib import Path
from fastapi import FastAPI, Form, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
import llm_call
import blood_img_llm_call

app = FastAPI()

# Get the absolute path to the project root
BASE_DIR = Path(__file__).resolve().parent

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
        # Call your existing logic
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


@app.post("/analyze-image")
async def analyze_image(
    blood_report_image: UploadFile = File(...),
    diet_preference: str = Form(...)
):
    try:
        # Read uploaded image bytes
        image_bytes = await blood_report_image.read()

        # Validate file type
        if not blood_report_image.content_type or not blood_report_image.content_type.startswith("image/"):
            return JSONResponse(
                {"status": "error", "message": "Please upload a valid image file (PNG, JPG, etc.)"},
                status_code=400
            )

        # Call image analysis logic
        result = blood_img_llm_call.analyze_blood_report_image(image_bytes, diet_preference)

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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
