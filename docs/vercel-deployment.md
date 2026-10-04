# Vercel Deployment

## Preconditions

- Node 22.x (`package.json` declares `>=22.6.0 <23`)
- `package-lock.json` committed with `package.json`
- No secrets in browser-visible `VITE_*` variables. This frontend contains simulated/research-only data and is not a clinical data-processing service.

## Deploy

1. Import the repository into Vercel.
2. Keep the repository root as the project root.
3. Vercel reads `vercel.json` and runs `npm ci`, followed by `npm run build`.
4. The static Vite bundle is published from `dist`.

The SPA rewrite in `vercel.json` serves `index.html` for direct visits to client-side paths.

## Pre-deploy check

```bash
npm ci
npm run lint
npm run build
```

## Responsive QA matrix

Verify at 320px, 375px, 768px, 1024px, and 1440px widths; test portrait and landscape on mobile. Confirm that header controls wrap, modals scroll within the visual viewport, 3D controls remain usable, and the full-screen 2D callout does not obscure the main anatomy.

## Production caveat

This Vercel deployment is appropriate for the current static research/demo frontend. Do not connect production PHI, DICOM, or diagnostic workflows until an approved backend, identity controls, audit logging, security review, clinical validation, and regulatory authorization are in place.
