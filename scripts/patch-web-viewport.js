#!/usr/bin/env node
/**
 * Patches dist/index.html after `expo export -p web`.
 *
 * Expo Router's `app/+html.tsx` customization (the normal way to edit the
 * root document) is only honored when `web.output` is "static" or "server"
 * — see @expo/cli's exportApp.js, `useServerRendering`. This app uses
 * "single" (deliberate — the onboarding/intro/[step] dynamic route has no
 * generateStaticParams, and static mode's per-route pre-render doesn't
 * cover it), so +html.tsx is silently never invoked. This script is the
 * workaround: it edits the generated file directly, post-build.
 *
 * The fix itself: the default reset sizes `html`/`body`/`#root` with
 * `height:100%`, computed against the browser's "chrome collapsed" maximum
 * viewport. Mobile in-app browsers (WhatsApp, Instagram, etc.) show/hide
 * their own address bar and toolbar dynamically, so the actual visible area
 * is often smaller than that 100% figure — content ends up taller than
 * what's currently visible, pushing the top off-screen and leaving a gap at
 * the bottom (reproduced testing inside WhatsApp's browser, 2 Sep 2026).
 * `100dvh` tracks the real, current viewport instead. Layered on top of,
 * not replacing, the `100%` rule, so browsers without `dvh` support are
 * unaffected.
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const dvhFix = `
    <style id="dvh-fix">
      /* See scripts/patch-web-viewport.js for why this exists. */
      @supports (height: 100dvh) {
        #root, body, html { height: 100dvh; }
      }
    </style>
  </head>`;

if (html.includes('id="dvh-fix"')) {
  console.log('patch-web-viewport: dvh fix already present, skipping.');
  process.exit(0);
}

const patched = html.replace('</head>', dvhFix);
if (patched === html) {
  console.error('patch-web-viewport: could not find </head> in dist/index.html — not patched.');
  process.exit(1);
}

fs.writeFileSync(indexPath, patched);
console.log('patch-web-viewport: dvh fix applied to dist/index.html.');
