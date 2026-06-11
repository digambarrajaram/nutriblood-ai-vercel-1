# 🩸 NutriBlood AI

AI-powered blood report analysis with personalized Indian diet recommendations.

## 🚀 Deploy to Render

### One-click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deploy

1. **Fork/Clone this repo** to your GitHub account.

2. **Create a new Web Service** on [Render](https://dashboard.render.com/).

3. **Connect your GitHub repo** and use these settings:
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variable:**
   - `GROQ_API_KEY` — Get yours from [console.groq.com](https://console.groq.com/)

5. **Deploy!** 🎉

## 🛠️ Local Development

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/nutriblood-ai.git
cd nutriblood-ai

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your API key
# Copy .env.example to .env and add your GROQ_API_KEY

# 5. Run the app
uvicorn app:app --reload
```

Open **http://127.0.0.1:8000** in your browser.

## 📁 Project Structure

```
nutriblood-ai/
├── app.py              # FastAPI web server
├── llm_call.py         # LLM analysis logic (Groq)
├── templates/
│   └── index.html      # Frontend HTML
├── static/
│   ├── css/style.css   # Styles
│   └── js/app.js       # Frontend logic
├── requirements.txt    # Python dependencies
├── render.yaml         # Render deployment config
├── .env.example        # Environment variable template
├── .gitignore
└── blood_work.txt      # Sample blood report for testing
```

## ⚠️ Disclaimer

This is not medical advice. Always consult a qualified doctor.
