# Ranklao Deployment Guide

## Netlify Deployment

### Step 1: Connect GitHub Repository

1. **Login to Netlify**: Go to [netlify.com](https://netlify.com) and sign in
2. **New Site from Git**: Click "New site from Git"
3. **Connect to GitHub**: Choose GitHub as your Git provider
4. **Select Repository**: Choose `vicky-a1/ranklao` repository
5. **Configure Build Settings**:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Step 2: Environment Variables Setup

In your Netlify dashboard, go to **Site settings** → **Environment variables** and add the following:

#### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 3: Build Configuration

Create a `netlify.toml` file in your project root (optional but recommended):

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Deploy

1. **Deploy Site**: Click "Deploy site"
2. **Monitor Build**: Watch the build logs for any errors
3. **Custom Domain** (Optional): Set up a custom domain in Site settings → Domain management

## Environment Variables Guide

### Supabase Setup

1. **Go to Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select Your Project**: Choose your project or create a new one
3. **Get Project Details**:
   - **Project ID**: Found in Project Settings → General
   - **URL**: Found in Project Settings → API
   - **Publishable Key**: Found in Project Settings → API (anon/public key)

### Razorpay Setup

1. **Login to Razorpay**: [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Go to Settings**: Navigate to Settings → API Keys
3. **Generate Keys**: Create new API keys if needed
4. **Copy Keys**:
   - **Key ID**: Your public key
   - **Key Secret**: Your private key (keep secure)

### Google OAuth Setup

1. **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create Project**: Create a new project or select existing
3. **Enable APIs**: Enable Google+ API and Google OAuth2 API
4. **Create Credentials**:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Set authorized redirect URIs:
     - `https://your-netlify-domain.netlify.app/auth/callback`
     - `https://your-supabase-project.supabase.co/auth/v1/callback`

## Security Best Practices

1. **Never commit secrets**: Always use environment variables
2. **Use HTTPS**: Ensure your domain uses HTTPS
3. **Rotate keys**: Regularly rotate API keys and secrets
4. **Monitor usage**: Keep track of API usage and costs
5. **Backup data**: Regular backups of your Supabase database

## Troubleshooting

### Common Build Issues

1. **Node version**: Ensure you're using Node.js 18 or higher
2. **Dependencies**: Run `npm install` to ensure all dependencies are installed
3. **Environment variables**: Double-check all environment variables are set correctly
4. **Build command**: Verify the build command is `npm run build`

### Runtime Issues

1. **CORS errors**: Check Supabase CORS settings
2. **Authentication**: Verify Google OAuth redirect URIs
3. **Payment issues**: Check Razorpay webhook configurations
4. **Database**: Ensure Supabase migrations are applied

## Troubleshooting Common Issues

### Dependency Installation Errors
If you encounter dependency installation errors during deployment:

1. **Lock File Conflicts**: Ensure you only have one lock file type:
   - Use `package-lock.json` for npm
   - Remove `bun.lockb` if present (Bun lock file)
   - Remove `yarn.lock` if present (Yarn lock file)

2. **Peer Dependency Conflicts**: Check for incompatible package versions:
   - Review error logs for specific version conflicts
   - Update or remove problematic packages
   - Use `npm install --legacy-peer-deps` as a temporary workaround

3. **Node.js Version**: Ensure your project is compatible with Netlify's Node.js version:
   - Netlify uses Node.js v18+ by default
   - Add `.nvmrc` file to specify Node.js version if needed

### Build Errors
- Check TypeScript compilation errors
- Verify all imports and file paths are correct
- Ensure environment variables are properly configured

## Additional Notes

- The build process will automatically run TypeScript compilation and Vite build
- Make sure all environment variables are properly set before deployment
- The application will be available at your Netlify domain once deployed
- For custom domains, configure them in the Netlify dashboard under Domain settings

## Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check browser console for errors

## Monitoring

After deployment:
1. Set up Netlify Analytics
2. Monitor Supabase usage
3. Track Razorpay transactions
4. Set up error monitoring (optional: Sentry)