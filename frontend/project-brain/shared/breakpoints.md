# Breakpoints (responsive contract)

- Source: Tailwind CSS v4 default scale (no custom theme in frontend/src/index.css). [calc: index.css]
- sm 640 px · md 768 px · lg 1024 px · xl 1280 px · 2xl 1536 px
- mobile: < 768 px (one column)
- tablet: 768–1279 px (two columns on /cocina)
- desktop: 1280 px+ (four columns on /cocina from 1536 px)
- Test widths already used: 390, 1024, 1180, 1500, 1920.
- Protocol default was 320/768/1280; the human has not confirmed the minimum width (320 or 390). Status: provisional.
- rules: no fixed-width layouts; check every visual change at 390, 1024, 1500 and 1920 (RULE-FE-0001).
