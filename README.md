## BloodBuddy - Emergency Blood Donor Network

BloodBuddy is a small React + Vite app that helps connect blood donors with people in need during emergencies. This repo contains the source code and a GitHub Actions workflow to build and deploy the app to GitHub Pages.

## How to run locally

Install dependencies:

```powershell
npm install
```

Start the dev server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

Preview production build locally:

```powershell
npm run preview
```

## Deployment options

1) GitHub Pages (automatic via Actions)

- This repository includes a workflow `.github/workflows/deploy.yml` that builds the app on pushes to `master` and deploys the `dist` folder to GitHub Pages.
- Vite is configured with `base: './'` so the build uses relative asset paths (works for GitHub Pages).
- After you push to `master`, open the repository Settings → Pages to confirm the deployment status (Actions will create a Pages deployment automatically). It may take a minute for the first deployment.

2) Vercel (recommended for simplest workflow)

- Go to https://vercel.com, connect your GitHub account, pick this repository and deploy. Vercel will detect the React + Vite app and use `npm run build` automatically.

3) Netlify

- Create a new site from Git in Netlify, connect your GitHub repo. Set build command `npm run build` and publish directory `dist`.

## Notes & troubleshooting

- If the site shows broken asset paths after deployment, ensure `vite.config.js` contains `base: './'` (already configured here).
- If Actions fails, check the Actions tab in GitHub to inspect logs and error messages.

If you'd like I can:

- Configure a Vercel deployment for you (I can provide steps or create a vercel.json if needed).
- Add a Netlify/Terraform config.
- Configure a custom domain (you'll need DNS control).

Tell me which provider you'd like and I'll either finish the GitHub Pages setup or create the provider-specific config.
