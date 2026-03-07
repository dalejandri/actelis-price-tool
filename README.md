# Actelis Price Tool — Deployment Guide

## Quick Start (Local)

```bash
npm install
npm run dev
# Opens at http://localhost:5173/actelis-price-tool/
```

---

## Deploy to GitHub Pages (5 minutes)

### Step 1 — Create the repository
1. Go to [github.com/new](https://github.com/new)
2. Name it **`actelis-price-tool`** (must match `REPO_NAME` in `vite.config.js`)
3. Set to **Private** if desired
4. Click **Create repository**

### Step 2 — Push the code
```bash
cd actelis-price-tool
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/actelis-price-tool.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 4 — Done ✓
The GitHub Action runs automatically on every push to `main`.  
Your tool will be live at:  
**`https://YOUR_USERNAME.github.io/actelis-price-tool/`**

Check progress under **Actions** tab in your repo.

---

## Embed in WordPress

### Option A — iFrame (simplest)
Add an HTML block to any page or post:

```html
<iframe
  src="https://YOUR_USERNAME.github.io/actelis-price-tool/"
  style="width:100%; height:900px; border:none; border-radius:8px;"
  title="Actelis Price Tool"
  loading="lazy">
</iframe>
```

### Option B — Full page on your domain
1. In WordPress, create a new **Page**
2. Set a full-width template (most themes have "Full Width" or "No Sidebar")
3. Add the iFrame HTML block above
4. Publish

### Option C — Subdirectory (no iFrame needed)
1. Build: `npm run build` (set `base: "/"` in `vite.config.js` first)
2. Upload the `dist/` folder contents to `/wp-content/price-tool/` via FTP
3. Link to `https://yoursite.com/wp-content/price-tool/`

---

## Updating Prices

All prices are embedded in `src/App.jsx` in the `PRICE_LIST_MAIN` constant.

To update prices:
1. Edit the relevant entries in `PRICE_LIST_MAIN`  
2. `git add . && git commit -m "Update prices" && git push`
3. GitHub Actions rebuilds and deploys automatically (~1 min)

---

## Custom Domain on GitHub Pages

1. In repo Settings → Pages, enter your custom domain (e.g. `tool.yourdomain.com`)
2. Add a CNAME DNS record at your registrar pointing to `YOUR_USERNAME.github.io`
3. Change `base: "/"` in `vite.config.js`
4. Commit and push

---

## File Structure

```
actelis-price-tool/
├── .github/
│   └── workflows/
│       └── deploy.yml      ← Auto-deploy on git push
├── src/
│   ├── main.jsx            ← React entry point
│   ├── App.jsx             ← Full Quote Builder + Node Wizard
│   └── pdfExport.js        ← Browser PDF generator (jsPDF)
├── index.html
├── package.json
└── vite.config.js
```
