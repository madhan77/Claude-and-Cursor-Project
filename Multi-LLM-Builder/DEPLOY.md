# 🚀 Deploy to Netlify

## Quick Deploy (Drag & Drop)

1. **Build your site** (if needed):
   ```bash
   # No build needed - it's static HTML!
   ```

2. **Go to Netlify**:
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign up or log in

3. **Deploy**:
   - Drag and drop the entire project folder onto Netlify
   - OR use the Netlify CLI (see below)

## Deploy via Netlify CLI

1. **Install Netlify CLI** (if not installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**:
   ```bash
   cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/Build Using AI"
   netlify init
   netlify deploy --prod
   ```

## Deploy via Git (Recommended)

1. **Create a Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub/GitLab/Bitbucket**

3. **Connect to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `.` (current directory)

4. **Deploy!** Netlify will automatically deploy on every push.

## Environment Variables (Optional)

If you want to set default API keys (not recommended for security):
- Go to Site settings → Environment variables
- Add `GEMINI_API_KEY` (users can still override in the UI)

## Custom Domain

1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

---

**Your site will be live at:** `https://your-site-name.netlify.app`

