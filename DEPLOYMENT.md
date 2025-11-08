# 🚀 Vercel Deployment Guide - Complete Setup

This guide shows you how to deploy both **Frontend** and **Backend** separately on Vercel.

---

## 📋 **Prerequisites**

1. ✅ GitHub account
2. ✅ Vercel account (sign up at https://vercel.com)
3. ✅ Push your code to GitHub repository
4. ✅ MongoDB Atlas connection string
5. ✅ Groq API key

---

## 🎯 **Deployment Strategy**

We'll deploy **TWO separate projects** from the same repository:

1. **Backend API** → `your-backend.vercel.app`
2. **Frontend App** → `your-frontend.vercel.app`

---

## 🔴 **PART 1: Deploy Backend**

### **Step 1: Push to GitHub**

```bash
cd /Users/christopherbryan.evangelista/Desktop/PROJECTS/AI-ThesisRepository
git init
git add .
git commit -m "Initial commit - AI Thesis Repository"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AI-ThesisRepository.git
git push -u origin main
```

### **Step 2: Create Backend Deployment on Vercel**

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Configure the project:**

**Project Name:** `thesis-repository-backend`

**Root Directory:** `backend` ⚠️ **IMPORTANT**

**Framework Preset:** Other

**Build Settings:**
```
Build Command: npm install
Output Directory: (leave empty)
Install Command: npm install
```

**Environment Variables:** (Click "Add")
```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.2-90b-text-preview
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EMBEDDING_DIMENSIONS=768
FRONTEND_URL=https://your-frontend.vercel.app
```

⚠️ **Note:** Update `FRONTEND_URL` after deploying frontend

5. Click **"Deploy"**

### **Step 3: Add vercel.json to Backend**

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### **Step 4: Test Backend**

After deployment, test:
```bash
curl https://your-backend.vercel.app/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 🟢 **PART 2: Deploy Frontend**

### **Step 1: Update Frontend API URL**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.vercel.app
```

### **Step 2: Create Frontend Deployment on Vercel**

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import the **SAME GitHub repository**
4. **Configure the project:**

**Project Name:** `thesis-repository-frontend`

**Root Directory:** `frontend` ⚠️ **IMPORTANT**

**Framework Preset:** Vite

**Build Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Environment Variables:**
```
VITE_API_URL=https://your-backend.vercel.app
```

⚠️ **Replace with your actual backend URL**

5. Click **"Deploy"**

### **Step 3: Update Backend CORS**

Go back to **backend deployment** → Settings → Environment Variables

Update:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

Then **redeploy** the backend.

---

## 🔧 **Alternative: Manual CLI Deployment**

If you prefer using the Vercel CLI:

### **Install Vercel CLI**
```bash
npm install -g vercel
```

### **Deploy Backend**
```bash
cd backend
vercel --prod
```

### **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

---

## 📁 **Project Structure for Vercel**

```
AI-ThesisRepository/
├── backend/
│   ├── src/
│   ├── server.js          # Entry point
│   ├── package.json
│   └── vercel.json        # Backend config
│
└── frontend/
    ├── src/
    ├── package.json
    ├── vite.config.js
    └── .env.production    # Production API URL
```

---

## ⚙️ **Backend vercel.json Configuration**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

## ⚙️ **Frontend .env.production**

```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## 🎯 **Complete Deployment Checklist**

### **Backend:**
- [ ] Set Root Directory to `backend`
- [ ] Add all environment variables
- [ ] Create `backend/vercel.json`
- [ ] Deploy
- [ ] Test `/health` endpoint
- [ ] Copy backend URL

### **Frontend:**
- [ ] Set Root Directory to `frontend`
- [ ] Create `.env.production` with backend URL
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy
- [ ] Test website
- [ ] Copy frontend URL

### **Final Steps:**
- [ ] Update backend `FRONTEND_URL` with frontend URL
- [ ] Redeploy backend
- [ ] Test CORS (open frontend, check API calls)
- [ ] Test all features

---

## 🐛 **Troubleshooting**

### **Issue 1: Backend 404**
**Solution:** Make sure `vercel.json` is in the `backend/` directory and routes are correct.

### **Issue 2: CORS Error**
**Solution:** 
1. Check `FRONTEND_URL` in backend environment variables
2. Redeploy backend after updating
3. Make sure no typos in URLs

### **Issue 3: API Not Found**
**Solution:**
1. Check `VITE_API_URL` in frontend
2. Rebuild frontend: `npm run build`
3. Redeploy frontend

### **Issue 4: MongoDB Connection Failed**
**Solution:**
1. Check `MONGODB_URI` in backend environment variables
2. Whitelist Vercel IPs in MongoDB Atlas: `0.0.0.0/0`
3. Check network access in Atlas

### **Issue 5: Groq API Error**
**Solution:**
1. Verify `GROQ_API_KEY` is correct
2. Check Groq console for API limits
3. Ensure `NODE_ENV=production` is set

---

## 🔗 **Final URLs**

After deployment, you'll have:

**Backend API:**
```
https://thesis-repository-backend.vercel.app
```

**Frontend App:**
```
https://thesis-repository-frontend.vercel.app
```

**Test them:**
```bash
# Backend
curl https://thesis-repository-backend.vercel.app/health

# Frontend (in browser)
https://thesis-repository-frontend.vercel.app
```

---

## 📊 **Environment Variables Summary**

### **Backend Environment Variables:**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.2-90b-text-preview
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EMBEDDING_DIMENSIONS=768
FRONTEND_URL=https://your-frontend.vercel.app
```

### **Frontend Environment Variables:**
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## 🎉 **Success!**

Both deployments should now be live!

**Test the full flow:**
1. Visit frontend URL
2. Search for a thesis
3. Click on a result
4. Open chatbot
5. Ask a question

Everything should work seamlessly! 🚀

---

## 🔄 **Future Deployments**

After the initial setup, deployments are automatic:

1. **Push to GitHub** → Vercel auto-deploys
2. **Update environment variables** → Redeploy from Vercel dashboard
3. **Check deployment logs** → Vercel dashboard → Deployments

---

## 💡 **Tips**

1. **Custom Domains:** Add custom domains in Vercel dashboard
2. **Preview Deployments:** Every PR gets a preview URL
3. **Logs:** Check function logs in Vercel dashboard
4. **Analytics:** Enable Vercel Analytics for usage stats
5. **Monitoring:** Set up alerts for downtime

---

## 📝 **Quick Commands**

```bash
# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Remove deployment
vercel rm <deployment-name>

# Link project
vercel link
```

---

**Need help?** Check Vercel documentation: https://vercel.com/docs

