# Tidepool Labs landing page

A marketing page for a fictional cloud-lab product, built as a portfolio piece. No frameworks, no build step.

**What it shows**
- Brand voice and a design system in CSS custom properties (palette, type scale, radius).
- A working hero demo: a simulated lab whose first run fails a check, then passes after "the fix".
- Accessible form with inline validation, focus management and `aria-invalid`.
- Technical SEO basics: title/description lengths, canonical, Open Graph, FAQ JSON-LD that matches visible content, `robots.txt`, `sitemap.xml`.
- Responsive layout, visible keyboard focus, skip link, `prefers-reduced-motion`.

## Run
```bash
npx serve .          # or open index.html
```

## Test
```bash
npm test             # node:test, no install needed: validation logic + SEO/a11y static checks
npm install && npx playwright install chromium
npm run e2e          # Playwright end-to-end: lab flow, form errors, FAQ, mobile overflow
```

## Deploy
Any static host. For Azure Static Web Apps or Vercel: set the output directory to the repo root, no build command.
Replace `https://example.com` in `index.html`, `robots.txt` and `sitemap.xml` with the real URL.
