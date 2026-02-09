# Deployment Guide - SwipeUpRight Platform

Complete guide for deploying the SwipeUpRight matching platform (Rails API + React Frontend).

## 🎯 Recommended Platform Combinations

### Option 1: **Render + Vercel** (⭐ RECOMMENDED - Best Balance)

**Backend:** Render (Rails API)  
**Frontend:** Vercel (React/Vite)  
**Database:** Render PostgreSQL (or external)

**Pros:**
- ✅ Both have generous free tiers
- ✅ Easy deployment with Git integration
- ✅ Excellent documentation
- ✅ Automatic SSL certificates
- ✅ Great performance
- ✅ Render supports Rails natively
- ✅ Vercel optimized for React/Vite

**Cons:**
- ⚠️ Free tier has limitations (sleeps after inactivity on Render)
- ⚠️ Need to manage two platforms

**Cost:** Free tier available, ~$7-25/month for production

---

### Option 2: **Railway** (⭐ EASIEST - All-in-One)

**Backend:** Railway (Rails API)  
**Frontend:** Railway (React/Vite)  
**Database:** Railway PostgreSQL

**Pros:**
- ✅ Single platform for everything
- ✅ Very easy setup
- ✅ Automatic deployments from Git
- ✅ Built-in PostgreSQL
- ✅ Great developer experience
- ✅ Free tier with $5 credit/month

**Cons:**
- ⚠️ Can get expensive at scale
- ⚠️ Less mature than Render/Vercel

**Cost:** $5/month credit, then pay-as-you-go (~$10-30/month)

---

### Option 3: **Fly.io + Vercel** (⭐ BEST PERFORMANCE)

**Backend:** Fly.io (Rails API)  
**Frontend:** Vercel (React/Vite)  
**Database:** Fly.io PostgreSQL or Supabase

**Pros:**
- ✅ Excellent global performance
- ✅ Edge computing
- ✅ Great for Rails
- ✅ Free tier available
- ✅ Very fast deployments

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires Docker knowledge

**Cost:** Free tier available, ~$5-20/month

---

### Option 4: **Heroku + Netlify** (Classic but Expensive)

**Backend:** Heroku (Rails API)  
**Frontend:** Netlify (React/Vite)  
**Database:** Heroku Postgres

**Pros:**
- ✅ Very mature platform
- ✅ Excellent documentation
- ✅ Easy deployment
- ✅ Great add-ons ecosystem

**Cons:**
- ❌ Expensive ($7+/month minimum)
- ❌ No free tier anymore
- ❌ Can get costly at scale

**Cost:** ~$7-50+/month

---

## 🚀 Recommended: Render + Vercel Setup

### Prerequisites

1. GitHub account (for Git integration)
2. AWS account (for S3 - already configured)
3. Render account (sign up at https://render.com)
4. Vercel account (sign up at https://vercel.com)

---

## 📦 Backend Deployment (Render)

### Step 1: Prepare Backend for Production

Create these files in your `backend/` directory:

#### `backend/Procfile`
```procfile
web: bundle exec puma -C config/puma.rb
release: bundle exec rails db:migrate
```

#### `backend/config/puma.rb` (if not exists)
```ruby
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

worker_timeout 3600 if ENV.fetch("RAILS_ENV", "development") == "development"

port ENV.fetch("PORT") { 3000 }

environment ENV.fetch("RAILS_ENV") { "development" }

pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

workers ENV.fetch("WEB_CONCURRENCY") { 2 }

preload_app!

plugin :tmp_restart
```

#### `backend/config/environments/production.rb` (update CORS)
```ruby
# Add this to your existing production.rb
config.hosts.clear # Allow all hosts

# CORS configuration
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*' # In production, replace with your Vercel domain
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end
```

#### `backend/.env.production.example`
```env
# Database (provided by Render)
DATABASE_URL=postgresql://...

# Rails
RAILS_ENV=production
SECRET_KEY_BASE=your_secret_key_base_here
RAILS_MASTER_KEY=your_master_key_here

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Active Storage
RAILS_STORAGE_SERVICE=aws

# CORS (your Vercel frontend URL)
FRONTEND_URL=https://your-app.vercel.app
```

### Step 2: Deploy to Render

1. **Create Web Service:**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name:** `swipeupright-api`
     - **Root Directory:** `backend`
     - **Environment:** `Ruby`
     - **Build Command:** `bundle install && bundle exec rails assets:precompile RAILS_ENV=production`
     - **Start Command:** `bundle exec puma -C config/puma.rb`
     - **Instance Type:** Free tier (or paid for production)

2. **Create PostgreSQL Database:**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `swipeupright-db`
   - Plan: Free (or paid for production)
   - Copy the **Internal Database URL**

3. **Set Environment Variables:**
   In your Render Web Service → Environment:
   ```
   RAILS_ENV=production
   DATABASE_URL=<from PostgreSQL service>
   SECRET_KEY_BASE=<generate with: rails secret>
   RAILS_MASTER_KEY=<from config/master.key>
   AWS_ACCESS_KEY_ID=<your_aws_key>
   AWS_SECRET_ACCESS_KEY=<your_aws_secret>
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=<your_bucket_name>
   RAILS_STORAGE_SERVICE=aws
   ```

4. **Deploy:**
   - Render will automatically deploy on push to main branch
   - Or click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://swipeupright-api.onrender.com`)

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

#### `frontend/.env.production`
```env
VITE_API_BASE_URL=https://swipeupright-api.onrender.com/api/v1
```

#### `frontend/vercel.json` (optional - for SPA routing)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI (Recommended)**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Via GitHub Integration**
1. Go to https://vercel.com → Add New Project
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Set Environment Variables:**
   ```
   VITE_API_BASE_URL=https://swipeupright-api.onrender.com/api/v1
   ```

5. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main
   - Copy your frontend URL (e.g., `https://swipeupright.vercel.app`)

### Step 3: Update Backend CORS

Update your Render backend environment variable:
```
FRONTEND_URL=https://swipeupright.vercel.app
```

And update `backend/config/environments/production.rb`:
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL'] || 'https://swipeupright.vercel.app'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end
```

---

## 🚂 Alternative: Railway Deployment (All-in-One)

### Backend Setup on Railway

1. **Sign up:** https://railway.app
2. **New Project** → Deploy from GitHub
3. **Add PostgreSQL:**
   - Click "+ New" → Database → PostgreSQL
   - Railway automatically provides `DATABASE_URL`

4. **Add Backend Service:**
   - Click "+ New" → GitHub Repo → Select repo
   - Set Root Directory: `backend`
   - Railway auto-detects Rails
   - Add environment variables:
     ```
     RAILS_ENV=production
     SECRET_KEY_BASE=<generate>
     AWS_ACCESS_KEY_ID=<your_key>
     AWS_SECRET_ACCESS_KEY=<your_secret>
     AWS_REGION=us-east-1
     AWS_S3_BUCKET=<your_bucket>
     RAILS_STORAGE_SERVICE=aws
     ```
   - Generate domain: Railway provides URL automatically

### Frontend Setup on Railway

1. **Add Frontend Service:**
   - Click "+ New" → GitHub Repo → Select repo
   - Set Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
   - Add environment variable:
     ```
     VITE_API_BASE_URL=<your-railway-backend-url>/api/v1
     ```
   - Generate domain

2. **Update Backend CORS** with Railway frontend URL

---

## 🔧 Post-Deployment Checklist

### Backend
- [ ] Database migrations run successfully
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend domain
- [ ] AWS S3 credentials working
- [ ] SSL certificate active
- [ ] Health check endpoint working

### Frontend
- [ ] API URL configured correctly
- [ ] Environment variables set
- [ ] Build completes successfully
- [ ] All routes working (SPA routing)
- [ ] Images loading correctly
- [ ] API calls working

### Testing
- [ ] Sign up works
- [ ] Login works
- [ ] Profile creation works
- [ ] Image uploads work
- [ ] Search works
- [ ] Messaging works
- [ ] Notifications work

---

## 📊 Platform Comparison

| Feature | Render | Railway | Fly.io | Heroku |
|---------|--------|---------|--------|--------|
| **Free Tier** | ✅ Yes | ✅ $5 credit | ✅ Yes | ❌ No |
| **Rails Support** | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Excellent |
| **PostgreSQL** | ✅ Included | ✅ Included | ⚠️ External | ✅ Add-on |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost (Prod)** | $7-25/mo | $10-30/mo | $5-20/mo | $7-50+/mo |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |

---

## 🎯 Final Recommendation

**For Production:** Use **Render (Backend) + Vercel (Frontend)**
- Best balance of features, cost, and ease
- Both have excellent free tiers for testing
- Production-ready with minimal setup

**For Quick Testing:** Use **Railway (Both)**
- Single platform
- Fastest setup
- Good for MVP/testing

---

## 📝 Additional Files Needed

### `backend/config/master.key`
Keep this file secure and add to Render environment variables as `RAILS_MASTER_KEY`

### `backend/.gitignore` (ensure these are ignored)
```
.env
.env.production
config/master.key
*.log
tmp/
storage/
```

### `frontend/.gitignore` (ensure these are ignored)
```
.env
.env.local
.env.production
dist/
node_modules/
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong `SECRET_KEY_BASE`
- [ ] Configure CORS properly (not `*` in production)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring/alerts

---

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Rails Deployment:** https://guides.rubyonrails.org/deployment.html
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

---

## 🆘 Troubleshooting

### Backend Issues

**Database Connection Error:**
- Check `DATABASE_URL` environment variable
- Ensure PostgreSQL service is running
- Check database credentials

**Asset Precompilation Fails:**
- Remove asset precompilation if not using assets
- Or ensure all assets are present

**CORS Errors:**
- Verify `FRONTEND_URL` matches your frontend domain exactly
- Check CORS configuration in `production.rb`

### Frontend Issues

**API Calls Failing:**
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS configuration on backend
- Verify backend is running and accessible

**Build Fails:**
- Check Node.js version compatibility
- Clear `node_modules` and reinstall
- Check for TypeScript/ESLint errors

**Routing Issues:**
- Ensure `vercel.json` has rewrite rules for SPA
- Check that all routes redirect to `index.html`

---

## 💰 Cost Estimation

### Render + Vercel (Recommended)
- **Backend:** Free tier (sleeps) or $7/month (always on)
- **Database:** Free tier (90 days) or $7/month
- **Frontend:** Free (unlimited)
- **Total:** $0-14/month (free tier) or $14/month (production)

### Railway (All-in-One)
- **Backend:** ~$5-10/month
- **Database:** Included
- **Frontend:** ~$5/month
- **Total:** ~$10-15/month

### Fly.io + Vercel
- **Backend:** Free tier or ~$5-10/month
- **Database:** Free (Supabase) or ~$5/month
- **Frontend:** Free (Vercel)
- **Total:** $0-15/month

---

## 🚀 Quick Start Commands

### Render Deployment
```bash
# Generate secret key
cd backend
rails secret

# Commit and push
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Vercel Deployment
```bash
cd frontend
vercel --prod
```

### Railway Deployment
```bash
# Just push to GitHub, Railway auto-deploys
git push origin main
```

---

Need help? Check the platform-specific documentation or contact support!

