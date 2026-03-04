# JMusic Web Interface

This project now supports a web interface via Expo and React Native Web.

## How to run locally
To start the web development server:
```bash
npm run web
```
This will open the app in your default browser.

## How to build for production
To generate a production-ready static site in the `dist` folder:
```bash
npm run build
```

## How to deploy to a domain
1. Run the build command above.
2. The `dist` folder will contain all the static files.
3. You can host this folder on any static hosting provider:
   - **Vercel**: Run `npx vercel` and select the `dist` folder.
   - **Netlify**: Drag and drop the `dist` folder into your Netlify dashboard.
   - **GitHub Pages**: You can use the `gh-pages` package to deploy the `dist` folder.
   - **Your own server**: Copy the contents of `dist` to your server's web root (e.g., `/var/www/html`).

## Online Usage Features
- **Add Remote URLs**: You can now add direct links to MP3 files from the web (using the globe icon in the Library). This allows you to stream music hosted anywhere.
- **Local Files**: You can still pick files from your computer. Note that due to browser security, locally picked files are temporary and may need to be re-added if you refresh the page or clear your browser cache. For a permanent "online" library, using Remote URLs is recommended.
- **Persistence**: Your settings and library (including Remote URLs) are saved in your browser's local storage.
