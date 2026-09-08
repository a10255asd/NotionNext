# Site family refresh — 2026-09-09

Hexo now uses compact article/category/archive/search navigation and the shared four-site switcher. Homepage focuses on a plain article list; wide banner, cover imagery, card zoom and sidebar removed/disabled. Article header keeps title/category/date/tags without a large cover. Footer legal/attribution links retained, heading semantics corrected. Styles support light/dark mode and narrow layouts.

Validation: changed files pass ESLint with the pre-existing themes/hexo/index.js effect-dependency warning. Next compilation and type validation pass, but production build fails while retrieving Notion content: loadPageChunk returns HTTP 403, leaving tag data unavailable. Do not treat this as a successful deploy-ready full build. Local temporary sample pages verified list/article layout and were removed before commit.

Default configured theme is Hexo; a remotely configured different theme can override that selection. No Notion data, credentials or deployment settings changed. No deployment.
