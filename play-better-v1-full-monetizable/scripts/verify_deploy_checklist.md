Deploy Verification Checklist

Backend (Railway)
- Root dir: backend/
- Env:
  DATABASE_URL=<railway postgres>
  CORS_ORIGINS=https://play-better.buildhub.live,http://localhost:5173
- Confirm:
  GET https://<railway-domain>/api/health => {"status":"ok"}

Frontend (Vercel)
- Root dir: frontend/
- Env:
  VITE_API_URL=https://api.play-better.buildhub.live
- Confirm:
  App loads and API badge says online

DNS (Namecheap)
- CNAME play-better -> cname.vercel-dns.com
- CNAME api.play-better -> <railway-domain>
