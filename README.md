# RytMind

Financial wellness web app (React + Vite + Convex + Lindy AI).

## Quick start

```bash
git clone <REPO_URL>
cd rytmind
npm install
```

### Convex setup
1) Start Convex and log in / create project  
   ```bash
   npx convex dev
   ```  
   - This creates your own Convex deployment (e.g., `happy-otter-123.convex.site`) and writes `.env.local` with `CONVEX_DEPLOYMENT`.

2) Set your site URL env var (used for Lindy callbacks)  
   ```bash
   npx convex env set SITE_URL "https://<your-deployment>.convex.site"
   ```
   Replace `<your-deployment>` with the name shown after `npx convex dev`.

### Lindy AI (already wired for you)
- The repo keeps shared Lindy webhook URLs in `convex/lindy.ts` (`LINDY_URLS`), so judges do **not** need to create Lindy agents.
- The app sends data to those agents; Lindy posts results back to **your** Convex site via `SITE_URL/lindy-webhook`.

### Run the app
```bash
# Terminal 1: keep Convex running
npx convex dev

# Terminal 2: Vite dev server
npm run dev
```
Visit the printed localhost URL (default `http://localhost:5173`, may shift if the port is busy).

## Tech stack
- React + Vite + TypeScript
- Convex (backend + serverless functions)
- Lindy AI (analysis)
- Tailwind CSS + shadcn/ui
