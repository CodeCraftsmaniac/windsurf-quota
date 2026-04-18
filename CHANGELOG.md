# Change Log

## [1.1.0] -- 2026-04-18

### Real Screenshots + Overage Fix + README Cleanup
- **Real screenshots** from actual UI (widget.png, tooltip.png)
- **Overage shows "used"** -- `$38.78 used` instead of just `$38.78`
- **Removed Detail Panel** from README (not currently shown in UI)
- **Renamed images** -- statusbar.png → widget.png, deleted detail-panel.png
- **What's Tracked table** simplified to Status Bar + Tooltip columns only

## [1.0.9] -- 2026-04-18

### Premium README + Demo Images + Pre-formatted Tooltip
- **Premium README** -- centered layout, animated badges, color feature badges, 3 demo images
- **New demo images** -- statusbar.png, tooltip.png, detail-panel.png
- **Pre-formatted tooltip** -- `<pre>` tag preserves exact monospace column alignment
- Columns stay perfectly aligned: emoji+label | [bar] | pct | detail

## [1.0.8] -- 2026-04-18

### Fixed Column Alignment in Tooltip
- **HTML `<span>` with fixed widths** -- columns stay aligned regardless of label length
- COL1 (100px): emoji + label | COL2 (130px): [bar] | COL3 (50px): pct | COL4: detail
- Markdown was collapsing spaces -- now uses HTML inline-block spans

## [1.0.7] -- 2026-04-18

### Column-Aligned Unicode Bar Tooltip
- **Exact column layout** -- labels left, bars center, pct right, detail far right
- **Unicode block bars** -- `██████████` filled + `░░░░░░░░░░` empty, 10 chars each
- **Emojis restored** -- 🆓📅📆⚡💬🔄💸🟢⏳ for clear visual identity
- **Separator lines** using `────────────────────────`
- All bars same size (10 blocks), all rows same column widths

## [1.0.6] -- 2026-04-18

### Premium Tooltip Layout + SVG Fix
- **Fixed broken SVG icons** in tooltip -- switched from markdown `![]()` to HTML `<img>` tags
- **Unified progress bar size** -- all bars same width (160px) and height (12px)
- **Two-column layout** -- text labels left, progress bars right, aligned consistently
- **SVG icons in docs** -- README and CHANGELOG use `<img>` with shields.io badges for color coding
- **Version badge** added to README

## [1.0.5] -- 2026-04-18

### Digital SVG Icons -- Zero Emojis
- **All emojis removed** -- replaced with crisp digital SVG icons throughout
- Tooltip: SVG wave, sun, calendar, clock, bolt, dollar, live-dot icons
- Webview panel: inline SVG icons for bar labels
- Package.json: emoji-free display name and command titles
- README and docs: fully emoji-free

## [1.0.4] -- 2026-04-18

### Real SVG Gradient Progress Bars
- Hover tooltip: gradient progress bars via SVG data URI images
- Bars use 3-color gradients (green/yellow/red) with rounded corners
- Mini bars for Cascade stats (messages, flows)
- Click removed -- click status bar now just refreshes data
- Detail panel only via command palette

## [1.0.3] -- 2026-04-18

### Premium UI Overhaul
- Hover tooltip: Unicode bars for cross-platform compatibility
- Click panel: premium overlay with blur background, slide-in animation
- Gradient progress bars with shimmer effects
- Cascade section with gradient border + gradient title text

## [1.0.2] -- 2026-04-18

### Premium Hover Tooltip
- Hover over the status bar to see full details
- Colorful progress bars for daily, weekly, Cascade
- Click status bar now just refreshes data

## [1.0.1] -- 2026-04-18

### Marketplace Update
- Added demo images to README (status bar + detail panel screenshots)
- Marketplace-compatible README with GitHub-hosted images

## [1.0.0] -- 2026-04-18

### Initial Release

- Status bar widget -- Plan name + daily % + weekly % + overage balance
- Detail panel -- full breakdown with animated progress bars
- Cascade tracking -- Messages, flow actions, flex credits
- Real-time updates -- `fs.watch()` on state DB, 0ms delay
- Zero config -- Auto-detects Windsurf's `state.vscdb` on Windows/macOS/Linux
- Zero login -- Reads from Windsurf's own cache, no Selenium or API calls
- Color-coded -- Green (>=50%), Yellow (>=20%), Red (<20%)
- Animated UI -- Shimmer effects, fade-in cards, growing bars, pulsing live indicator
