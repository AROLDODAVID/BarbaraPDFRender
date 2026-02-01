# BarbaraPDFRender
Render
# BarbaraPDF Backend

Backend server for AI Tutor functionality using OpenAI API.

## Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo (`BarbaraPDFRender`)
5. Settings:
   - Name: `barbarapdf-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI key from https://platform.openai.com/api-keys
   - `ALLOWED_ORIGINS`: `https://barbarapdfeditor.net,https://vitesite-4.sg-host.com`
7. Click "Create Web Service"

Render will give you a URL like: `https://barbarapdf-backend.onrender.com`

## API Endpoints

### Health Check
Returns server status and OpenAI configuration.

**Example response:**
```json
{
  "status": "ok",
  "message": "BarbaraPDF Backend Running",
  "openaiConfigured": true
}
