# Change Log

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
