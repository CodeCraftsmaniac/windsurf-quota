<h1 align="center">
  <img src="https://raw.githubusercontent.com/CodeCraftsmaniac/windsurf-quota/main/images/icon.png" width="56" height="56"><br>
  Windsurf Quota
</h1>

<p align="center">
  <b>Real-Time AI Usage Tracker</b><br>
  <sub>Zero login. Zero config. Zero delay.</sub>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=CodeCraftsmaniac.windsurf-quota"><img src="https://img.shields.io/badge/Install_from-Marketplace-0078D4?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="Marketplace"></a>
  <a href="https://github.com/CodeCraftsmaniac/windsurf-quota"><img src="https://img.shields.io/badge/View_on-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Updates-Real_Time-2ea043?style=for-the-badge&logo=lightning&logoColor=white" alt="Real-Time">
  <img src="https://img.shields.io/badge/Zero-Login-58a6ff?style=for-the-badge" alt="Zero Login">
  <img src="https://img.shields.io/badge/Zero-Config-a371f7?style=for-the-badge" alt="Zero Config">
  <img src="https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-8b949e?style=for-the-badge" alt="Platform">
</p>

---

## Status Bar -- Always Visible

<p align="center">
  <img src="https://raw.githubusercontent.com/CodeCraftsmaniac/windsurf-quota/main/images/statusbar.png" alt="Status Bar" width="520">
</p>

A compact, color-coded overview lives in your status bar at all times. Shows your **Plan name**, **Daily %**, **Weekly %**, and **Overage balance** at a glance.

## Hover Tooltip -- Instant Details

<p align="center">
  <img src="https://raw.githubusercontent.com/CodeCraftsmaniac/windsurf-quota/main/images/tooltip.png" alt="Tooltip" width="480">
</p>

Hover over the status bar widget for a premium tooltip with **Unicode block progress bars**, column-aligned layout, and live reset timers.

## Detail Panel -- Full Breakdown

<p align="center">
  <img src="https://raw.githubusercontent.com/CodeCraftsmaniac/windsurf-quota/main/images/detail-panel.png" alt="Detail Panel" width="620">
</p>

Open via command palette for a premium detail panel with animated gradient progress bars, Cascade stats, and a pulsing live indicator.

---

## Features

<p>
  <img src="https://img.shields.io/badge/-Real_Time-2ea043?style=flat-square"> <b>Instant updates</b> via fs.watch() on the state DB -- fires the moment anything changes<br>
  <img src="https://img.shields.io/badge/-Zero_Login-58a6ff?style=flat-square"> <b>No API calls</b>, no browser automation, no Selenium, no .env files<br>
  <img src="https://img.shields.io/badge/-Zero_Config-a371f7?style=flat-square"> <b>Auto-detects</b> Windsurf's state.vscdb on Windows, macOS, and Linux<br>
  <img src="https://img.shields.io/badge/-Color_Coded-f85149?style=flat-square"> <b>Green / Yellow / Red</b> progress bars based on remaining quota<br>
  <img src="https://img.shields.io/badge/-Cascade-d29922?style=flat-square"> <b>Messages, Flow Actions, Flex Credits</b> tracked with mini bars<br>
  <img src="https://img.shields.io/badge/-Overage-58a6ff?style=flat-square"> <b>Pay-per-use balance</b> shown in status bar and detail panel
</p>

---

## Installation

### Option 1: Marketplace *(recommended)*

Search **"Windsurf Quota"** in the Extensions panel, then click **Install**.

```bash
code --install-extension CodeCraftsmaniac.windsurf-quota
```

### Option 2: VSIX

Download the [latest release](https://github.com/CodeCraftsmaniac/windsurf-quota/releases) and run:

```bash
code --install-extension windsurf-quota-1.0.9.vsix
```

### Option 3: Manual

1. Clone or download from [GitHub](https://github.com/CodeCraftsmaniac/windsurf-quota)
2. Copy to your extensions directory:

```bash
# Windows
xcopy /E . "%USERPROFILE%\.windsurf\extensions\codecraftsmaniac.windsurf-quota-1.0.9-universal\"

# macOS / Linux
cp -r . ~/.windsurf/extensions/codecraftsmaniac.windsurf-quota-1.0.9-universal/
```

3. **Restart Windsurf IDE** -- the widget appears in the status bar!

---

## Commands

| Command | Description |
|:--------|:------------|
| `Windsurf Quota: Show Details` | Opens the detail panel with full breakdown |
| `Windsurf Quota: Refresh Now` | Force-refresh quota data from DB |

## Settings

| Setting | Default | Description |
|:--------|:--------|:------------|
| `windsurfQuota.refreshIntervalSeconds` | `15` | Fallback polling interval (seconds) |
| `windsurfQuota.stateDbPath` | auto | Path to `state.vscdb` (auto-detected if empty) |

---

## What's Tracked

| Metric | Status Bar | Tooltip | Detail Panel |
|:-------|:----------:|:-------:|:------------:|
| **Plan Name** (Free/Pro/Ultimate/Team) | Y | Y | Y |
| **Daily Quota %** | Y | Y | Y |
| **Weekly Quota %** | Y | Y | Y |
| **Daily Reset Timer** | | Y | Y |
| **Weekly Reset Timer** | | Y | Y |
| **Cascade Messages** (used/total/remaining) | | Y | Y |
| **Flow Actions** (used/total/remaining) | | Y | Y |
| **Flex Credits** (used/total/remaining) | | Y | Y |
| **Overage Balance** ($) | Y | Y | Y |
| **Billing Strategy** | | Y | Y |
| **Account Email** | | Y | Y |

## Color Coding

| Range | Color | Meaning |
|:------|:------|:--------|
| >= 50% | <img src="https://img.shields.io/badge/-Green-2ea043?style=flat-square"> | Plenty of quota left |
| 20-49% | <img src="https://img.shields.io/badge/-Yellow-d29922?style=flat-square"> | Quota running low |
| < 20% | <img src="https://img.shields.io/badge/-Red-f85149?style=flat-square"> | Quota nearly exhausted |

---

## How It Works

The extension reads Windsurf's **own cached data** from the local `state.vscdb` SQLite database. The IDE already keeps this data fresh on every heartbeat -- so the widget updates the instant anything changes.

- **Data source**: `windsurf.settings.cachedPlanInfo` + `codeium.windsurf` keys
- **Real-time**: `fs.watch()` on the DB file -- fires instantly on change
- **Fallback**: mtime polling every 2s + interval poll every 15s
- **Python required**: Uses Python to read SQLite (auto-detected)

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"><br>
  <sub>MIT (c) <a href="https://github.com/CodeCraftsmaniac">CodeCraftsmaniac</a></sub><br><br>
  <b>If this extension helps you, give it a star on GitHub!</b><br>
  <a href="https://github.com/CodeCraftsmaniac/windsurf-quota"><img src="https://img.shields.io/badge/Star_on-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Star"></a>
</p>
