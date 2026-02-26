# 🚀 Mission Control Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account (free tier works)
- Vercel CLI: `npm install -g vercel`
- GitHub repository access

### Step 1: Connect Repository to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Select GitHub repository `agentictheo/mission-control`
4. Click "Import"

**Option B: Via Vercel CLI**
```bash
cd /home/Theo/.openclaw/workspace/mission-control
vercel --prod
```

### Step 2: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://fywmglfnjkoopcvnzvoy.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | From Supabase → Settings → API |
| `VITE_API_URL` | See below | Depends on where Gateway runs |

### VITE_API_URL Options

Choose based on your Gateway location:

**If Gateway runs locally (dev):**
```
VITE_API_URL=http://localhost:18789
```

**If Gateway runs on a remote server:**
```
VITE_API_URL=https://gateway.your-domain.com
```

**If Gateway runs on Vercel:**
```
VITE_API_URL=https://gateway-api.vercel.app
```

> ⚠️ **Important:** For remote deployments, you'll need to configure CORS on the Gateway API to allow requests from your Vercel domain (e.g., `mission-control.vercel.app`).

### Step 3: Deploy

**Via Vercel Dashboard:**
- Automatic deployment on every GitHub push to `main` branch
- View deployments at https://vercel.com/your-username/mission-control

**Via Vercel CLI:**
```bash
vercel --prod
```

**Output:**
```
✅ Production: mission-control.vercel.app
```

### Step 4: Test

1. Open https://mission-control.vercel.app
2. Check browser console for errors (F12 → Console)
3. Monitor System Health → Gateway status should show:
   - **Online** if Gateway is accessible
   - **Offline** if Gateway is unreachable (shows diagnostic info)

---

## Local Development Deployment

If you want to serve locally with production-like setup:

```bash
npm run build
npm run preview
```

Then visit http://localhost:4173

---

## Troubleshooting

### ❌ "Gateway unreachable" after deployment

**Problem:** Dashboard deployed but shows Gateway offline

**Solutions:**
1. Check `VITE_API_URL` is set correctly in Vercel
2. Verify Gateway is running and accessible from Vercel region
3. If Gateway is local: Use SSH tunnel or expose via ngrok/tunnel service
4. Check CORS headers on Gateway API

**Test from production:**
```javascript
// In browser console on deployed site:
fetch('YOUR_VITE_API_URL/api/status')
  .then(r => r.json())
  .then(d => console.log('OK:', d))
  .catch(e => console.error('Error:', e))
```

### ❌ "Missing Supabase environment variables"

**Problem:** Warning in console about missing VITE_SUPABASE_URL/KEY

**Solution:** Add environment variables to Vercel (see Step 2)

### ❌ White screen after deployment

**Problem:** App loads but nothing renders

**Solutions:**
1. Check browser console for errors (F12 → Console)
2. Verify all environment variables are set
3. Check that `dist/` folder was built correctly: `npm run build`

---

## Analytics Logging to Supabase

Once deployed, Mission Control will:

1. **Poll Gateway** every 30 seconds from `VITE_API_URL/api/status`
2. **Log data** to Supabase tables:
   - `system_health` — system status snapshots
   - `agent_status` — agent activity tracking
   - `cron_jobs` — scheduled job health
   - `model_usage` — token usage by bot

3. **Verify logging:**
   ```sql
   -- In Supabase SQL Editor
   SELECT COUNT(*) FROM system_health;
   SELECT * FROM system_health ORDER BY created_at DESC LIMIT 10;
   ```

---

## Rolling Back

If deployment has issues, rollback to previous version:

**Via Vercel Dashboard:**
- Deployments tab → Select previous deployment → "Promote to Production"

**Via Vercel CLI:**
```bash
vercel rollback --prod
```

---

## Performance Tips

- Dashboard is lightweight (~112 KB gzipped)
- Caching: Browser caches CSS/JS, data updated every 30s
- CDN: Vercel CDN serves globally with low latency
- Monitoring: Check Vercel Analytics for real-time usage

---

## Support

Issues during deployment?

1. Check build logs in Vercel Dashboard
2. Check browser console for client-side errors
3. Verify Gateway is accessible: `curl $VITE_API_URL/api/status`
4. Check environment variables match `.env.local` locally

---

**Built by Elia for Mission Control**  
Last updated: 2026-02-26
