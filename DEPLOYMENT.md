# 🚀 Deployment Guide

Complete guide to deploy Active Sports Management System to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase project setup completed

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Setup Supabase for Production

1. Verify `supabase-schema.sql` has been executed
2. Create admin user:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

3. Get API credentials from Settings → API

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to vercel.com → "Add New" → "Project"
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Add Environment Variables:
   - `VITE_SUPABASE_URL`: your_supabase_url
   - `VITE_SUPABASE_ANON_KEY`: your_anon_key

5. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### 4. Post-Deployment Checks

- Test authentication
- Create test tournament
- Import players
- Generate bracket
- Test on mobile

## 🔒 Security Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase RLS policies enabled
- [ ] `.env` file in `.gitignore`
- [ ] Admin role manually assigned
- [ ] HTTPS enabled

## 📊 Monitoring

- Vercel Dashboard for deployment logs
- Supabase Dashboard for database metrics

## 🐛 Troubleshooting

**Build Fails**: Check environment variables in Vercel
**"Failed to fetch"**: Verify Supabase URL and keys
**Unauthorized errors**: Check RLS policies

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Admin user created
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] All features tested

---

Congratulations! Your system is now live! 🎊
