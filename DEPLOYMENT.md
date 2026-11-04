# Deployment Guide - SensorGuard-DT

This guide covers deploying the SensorGuard Digital Twin system to Vercel (frontend) and Render (backend).

## 📋 Pre-Deployment Checklist

- ✅ Dependencies updated to latest versions
- ✅ Security vulnerabilities fixed (Flask-CORS)
- ✅ Environment variables configured
- ✅ Production-ready WSGI server (Gunicorn) added
- ✅ API URLs made configurable via environment variables

## 🚀 Deployment Steps

### 1. Deploy Backend to Render

#### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure the repository is public or accessible to Render

#### Step 2: Create Render Service
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: sensorguard-backend (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --workers 1 --threads 4 --timeout 120 --bind 0.0.0.0:$PORT`

#### Step 3: Environment Variables
Add these environment variables in Render:
- `PYTHON_VERSION`: `3.11`
- `PORT`: `5000`

#### Step 4: Deploy
Click "Create Web Service" and wait for deployment.
Once deployed, copy the backend URL (e.g., `https://sensorguard-backend.onrender.com`)

### 2. Deploy Frontend to Vercel

#### Step 1: Prepare Repository
Ensure your code is pushed to GitHub (same repo as backend is fine)

#### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
   - **Install Command**: `npm install`

#### Step 3: Environment Variables
Add this environment variable in Vercel (Settings → Environment Variables):
- `VITE_API_URL`: Your Render backend URL (e.g., `https://sensorguard-backend.onrender.com`)

**Important**: Vite automatically exposes `VITE_` prefixed variables to the browser. This is safe because API URLs are meant to be public.

#### Step 4: Deploy
Click "Deploy" and wait for deployment.
Once deployed, you'll get a Vercel URL (e.g., `https://sensorguard-frontend.vercel.app`)

## 🔧 Configuration Files Created

### Frontend (Vercel)
- `frontend/vercel.json` - Vercel configuration
- `frontend/.env.example` - Environment variable template
- `frontend/src/config.ts` - Centralized API URL configuration

### Backend (Render)
- `backend/render.yaml` - Render configuration
- `backend/requirements.txt` - Updated with Gunicorn and latest dependencies

## 📦 Updated Dependencies

### Frontend (package.json)
- React: 18.2.0 → 19.3.1
- Vite: 5.0.7 → 8.3.0
- Three.js: 0.159.0 → 0.186.1
- TypeScript: 5.3.2 → 5.7.0
- Recharts: 2.10.3 → 2.15.0
- React Router: 6.20.0 → 7.0.0

### Backend (requirements.txt)
- Flask: 3.0.0 → 3.1.3
- Flask-CORS: 4.0.0 → 6.0.5 (Critical security fix)
- NumPy: 1.26.2 → 2.5.4
- **Added**: Gunicorn 23.0.0 (production WSGI server)

## 🔒 Security Improvements

1. **Flask-CORS**: Updated from 4.0.0 to 6.0.5
   - Fixed multiple CVE vulnerabilities (GHSA-84pr-m4jr-85g5, GHSA-hxwh-jpp2-84pm, etc.)
   - Improved path matching and origin validation

2. **Environment Variables**: API URLs now configurable
   - No hardcoded localhost URLs in production
   - Secure credential management via platform env vars

## 🧪 Testing After Deployment

### Backend Health Check
```bash
curl https://your-backend-url.onrender.com/health
```

### Frontend API Connection
1. Open your Vercel frontend URL
2. Navigate to "Live Operations" page
3. Verify sensor data is streaming
4. Check browser console for any errors

### Known Issues & Solutions

#### SSE Streaming on Render
Render may have timeout issues with long-running SSE connections. If you experience:
- Connection drops after 30-60 seconds
- Intermittent streaming failures

**Solution**: The configuration already includes:
- `--timeout 120` in Gunicorn command
- Threaded execution for better connection handling

#### CORS Issues
If you see CORS errors in browser console:
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check that the backend URL includes `https://` (not `http://`)
3. Ensure Render backend is deployed and accessible

## 📝 Local Development

After deployment, you can still run locally:

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
# Copy .env.example to .env and set VITE_API_URL=http://localhost:5000
npm run dev
```

## 🔄 CI/CD Integration

Both Vercel and Render provide automatic deployments:
- Push to main branch → Automatic deployment
- Pull requests → Preview deployments (Vercel)
- Environment-specific deployments (Render supports multiple services)

## 💡 Cost Estimation

### Render (Backend)
- **Free Tier**: Available for small instances
  - 512 MB RAM
  - 0.1 CPU
  - Spins down after 15 min inactivity
- **Paid**: ~$7/month for basic instance
  - 512 MB RAM - 2 GB RAM
  - Always on
  - Better performance

### Vercel (Frontend)
- **Hobby (Free)**: Perfect for this project
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS
  - No credit card required

## 🆘 Troubleshooting

### Build Failures
- Check dependency versions in package.json/requirements.txt
- Verify Python version compatibility (3.11 recommended)
- Review build logs in Render/Vercel dashboard

### Runtime Errors
- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Verify environment variables are set correctly
- Ensure backend is running before frontend requests

### Performance Issues
- Upgrade Render instance for better performance
- Consider adding Redis for caching if needed
- Monitor resource usage in Render dashboard

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## ✅ Summary

Your SensorGuard-DT project is now:
- ✅ Updated with latest dependencies
- ✅ Security vulnerabilities fixed
- ✅ Configured for Vercel (frontend)
- ✅ Configured for Render (backend)
- ✅ Production-ready with Gunicorn
- ✅ Environment variable support
- ✅ Ready for deployment

Follow the steps above to deploy both services, and your digital twin system will be live!
