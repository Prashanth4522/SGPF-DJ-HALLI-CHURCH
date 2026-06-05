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

## Prayer requests / contact form to Google Sheets

The contact form can save each message to Google Sheets using a Google Apps Script web app.
Until a webhook URL is added, the form keeps using the existing mail/Instagram fallback.

### Set up Google Sheets

1. Create a Google Sheet for prayer requests.
2. In the Sheet, go to **Extensions > Apps Script**.
3. Replace the default code with the contents of `google-apps-script-prayer-requests.js`.
4. Click **Deploy > New deployment**.
5. Choose **Web app**.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Anyone**.
8. Click **Deploy** and copy the Web app URL.
9. Paste that URL into `data/site-data.json`:

```json
"googleSheetsWebhookUrl": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

You can also edit this later from the Decap CMS admin panel under **Contact > Google Sheets Webhook URL**.

## Fallback behavior

If `googleSheetsWebhookUrl` is empty or a submission fails, the site falls back to the existing mail/Instagram contact path.

The contact form uses a **mailto fallback** when the Google Sheets webhook URL is blank.

