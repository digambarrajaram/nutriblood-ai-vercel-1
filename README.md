# 🩸 NutriBlood AI

AI-powered blood report analysis with personalized Indian diet recommendations.

## 🚀 Deploy to Vercel

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nutriblood-ai)

### Manual Deploy

1. **Push this repo to GitHub.**

2. **Import the project** on [Vercel](https://vercel.com/new):
   - Connect your GitHub repository
   - Vercel will auto-detect the Python runtime from `vercel.json`

3. **Add Environment Variable:**
   - `GROQ_API_KEY` — Get yours from [console.groq.com](https://console.groq.com/)

4. **Deploy!** 🎉

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
├── api/
│   └── index.py         # Vercel serverless entry point
├── app.py               # FastAPI web server
├── llm_call.py          # LLM analysis logic (Groq)
├── templates/
│   └── index.html       # Frontend HTML
├── static/
│   ├── css/style.css    # Styles
│   └── js/app.js        # Frontend logic
├── requirements.txt     # Python dependencies
├── vercel.json          # Vercel deployment config
├── .env.example         # Environment variable template
├── .gitignore
└── blood_work.txt       # Sample blood report for testing
```

## ⚠️ Disclaimer

This is not medical advice. Always consult a qualified doctor.
