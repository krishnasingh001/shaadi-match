# Quick Start Deployment Guide

## 🚀 Fastest Deployment: Railway (Recommended for MVP)

### Why Railway?
- ✅ Deploy both frontend and backend in 10 minutes
- ✅ Free $5 credit monthly
- ✅ Automatic PostgreSQL database
- ✅ One-click GitHub deployment
- ✅ Built-in SSL certificates

### Step-by-Step:

#### 1. Backend Deployment (5 minutes)

1. **Sign up:** https://railway.app (use GitHub)
2. **New Project** → Deploy from GitHub repo
3. **Add PostgreSQL:**
   - Click "+ New" → Database → PostgreSQL
   - Railway auto-creates database
4. **Configure Backend:**
   - Click "+ New" → GitHub Repo → Select your repo
   - Set **Root Directory:** `backend`
   - Railway auto-detects Rails
   - Add environment variables:
     ```
     RAILS_ENV=production
     SECRET_KEY_BASE=<run: rails secret in local backend>
     RAILS_MASTER_KEY=<copy from backend/config/master.key>
     AWS_ACCESS_KEY_ID=<your_aws_key>
     AWS_SECRET_ACCESS_KEY=<your_aws_secret>
     AWS_REGION=us-east-1
     AWS_S3_BUCKET=<your_bucket_name>
     RAILS_STORAGE_SERVICE=aws
     DATABASE_URL=<auto-filled from PostgreSQL>
     ```
5. **Generate Domain:**
   - Click on service → Settings → Generate Domain
   - Copy URL (e.g., `https://swipeupright-api.up.railway.app`)

#### 2. Frontend Deployment (5 minutes)

1. **Add Frontend Service:**
   - In same Railway project, click "+ New" → GitHub Repo
   - Set **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l $PORT`
   - Add environment variable:
     ```
     VITE_API_BASE_URL=<your-backend-url>/api/v1
     ```
2. **Generate Domain:**
   - Click on frontend service → Settings → Generate Domain
   - Copy URL (e.g., `https://swipeupright.up.railway.app`)

#### 3. Update CORS

Update backend environment variable:
```
FRONTEND_URL=<your-frontend-railway-url>
```

Redeploy backend (Railway auto-redeploys on env var change).

**Done!** Your app is live! 🎉

---

## 🎯 Production Deployment: Render + Vercel

### Backend on Render (15 minutes)

1. **Sign up:** https://render.com
2. **New Web Service:**
   - Connect GitHub repo
   - Settings:
     - Name: `swipeupright-api`
     - Root Directory: `backend`
     - Environment: `Ruby`
     - Build: `bundle install && bundle exec rails assets:precompile RAILS_ENV=production`
     - Start: `bundle exec puma -C config/puma.rb`
3. **Add PostgreSQL:**
   - New → PostgreSQL
   - Copy Internal Database URL
4. **Environment Variables:**
   ```
   RAILS_ENV=production
   DATABASE_URL=<from_postgres>
   SECRET_KEY_BASE=<rails secret>
   RAILS_MASTER_KEY=<from master.key>
   AWS_ACCESS_KEY_ID=<your_key>
   AWS_SECRET_ACCESS_KEY=<your_secret>
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=<your_bucket>
   RAILS_STORAGE_SERVICE=aws
   FRONTEND_URL=<will_update_after_frontend_deploy>
   ```
5. **Deploy** → Copy URL

### Frontend on Vercel (5 minutes)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Or via web:
1. https://vercel.com → Import Project
2. Select repo → Root: `frontend`
3. Environment: `VITE_API_BASE_URL=<render-backend-url>/api/v1`
4. Deploy

Update Render backend `FRONTEND_URL` with Vercel URL.

**Done!** 🚀

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] `Procfile` exists
- [ ] `config/puma.rb` configured
- [ ] `SECRET_KEY_BASE` generated (`rails secret`)
- [ ] `config/master.key` secured
- [ ] AWS S3 bucket created and configured
- [ ] CORS configured (will update with frontend URL)
- [ ] Database migrations ready

### Frontend
- [ ] `vercel.json` exists (for Vercel)
- [ ] `.env.production` configured
- [ ] Build works locally (`npm run build`)
- [ ] API URL points to backend

---

## 🔧 Generate Required Keys

```bash
# In backend directory
cd backend

# Generate SECRET_KEY_BASE
rails secret
# Copy output to deployment platform env vars

# Get RAILS_MASTER_KEY
cat config/master.key
# Copy to deployment platform env vars
```

---

## 💡 Pro Tips

1. **Start with Railway** - Fastest to get running
2. **Move to Render+Vercel** - Better for production
3. **Use environment variables** - Never hardcode secrets
4. **Test locally first** - Run `RAILS_ENV=production rails s` to test
5. **Monitor logs** - Check deployment logs for errors
6. **Database backups** - Enable automatic backups
7. **Custom domains** - Add your domain after initial deployment

---

## 🆘 Common Issues

**Backend won't start:**
- Check `SECRET_KEY_BASE` is set
- Verify `DATABASE_URL` is correct
- Check logs for specific errors

**Frontend can't connect:**
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on backend
- Ensure backend is running

**Database errors:**
- Run migrations: `rails db:migrate`
- Check database credentials
- Verify database is accessible

---

## 📞 Need Help?

- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

