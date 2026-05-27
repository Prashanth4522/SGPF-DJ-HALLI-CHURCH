# SGPF DJ HALLI CHURCH — Website

Minimal black/white design with a subtle blue gradient accent.

## Run (no install needed)

- Open `index.html` in your browser.

If you want a local server (recommended for best behavior with some browsers):

```powershell
cd "C:\Users\appuj\Desktop\SGPF DJ HALLI CHURCH"
npx serve
```

## Edit content

The preferred way to edit content is the Decap CMS admin panel at `/admin/`.

- **Events / sermons / contact / homepage / gallery**: `data/site-data.json`
- **Styles**: `styles.css`
- **Behavior (menu, calendar, form)**: `script.js`
- **Photos uploaded by CMS**: `assets/uploads/`

## CMS setup

This site uses Decap CMS. The admin config is in `admin/config.yml`, and it is already pointed at the GitHub repo:

```yaml
repo: Prashanth4522/SGPF-DJ-HALLI-CHURCH
branch: main
```

Before using `/admin/` on GitHub Pages, configure a GitHub OAuth provider for Decap CMS. If your provider gives a custom auth URL, add it under `backend` in `admin/config.yml` as `base_url`.

## Contact form

The contact form uses a **mailto fallback** (it opens the visitor’s email app).  
If you want a true “send message” feature, we can add a small backend later.

