# CMS Battle

**Which CMS is right for you?**

An open-source, in-depth comparison of popular CMS platforms across hundreds of features. Data sourced from official documentation, GitHub repos, and changelogs. No marketing fluff.

### Why QFD?

**QFD (Quality Function Deployment)** is a structured decision-making methodology developed in Japan, widely used in engineering and product management to translate customer needs into measurable technical parameters. Instead of comparing features in a flat list, QFD weights each requirement by its real importance to your project -- so a feature that matters 9x gets 9x the influence on the final score.

This eliminates gut-feeling bias and produces transparent, reproducible, and defensible results you can share with stakeholders.

Select your requirements, assign importance weights (1-9), and the matrix calculates the best fit. You can also add custom requirements and share your analysis via a URL.

---

## What's Inside

| | |
|---|---|
| **Multiple CMS platforms** | Compared side-by-side with verified data |
| **Hundreds of features** | Scored across categories: content architecture, security, API, SEO, AI, multilingual, and more |
| **QFD Decision Matrix** | Weighted scoring methodology (Quality Function Deployment) to find the best CMS for your specific needs |
| **Shareable results** | QFD selections encoded in URL hash -- share your analysis with a link |
| **Dark mode** | Full light/dark theme support |
## Tech Stack

- [Astro](https://astro.build/) -- static site generation (Node.js)
- [Alpine.js](https://alpinejs.dev/) -- lightweight client-side interactivity
- Plain CSS -- no frameworks, no build step for styles
- JSON data files -- all comparison data lives in `data/`
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/grzegorzbartman/cmsbattle.com.git
cd cmsbattle.com

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Other Commands

```bash
npm run build      # Build static site to dist/
npm run preview    # Preview production build locally
```

---

## Project Structure

```
cmsbattle.com/
├── data/                    # All comparison data (JSON)
│   ├── categories.json      # 24 categories, 110 features, scores
│   ├── executives.json      # Executive summaries per CMS
│   ├── metrics.json         # GitHub stars, contributors, extensions, etc.
│   ├── releases.json        # Latest versions and release dates
│   └── qfd.json             # QFD matrix requirements and scores
├── public/
│   ├── css/style.css        # All styles (light + dark mode)
│   └── js/app.js            # Alpine.js components
├── src/
│   ├── layouts/Layout.astro # HTML shell, theme toggle
│   ├── pages/index.astro    # Main page (imports data + components)
│   └── components/          # 11 Astro components (Hero, Nav, Overview, etc.)
├── astro.config.mjs
└── package.json
```

---

## Contributing

Contributions are welcome! Here's how you can help:

### Update Data

The easiest way to contribute -- no code changes needed:

- **Fix a score** -- found an inaccurate feature score? Edit `data/categories.json` and submit a PR with a source link.
- **Update release info** -- CMS released a new version? Edit `data/releases.json`.
- **Improve tooltips** -- add more context to feature tooltips in `data/categories.json`.
- **Update metrics** -- GitHub stars, contributor counts, extension counts in `data/metrics.json`.

### Add a New CMS

Adding a CMS requires scoring all 110 features and updating multiple files. See the detailed guide in `.cursor/skills/add-new-cms/SKILL.md`.

### Improve the UI

- CSS lives in `public/css/style.css`
- Alpine.js components live in `public/js/app.js`
- Astro components live in `src/components/`

### How to Submit Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Make your changes
4. Test locally: `npm run dev`
5. Commit: `git commit -m "Description of changes"`
6. Push: `git push origin feature/my-improvement`
7. Open a Pull Request

### Guidelines

- All CMS platforms must be listed in **alphabetical order** everywhere (data files, components, JS).
- Every feature score must include a **tooltip** explaining the rationale.
- Use official documentation as the primary source. Link sources in PR descriptions.
- Keep it objective -- this is a technical comparison, not a recommendation engine.

---

## Data Sources

All data is verified against official documentation:

- [craftcms.com/docs](https://craftcms.com/docs/5.x)
- [directus.io/docs](https://directus.io/docs)
- [drupal.org/docs](https://www.drupal.org/docs)
- [ghost.org/docs](https://ghost.org/docs)
- [docs.joomla.org](https://docs.joomla.org)
- [keystonejs.com/docs](https://keystonejs.com/docs)
- [docs.octobercms.com](https://docs.octobercms.com)
- [payloadcms.com/docs](https://payloadcms.com/docs)
- [docs.strapi.io](https://docs.strapi.io)
- [docs.sulu.io](https://docs.sulu.io)
- [docs.typo3.org](https://docs.typo3.org)
- [developer.wordpress.org](https://developer.wordpress.org)
- GitHub changelogs and issues (all CMS)

---

## License

This project is licensed under the **GNU General Public License v2.0 or later** (GPL-2.0-or-later) -- the same license used by Drupal and WordPress.

See the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project under the terms of the GPL. If you distribute modified versions, you must also make your source code available under the same license.

---

Built by Grzegorz Bartman
