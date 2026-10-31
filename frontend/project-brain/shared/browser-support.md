# Browser support

- browserslist: not configured in frontend/package.json. Protocol default "> 0.5%, last 2 versions, not dead" is provisional until the human confirms.
- forbidden APIs: none declared.
- notable APIs: AudioContext (kitchen chime, may be blocked until a user gesture); sessionStorage (mock session); createPortal (pop-up).
- polyfills in place: none.
- verified on: Chromium headless shell 1248 via Playwright, 2026-10-31. Firefox and WebKit: not checked.
