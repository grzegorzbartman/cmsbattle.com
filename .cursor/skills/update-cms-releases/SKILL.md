---
name: update-cms-releases
description: Update CMS release versions and dates in data/releases.json. Use when the user asks to update release info, check for new CMS versions, refresh version data, or mentions outdated release dates.
---

# Update CMS Release Data

## What This Does

Updates `data/releases.json` with the latest release version and date for each of the 13 CMS platforms tracked in this comparison project.

## Quick Reference: Where to Check

| CMS | Primary Source | Backup Source |
|-----|---------------|---------------|
| **Craft CMS** | [github.com/craftcms/cms/releases](https://github.com/craftcms/cms/releases) | [craftcms.com/whats-new](https://craftcms.com/whats-new) |
| **Drupal** | [drupal.org/project/drupal/releases](https://www.drupal.org/project/drupal/releases) | [drupalreleases.com](https://www.drupalreleases.com/) |
| **WordPress** | [wordpress.org/download/releases](https://wordpress.org/download/releases/) | [github.com/WordPress/WordPress/tags](https://github.com/WordPress/WordPress/tags) |
| **TYPO3** | [typo3.org/cms/release-news](https://typo3.org/cms/release-news) | [github.com/TYPO3/typo3/tags](https://github.com/TYPO3/typo3/tags) |
| **Strapi** | [github.com/strapi/strapi/releases](https://github.com/strapi/strapi/releases) | [docs.strapi.io/release-notes](https://docs.strapi.io/release-notes) |
| **Sulu CMS** | [github.com/sulu/sulu/releases](https://github.com/sulu/sulu/releases) | [sulu.io/blog](https://sulu.io/blog) |
| **Payload** | [github.com/payloadcms/payload/releases](https://github.com/payloadcms/payload/releases) | [payloadcms.com/docs](https://payloadcms.com/docs) |
| **Ghost** | [github.com/TryGhost/Ghost/releases](https://github.com/TryGhost/Ghost/releases) | [ghost.org/changelog](https://ghost.org/changelog/) |
| **Joomla** | [downloads.joomla.org](https://downloads.joomla.org/) | [github.com/joomla/joomla-cms/releases](https://github.com/joomla/joomla-cms/releases) |
| **KeystoneJS** | [github.com/keystonejs/keystone/releases](https://github.com/keystonejs/keystone/releases) | [keystonejs.com/releases](https://keystonejs.com/releases) |
| **October CMS** | [github.com/octobercms/october/releases](https://github.com/octobercms/october/releases) | [octobercms.com/changelog](https://octobercms.com/changelog) |
| **Directus** | [github.com/directus/directus/releases](https://github.com/directus/directus/releases) | [directus.io/docs/releases](https://directus.io/docs/releases) |
| **Wagtail** | [github.com/wagtail/wagtail/releases](https://github.com/wagtail/wagtail/releases) | [docs.wagtail.org/en/latest/releases](https://docs.wagtail.org/en/latest/releases/) |

## Workflow

### Step 1: Gather Current Data

Read the current `data/releases.json` to see what's already stored.

### Step 2: Check for Updates

Use web search or MCP browser tools to check each CMS release page. Search queries that work well:

```
"[CMS name] latest release version date [current year]"
```

For each CMS, look for:
- **Version number** (e.g. `11.3.2`, `v5.33.4`)
- **Exact release date** in `YYYY-MM-DD` format
- **Release URL** (link to the specific release page/tag)

Tips:
- **Craft CMS**: Current major is `5.x`. Craft 6 in development. Check GitHub releases — frequent patch releases. Also check craftcms.com/whats-new for feature releases.
- **Drupal**: Look at the `11.x` branch (latest major). The release page on drupal.org shows exact dates.
- **WordPress**: Check the releases category on wordpress.org/news. Version is `6.x` or `7.x`. Very well documented release schedule.
- **TYPO3**: Check typo3.org release news. Current branch is `14.x`. The DACH community publishes security+maintenance releases separately.
- **Strapi**: Releases are frequent (weekly). Check GitHub tags. Package is `v5.x.x`.
- **Sulu CMS**: Monthly release cadence. Version is `3.x.x`. Also maintains `2.6.x` LTS branch. Check GitHub releases or sulu.io/blog.
- **Payload**: Very active development, multiple releases per week. Version is `v3.x.x`.
- **Ghost**: Monthly release cadence. Version is `6.x.x`. Check GitHub releases or ghost.org/changelog.
- **Joomla**: Current major is `6.x`. Also maintains `5.x` LTS. Check downloads.joomla.org.
- **KeystoneJS**: Slow release cadence -- may not have changed. Package is `@keystone-6/core`. If no new release, add/update the `note` field.
- **October CMS**: Version is `4.x.x`. Active development, frequent patch releases. Check GitHub releases or octobercms.com/changelog.
- **Directus**: Monthly release cycle. Version is `v11.x.x`.
- **Wagtail**: Quarterly release cycle. Version is `7.x`. Built on Django. Check GitHub releases or docs.wagtail.org release notes.

### Step 3: Update `data/releases.json`

Edit the file with new values. Structure per CMS:

```json
{
  "cms_key": {
    "name": "Display Name",
    "latest_version": "x.y.z",
    "release_date": "YYYY-MM-DD",
    "release_url": "https://...",
    "releases_page": "https://...",
    "github": "https://...",
    "note": "Optional note (e.g. slow dev pace)"
  }
}
```

Always update `_meta.last_checked` to today's date:

```json
"_meta": {
  "last_checked": "YYYY-MM-DD",
  "checked_by": "AI/manual"
}
```

### Step 4: Verify

```bash
npm run build
```

Check that the build succeeds. Then optionally:

```bash
npm run preview
```

Open `http://localhost:4321/` and verify the overview cards show the updated versions and dates.

## Important Notes

- Only update fields where you have **confirmed data** from official sources
- If a release page is ambiguous, use the GitHub releases page as truth
- Keep the `note` field for KeystoneJS if development pace remains slow
- Date format is always **YYYY-MM-DD** (ISO 8601)
