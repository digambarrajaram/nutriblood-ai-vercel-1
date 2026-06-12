# 🩸 NutriBlood AI

AI-powered blood report analysis with personalized Indian diet recommendations. Paste your blood report as text or upload an image — NutriBlood extracts key biomarkers, flags abnormal values, and suggests foods to eat or avoid based on your results and diet preference.

## ✨ Features

- **📝 Text Input** — Paste raw blood report text for instant analysis
- **📸 Image Upload** — Drag & drop, browse, or paste (Ctrl+V) a blood report screenshot
- **🔬 Biomarker Extraction** — Parses hemoglobin, cholesterol, glucose, and more with HIGH/LOW/NORMAL status
- **🥗 Diet Recommendations** — Personalized Indian diet plan (Vegetarian / Non-Vegetarian / Vegan)
- **📥 Report Download** — Export your analysis as a text file
- **🎨 Modern Dark UI** — Smooth transitions, drag-over effects, loading states, and error feedback

## 🧠 How It Works

1. Choose **Text Input** or **Image Upload** mode
2. Provide your blood report (paste text or upload an image)
3. Select your diet preference
4. The LLM extracts blood values, identifies abnormalities, and generates food recommendations
5. View results across three tabs: Blood Values, Diet Plan, and downloadable Report

## 🛠️ Local Development

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/nutriblood-ai.git
cd nutriblood-ai

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY from https://console.groq.com/

# 5. Run the app
uvicorn app:app --reload
```

Open **http://127.0.0.1:8000** in your browser.

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nutriblood-ai)

1. Push this repo to GitHub
2. Import on [Vercel](https://vercel.com/new) — the Python runtime is auto-detected via `vercel.json`
3. Add environment variable: `GROQ_API_KEY` (from [console.groq.com](https://console.groq.com/))
4. Deploy!

## 📁 Project Structure

```
nutriblood-ai/
├── api/
│   └── index.py              # Vercel serverless entry point
├── app.py                    # FastAPI server with /analyze and /analyze-image endpoints
├── llm_call.py               # LLM logic for text-based blood report analysis
├── blood_img_llm_call.py     # LLM logic for image-based blood report analysis
├── blood_img_analysis.py     # Image preprocessing utilities
├── templates/
│   └── index.html            # Frontend (Jinja2 template)
├── static/
│   ├── css/style.css         # Styles (dark theme, animations, transitions)
│   └── js/app.js             # Frontend logic (upload, paste, drag, analysis flow)
├── images/                   # Sample blood report images for testing
├── requirements.txt          # Python dependencies
├── vercel.json               # Vercel deployment config
├── .env.example              # Environment variable template
└── blood_work.txt            # Sample blood report text for testing
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves the web app |
| `POST` | `/analyze` | Analyzes text blood report (`blood_report`, `diet_preference`) |
| `POST` | `/analyze-image` | Analyzes image blood report (`blood_report_image` file, `diet_preference`) |

Both endpoints return JSON:
```json
{
  "status": "success",
  "summary": "...",
  "extracted_values": [{ "test": "Hemoglobin", "value": "15.1 g/dL", "status": "NORMAL" }],
  "foods_to_avoid": ["fried foods", "..."],
  "foods_to_eat": ["spinach", "..."]
}
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | API key from [console.groq.com](https://console.groq.com/) |

## ⚠️ Disclaimer

**This is not medical advice.** NutriBlood AI is an educational tool powered by a large language model. Results may be inaccurate or incomplete. Always consult a qualified doctor before making dietary or medical decisions based on blood test results.
