import os
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
import llm_call

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2 templates
templates = Jinja2Templates(directory="templates")


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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
