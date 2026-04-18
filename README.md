# 🌊 Windsurf Quota — Real-Time AI Usage Tracker

**Zero login. Zero config. Zero delay.**

Track your Windsurf AI quotas the moment they change — daily, weekly, Cascade messages, flow actions, and overage balance — all in real-time.

[![Install from Marketplace](https://img.shields.io/badge/Install_from-Marketplace-0078D4?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=CodeCraftsmaniac.windsurf-quota)
[![GitHub](https://img.shields.io/badge/View_on-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/CodeCraftsmaniac/windsurf-quota)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Real-Time](https://img.shields.io/badge/Updates-Real_Time-2ea043?style=for-the-badge&logo=lightning&logoColor=white)](https://github.com/CodeCraftsmaniac/windsurf-quota)

---

## ✨ What You Get

### 📊 Status Bar — Always Visible

A compact, color-coded overview lives in your status bar at all times:

![Status Bar](https://raw.githubusercontent.com/CodeCraftsmaniac/windsurf-quota/main/images/statusbar.png)

Shows your **Plan name**, **Daily %**, **Weekly %**, and **Overage balance** at a glance. Hover for a quick summary. **Click for full details.**

### 🎯 Detail Panel — Click to Expand

Click the status bar widget to open a beautiful detail panel with animated progress bars, Cascade stats, and live indicators:

![Detail Panel](https://raw.githubusercontent.com/CodeCraftsmaniac/windsurf-quota/main/images/detail-panel.png)

- 🌊 **Plan badge** with gradient styling
- ☀ **Daily quota** — animated progress bar + reset timer
- 📅 **Weekly quota** — animated progress bar + reset timer
- ⚡ **Cascade** — messages, flow actions, flex credits with mini progress bars
- 💰 **Overage balance** — pay-per-use credits
- 🟢 **Live indicator** — pulses when updating in real-time

---

## 🎬 How It Works

The extension reads Windsurf's **own cached data** from the local `state.vscdb` SQLite database. The IDE already keeps this data fresh on every heartbeat — so the widget updates the instant anything changes.

> 🚫 No API calls · 🚫 No browser automation · 🚫 No Selenium · 🚫 No login · 🚫 No `.env` files

---

## 🚀 Installation

### Option 1: One-Click Install *(easiest)*

Search **"Windsurf Quota"** in the Extensions panel of Windsurf or VS Code, then click **Install**.

Or install via command line:

```bash
code --install-extension CodeCraftsmaniac.windsurf-quota
```

### Option 2: Install from VSIX

Download the [latest release](https://github.com/CodeCraftsmaniac/windsurf-quota/releases) and run:

```bash
code --install-extension windsurf-quota-1.0.0.vsix
```

### Option 3: Manual Install

1. Download or clone this repo from [GitHub](https://github.com/CodeCraftsmaniac/windsurf-quota)
2. Copy the entire folder to your extensions directory:

```bash
# Windows
xcopy /E . "%USERPROFILE%\.windsurf\extensions\codecraftsmaniac.windsurf-quota-1.0.0-universal\"

# macOS / Linux
cp -r . ~/.windsurf/extensions/codecraftsmaniac.windsurf-quota-1.0.0-universal/
```

3. **Restart Windsurf IDE** — the widget appears in the status bar!

---

## 🎮 Commands

| Command | What It Does |
|:--------|:-------------|
| `🌊 Windsurf Quota: Show Details` | Opens the detail panel with full breakdown |
| `🌊 Windsurf Quota: Refresh Now` | Force-refresh quota data from DB |

> 💡 **Click the status bar widget** to open details instantly!

---

## ⚙️ Settings

| Setting | Default | Description |
|:--------|:--------|:------------|
| `windsurfQuota.refreshIntervalSeconds` | `15` | Fallback polling interval (seconds) |
| `windsurfQuota.stateDbPath` | auto | Path to `state.vscdb` (auto-detected if empty) |

---

## 📱 What's Tracked

| Metric | Where It Shows |
|:-------|:---------------|
| **Plan Name** (Free/Pro/Ultimate/Team) | Status bar + Detail panel |
| **Daily Quota %** | Status bar + Animated bar |
| **Weekly Quota %** | Status bar + Animated bar |
| **Daily Reset Timer** | Detail panel |
| **Weekly Reset Timer** | Detail panel |
| **Cascade Messages** (used/total/remaining) | Detail panel |
| **Flow Actions** (used/total/remaining) | Detail panel |
| **Flex Credits** (used/total/remaining) | Detail panel |
| **Overage Balance** ($) | Status bar + Detail panel |
| **Billing Strategy** | Detail panel |
| **Account Email** | Detail panel |

---

## 🎨 Color Coding

| Range | Color | Meaning |
|:------|:------|:--------|
| ≥ 50% | 🟢 Green | Plenty of quota left |
| 20–49% | 🟡 Yellow | Quota running low |
| < 20% | 🔴 Red | Quota nearly exhausted |

---

## 🔧 Technical Details

- **Data source**: Windsurf's `state.vscdb` SQLite database
  - Key: `windsurf.settings.cachedPlanInfo` — quota data
  - Key: `codeium.windsurf` — account info
- **Real-time updates**: `fs.watch()` on the DB file — fires instantly on change
- **Fallback**: mtime polling every 2s + interval poll every 15s
- **Python required**: Uses Python to read SQLite (auto-detected)

---

## 🤝 Contributing

Contributions are welcome! See the [GitHub repo](https://github.com/CodeCraftsmaniac/windsurf-quota) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

MIT © [CodeCraftsmaniac](https://github.com/CodeCraftsmaniac)

---

**⭐ If this extension helps you, [give it a star on GitHub](https://github.com/CodeCraftsmaniac/windsurf-quota)! ⭐**

Made with ❤️ for the Windsurf community
