# Change Log

## [1.0.1] — 2026-04-18

### 📝 Marketplace Update
- Added demo images to README (status bar + detail panel screenshots)
- Marketplace-compatible README with GitHub-hosted images
- Added GitHub links throughout documentation

## [1.0.0] — 2026-04-18

### 🎉 Initial Release

- **Status bar widget** — Plan name + daily % + weekly % + overage balance
- **Detail panel** — Click status bar for full breakdown with animated progress bars
- **Cascade tracking** — Messages, flow actions, flex credits
- **Real-time updates** — `fs.watch()` on state DB, 0ms delay
- **Zero config** — Auto-detects Windsurf's `state.vscdb` on Windows/macOS/Linux
- **Zero login** — Reads from Windsurf's own cache, no Selenium or API calls
- **Color-coded** — Green (≥50%), Yellow (≥20%), Red (<20%)
- **Animated UI** — Shimmer effects, fade-in cards, growing bars, pulsing live indicator
