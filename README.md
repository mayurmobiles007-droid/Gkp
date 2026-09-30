# GKP AI Backend — Render Ready

## 1. GitHub
Create a GitHub repository named `GKP-AI-backend` and upload these files.

IMPORTANT:
- Do NOT upload `.env`.
- Do NOT put your API key in `index.html`.
- Do NOT commit your real API key to GitHub.

## 2. Render
In Render:
1. New + → Web Service
2. Connect your GitHub repository
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Create the service

## 3. Environment Variables
In Render → Environment, add:

`OPENAI_API_KEY` = your OpenAI API key

Optional:
`OPENAI_MODEL` = `gpt-5.6-luna`

Then redeploy if Render asks you to.

## 4. Get the backend URL
Render will give you a URL similar to:

https://gkp-ai-backend-xxxx.onrender.com

Test it by opening:

https://YOUR-RENDER-URL.onrender.com/health

You should see:

{"ok":true}

## 5. Connect GKP AI
In your `index.html`, replace the placeholder URL:

const BACKEND_URL =
"https://gkp-ai-backend.onrender.com";

with your actual Render URL.

Example:

const BACKEND_URL =
"https://gkp-ai-backend-xxxx.onrender.com";

Do not add `/api/chat` to BACKEND_URL because the HTML already adds `/api/chat`.
