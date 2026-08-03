# Deployment (public demo)

Two services: Next.js frontend on **Vercel**, Python AG-UI agent on **Render**.

## 1. Agent on Render

1. Render dashboard → New → Blueprint → pick this repo. It reads [render.yaml](render.yaml) and creates the `dynamic-ui-agent` web service from `copilotkit-test/agent`.
2. Set the secret env vars in the Render dashboard (Azure OpenAI):
   - `AZURE_OPENAI_ENDPOINT` — e.g. `https://<resource>.openai.azure.com/`
   - `AZURE_OPENAI_API_KEY` — Azure portal → your OpenAI resource → Keys and Endpoint
   - `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` — your model deployment name (default `gpt-4o-mini`)
   - (Plain OpenAI alternative: unset the Azure vars and set `OPENAI_API_KEY`.)
3. Deploy, then note the service URL, e.g. `https://dynamic-ui-agent.onrender.com`.

The agent binds to Render's injected `PORT` automatically (`AGENT_PORT`/`PORT` fallback in `copilotkit-test/agent/src/main.py`).

## 2. Frontend on Vercel

1. Vercel → New Project → import this repo.
2. **Root Directory**: `copilotkit-test` (framework auto-detects Next.js).
3. Environment variables:

   | Name | Value |
   |------|-------|
   | `AGENT_URL` | `https://dynamic-ui-agent.onrender.com/` (from step 1, trailing slash) |
   | `SARVAM_API_KEY` | your Sarvam subscription key (server-side only) |

4. Deploy. The playground is served at `/`, the IndiGo demo at `/upgd`.

Notes:
- The Windows-only `postinstall` agent setup is skipped automatically on Vercel/CI/Linux.
- Do **not** set `NEXT_PUBLIC_SARVAM_API_KEY` in production — the key would ship to the browser. The `/api/voice/*` proxy routes use `SARVAM_API_KEY`.
- Render free tier sleeps after idle; first request may take ~50 s to cold-start the agent.

## Local dev (unchanged)

```bash
cd copilotkit-test
npm install
npm run dev   # Next.js + agent concurrently (Windows)
```

`.env.local` in `copilotkit-test/`:

```
SARVAM_API_KEY=...
```

`copilotkit-test/agent/.env`:

```
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=gpt-4o-mini
```
