const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

let statusBarItem;
let refreshTimer;
let lastQuotaData = null;
let detailPanel = null;
let dbWatcher = null;
let _updatePending = false;

// ─── State DB Reader ──────────────────────────────────────────────────────────

function findStateDbPath() {
    const config = vscode.workspace.getConfiguration('windsurfQuota');
    const configured = config.get('stateDbPath', '');
    if (configured && fs.existsSync(configured)) return configured;

    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const candidate = path.join(appData, 'Windsurf', 'User', 'globalStorage', 'state.vscdb');
    if (fs.existsSync(candidate)) return candidate;

    const unixCandidate = path.join(os.homedir(), '.windsurf', 'User', 'globalStorage', 'state.vscdb');
    if (fs.existsSync(unixCandidate)) return unixCandidate;

    return '';
}

function readQuotaFromDb(dbPath) {
    return new Promise((resolve, reject) => {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const script = `
import sqlite3, json, sys
try:
    db = sqlite3.connect(r'${dbPath.replace(/'/g, "\\'")}')
    cur = db.cursor()
    cur.execute("SELECT value FROM ItemTable WHERE key = 'windsurf.settings.cachedPlanInfo'")
    row = cur.fetchone()
    plan_info = json.loads(row[0]) if row else None
    cur.execute("SELECT value FROM ItemTable WHERE key = 'codeium.windsurf'")
    row = cur.fetchone()
    config_info = json.loads(row[0]) if row else None
    db.close()
    result = {
        'planInfo': plan_info,
        'configInfo': {
            'lastLoginEmail': config_info.get('lastLoginEmail', '') if config_info else '',
        }
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e)}))
    sys.exit(0)
`;
        execFile(pythonCmd, ['-c', script], { timeout: 5000 }, (err, stdout, stderr) => {
            if (err) { reject(new Error(err.message)); return; }
            try {
                const data = JSON.parse(stdout.trim());
                if (data.error) { reject(new Error(data.error)); return; }
                resolve(data);
            } catch (e) { reject(new Error(e.message)); }
        });
    });
}

// ─── Quota Formatting ─────────────────────────────────────────────────────────

function formatQuotaData(data) {
    const plan = data.planInfo;
    if (!plan) return null;
    const quota = plan.quotaUsage || {};
    const usage = plan.usage || {};

    return {
        planName: plan.planName || 'Unknown',
        dailyRemaining: quota.dailyRemainingPercent ?? null,
        dailyResetAt: quota.dailyResetAtUnix ? new Date(quota.dailyResetAtUnix * 1000) : null,
        hideDaily: plan.hideDailyQuota || false,
        weeklyRemaining: quota.weeklyRemainingPercent ?? null,
        weeklyResetAt: quota.weeklyResetAtUnix ? new Date(quota.weeklyResetAtUnix * 1000) : null,
        hideWeekly: plan.hideWeeklyQuota || false,
        overageBalanceMicros: quota.overageBalanceMicros ?? 0,
        overageBalanceDollars: ((quota.overageBalanceMicros || 0) / 1_000_000).toFixed(2),
        totalMessages: usage.messages ?? 0,
        usedMessages: usage.usedMessages ?? 0,
        remainingMessages: usage.remainingMessages ?? 0,
        totalFlowActions: usage.flowActions ?? 0,
        usedFlowActions: usage.usedFlowActions ?? 0,
        remainingFlowActions: usage.remainingFlowActions ?? 0,
        totalFlexCredits: usage.flexCredits ?? 0,
        usedFlexCredits: usage.usedFlexCredits ?? 0,
        remainingFlexCredits: usage.remainingFlexCredits ?? 0,
        billingStrategy: plan.billingStrategy || '',
        email: data.configInfo?.lastLoginEmail || '',
        teamsTier: plan.teamsTier ?? 0,
    };
}

function formatResetTime(date) {
    if (!date) return '?';
    const diffMs = date - new Date();
    if (diffMs <= 0) return 'now';
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);
    return diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`;
}

function formatResetTimeFull(date) {
    if (!date) return '';
    return date.toLocaleString();
}

// ─── SVG Icon Helpers (digital SVG everywhere) ─────────────────────────────────

const SVG_ICONS = {
    wave: (s=14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>`,
    sun: (s=12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-1.5-6.5L17 5m0 14l1.5-1.5M6 5L4.5 6.5M6 19L4.5 17.5"/></svg>`,
    cal: (s=12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4m-5 4h18"/></svg>`,
    clock: (s=10) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    bolt: (s=12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="#58a6ff" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    dollar: (s=12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 7H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
    live: (s=8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#2ea043"/><circle cx="12" cy="12" r="4" fill="#3fb950"/></svg>`,
};

function imgIcon(name, size) {
    const svg = SVG_ICONS[name](size);
    return `<img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="${size}" height="${size}" style="vertical-align:middle">`;
}

function imgBar(pct, w = 160, h = 12) {
    const fillW = Math.max(Math.round(pct * w / 100), 4);
    const colors = pct >= 50
        ? ['#238636', '#2ea043', '#3fb950']
        : pct >= 20
            ? ['#9e6a03', '#d29922', '#e3b341']
            : ['#da3633', '#f85149', '#ff7b72'];
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`
        + `<defs><linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="0%">`
        + `<stop offset="0%" stop-color="${colors[0]}"/>`
        + `<stop offset="50%" stop-color="${colors[1]}"/>`
        + `<stop offset="100%" stop-color="${colors[2]}"/>`
        + `</linearGradient></defs>`
        + `<rect width="${w}" height="${h}" rx="${h/2}" fill="#30363d"/>`
        + `<rect width="${fillW}" height="${h}" rx="${h/2}" fill="url(#b)"/>`
        + `</svg>`;
    return `<img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="${w}" height="${h}" style="vertical-align:middle">`;
}

function buildTooltip(q) {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    const BAR_W = 160, BAR_H = 12;
    const row = (icon, label, pct, detail) => {
        const bar = imgBar(pct, BAR_W, BAR_H);
        return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="min-width:90px;display:flex;align-items:center;gap:4px">${icon} <b>${label}</b></span>${bar}<span style="min-width:40px;text-align:right"><b>${pct}%</b></span><span style="color:#8b949e;font-size:11px;margin-left:4px">${detail}</span></div>`;
    };

    const msgPct = q.totalMessages > 0 ? Math.round((q.remainingMessages / q.totalMessages) * 100) : 0;
    const flowPct = q.totalFlowActions > 0 ? Math.round((q.remainingFlowActions / q.totalFlowActions) * 100) : 0;

    let html = '';

    // Header
    html += `<div style="margin-bottom:8px;display:flex;align-items:center;gap:6px">${imgIcon('wave',16)} <b style="font-size:14px">${q.planName} Plan</b> <span style="color:#8b949e;font-size:11px">${q.email}</span></div>`;

    // Quota rows -- same bar size, two-column layout
    if (!q.hideDaily && q.dailyRemaining !== null) {
        html += row(imgIcon('sun',12), 'Daily', q.dailyRemaining, `${imgIcon('clock',10)} ${formatResetTime(q.dailyResetAt)}`);
    }
    if (!q.hideWeekly && q.weeklyRemaining !== null) {
        html += row(imgIcon('cal',12), 'Weekly', q.weeklyRemaining, `${imgIcon('clock',10)} ${formatResetTime(q.weeklyResetAt)}`);
    }

    // Cascade section
    html += `<hr style="border:none;border-top:1px solid #30363d;margin:8px 0">`;
    html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">${imgIcon('bolt',12)} <b style="color:#58a6ff">CASCADE</b></div>`;
    html += row('', 'Messages', msgPct, `${q.remainingMessages} / ${q.totalMessages}`);
    html += row('', 'Flows', flowPct, `${q.remainingFlowActions} / ${q.totalFlowActions}`);
    if (q.totalFlexCredits > 0) {
        html += `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="min-width:90px"><b>Flex</b></span>${imgBar(100, BAR_W, BAR_H)}<span style="min-width:40px;text-align:right"><b>${q.remainingFlexCredits}</b></span><span style="color:#8b949e;font-size:11px;margin-left:4px">/ ${q.totalFlexCredits}</span></div>`;
    }

    // Overage
    if (parseFloat(q.overageBalanceDollars) > 0) {
        html += `<div style="margin-top:6px">${imgIcon('dollar',12)} <b>$${q.overageBalanceDollars}</b> <span style="color:#8b949e;font-size:11px">overage</span></div>`;
    }

    // Footer
    html += `<hr style="border:none;border-top:1px solid #30363d;margin:8px 0">`;
    html += `<span style="display:flex;align-items:center;gap:4px;color:#8b949e;font-size:11px">${imgIcon('live',8)} Live -- Billing: ${q.billingStrategy}</span>`;

    md.appendMarkdown(html);
    return md;
}

// ─── Status Bar Update ────────────────────────────────────────────────────────

async function updateStatusBar() {
    if (_updatePending) return;
    _updatePending = true;
    try {
        const dbPath = findStateDbPath();
        if (!dbPath) {
            statusBarItem.text = '$(sync-ignored) No Windsurf DB';
            statusBarItem.tooltip = 'Could not find Windsurf state.vscdb\nSet windsurfQuota.stateDbPath in settings';
            statusBarItem.show();
            return;
        }

        const raw = await readQuotaFromDb(dbPath);
        const q = formatQuotaData(raw);
        if (!q) {
            statusBarItem.text = '$(sync-ignored) No plan data';
            statusBarItem.tooltip = 'No cached plan info found. Open Windsurf IDE first.';
            statusBarItem.show();
            return;
        }

        lastQuotaData = q;

        // Compact status bar text
        let parts = [];
        if (!q.hideDaily && q.dailyRemaining !== null) {
            parts.push(`D:${q.dailyRemaining}%`);
        }
        if (!q.hideWeekly && q.weeklyRemaining !== null) {
            parts.push(`W:${q.weeklyRemaining}%`);
        }
        if (parseFloat(q.overageBalanceDollars) > 0) {
            parts.push(`$${q.overageBalanceDollars}`);
        }

        statusBarItem.text = `$(waves) ${q.planName} | ${parts.join(' · ')}`;

        // Premium hover tooltip with colorful bars
        statusBarItem.tooltip = buildTooltip(q);
        statusBarItem.show();

        // Live-update detail panel if open
        if (detailPanel) {
            updateDetailPanel();
        }
    } catch (e) {
        statusBarItem.text = '$(error) Quota error';
        statusBarItem.tooltip = `Failed: ${e.message}`;
        statusBarItem.show();
    } finally {
        _updatePending = false;
    }
}

// ─── Detail Panel (command palette only) ──────────────────────────────────────

function showDetailsPanel() {
    if (detailPanel) {
        detailPanel.reveal(vscode.ViewColumn.One);
        updateDetailPanel();
        return;
    }

    detailPanel = vscode.window.createWebviewPanel(
        'windsurfQuotaDetails',
        'Windsurf Quota',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true, preserveFocus: true }
    );
    detailPanel.iconPath = vscode.Uri.parse('data:image/svg+xml,' + encodeURIComponent(SVG_ICONS.wave(24)));
    detailPanel.onDidDispose(() => { detailPanel = null; });
    updateDetailPanel();
}

function updateDetailPanel() {
    if (!detailPanel) return;
    const q = lastQuotaData;
    if (!q) {
        detailPanel.webview.html = '<h2>No quota data yet</h2><p>Waiting for first read...</p>';
        return;
    }

    const dailyBar = !q.hideDaily && q.dailyRemaining !== null
        ? makeBar('Daily Quota', q.dailyRemaining, q.dailyResetAt, 'sun') : '';
    const weeklyBar = !q.hideWeekly && q.weeklyRemaining !== null
        ? makeBar('Weekly Quota', q.weeklyRemaining, q.weeklyResetAt, 'cal') : '';

    const msgPct = q.totalMessages > 0 ? Math.round((q.remainingMessages / q.totalMessages) * 100) : 0;
    const flowPct = q.totalFlowActions > 0 ? Math.round((q.remainingFlowActions / q.totalFlowActions) * 100) : 0;

    detailPanel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes panelSlideIn { from { opacity: 0; transform: translateY(-30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes barGrow { from { width: 0; } }
  @keyframes countPop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(88,166,255,0.2); } 50% { box-shadow: 0 0 20px rgba(88,166,255,0.4); } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    overflow: hidden;
    height: 100vh;
  }

  .overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 40px;
    animation: overlayIn 0.25s ease;
    z-index: 999;
  }

  .panel {
    width: 580px; max-height: calc(100vh - 80px);
    overflow-y: auto; overflow-x: hidden;
    background: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 16px;
    padding: 28px;
    animation: panelSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(88,166,255,0.08);
  }

  .panel::-webkit-scrollbar { width: 6px; }
  .panel::-webkit-scrollbar-track { background: transparent; }
  .panel::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }

  .card {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 12px; padding: 18px; margin-bottom: 14px;
    animation: panelSlideIn 0.4s ease both;
  }
  .card:nth-child(1) { animation-delay: 0.05s; }
  .card:nth-child(2) { animation-delay: 0.1s; }
  .card:nth-child(3) { animation-delay: 0.15s; }
  .card:nth-child(4) { animation-delay: 0.2s; }
  .card:nth-child(5) { animation-delay: 0.25s; }

  /* Plan badge */
  .plan-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 20px; border-radius: 24px;
    font-size: 15px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 1.5px;
    animation: glow 3s infinite, countPop 0.5s ease both;
  }
  .plan-free { background: linear-gradient(135deg, #388bfd44, #58a6ff22); color: #58a6ff; border: 1px solid #58a6ff55; }
  .plan-pro { background: linear-gradient(135deg, #2ea04344, #7ee78722); color: #7ee787; border: 1px solid #7ee78755; }
  .plan-ultimate { background: linear-gradient(135deg, #bc8cff44, #d2a8ff22); color: #d2a8ff; border: 1px solid #d2a8ff55; }
  .plan-team { background: linear-gradient(135deg, #d2992244, #e3b34122); color: #e3b341; border: 1px solid #e3b34155; }
  .email { font-size: 12px; color: var(--vscode-descriptionForeground); margin-left: 16px; }

  /* Progress bars */
  .bar-wrap { margin-top: 10px; }
  .bar-label { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .bar-label-title { font-size: 14px; font-weight: 600; }
  .bar-label-pct { font-size: 24px; font-weight: 900; }
  .bar-track {
    background: linear-gradient(90deg, #21262d, #30363d);
    border-radius: 10px; height: 36px; overflow: hidden; position: relative;
    border: 1px solid #30363d66;
  }
  .bar-fill {
    height: 100%; border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-weight: 800; font-size: 15px; color: #fff;
    animation: barGrow 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    position: relative; overflow: hidden;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .bar-fill::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: shimmer 2.5s infinite linear;
  }
  .bar-green { background: linear-gradient(90deg, #238636, #2ea043, #3fb950); }
  .bar-yellow { background: linear-gradient(90deg, #9e6a03, #d29922, #e3b341); }
  .bar-red { background: linear-gradient(90deg, #da3633, #f85149, #ff7b72); }
  .bar-reset {
    font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .bar-reset .clock { animation: pulse 2s infinite; }

  /* Cascade section */
  .cascade-section {
    border-left: 3px solid transparent;
    border-image: linear-gradient(180deg, #58a6ff, #bc8cff) 1;
    padding-left: 18px;
  }
  .cascade-title {
    font-size: 13px; font-weight: 800; margin-bottom: 16px;
    text-transform: uppercase; letter-spacing: 2px;
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(90deg, #58a6ff, #bc8cff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-item {
    padding: 16px; background: var(--vscode-editor-background);
    border-radius: 10px; border: 1px solid var(--vscode-editorWidget-border);
    animation: countPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: border-color 0.2s;
  }
  .stat-item:hover { border-color: #58a6ff55; }
  .stat-item:nth-child(1) { animation-delay: 0.1s; }
  .stat-item:nth-child(2) { animation-delay: 0.15s; }
  .stat-item:nth-child(3) { animation-delay: 0.2s; }
  .stat-item:nth-child(4) { animation-delay: 0.25s; }
  .stat-label { font-size: 10px; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .stat-value { font-size: 32px; font-weight: 900; line-height: 1.1; }
  .stat-sub { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 4px; }
  .stat-value.blue { color: #58a6ff; }
  .stat-value.green { color: #7ee787; }
  .stat-value.gold { color: #e3b341; }
  .stat-value.red { color: #ff7b72; }

  .mini-bar { height: 4px; border-radius: 2px; background: #21262d; margin-top: 10px; overflow: hidden; }
  .mini-fill { height: 100%; border-radius: 2px; animation: barGrow 0.8s ease both; }
  .mini-green { background: linear-gradient(90deg, #238636, #2ea043); }
  .mini-yellow { background: linear-gradient(90deg, #9e6a03, #d29922); }
  .mini-red { background: linear-gradient(90deg, #da3633, #f85149); }
  .mini-blue { background: linear-gradient(90deg, #388bfd, #58a6ff); }

  /* Footer */
  .footer-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 18px; background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 10px; font-size: 12px; color: var(--vscode-descriptionForeground);
  }
  .live-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background: #2ea043; animation: pulse 1.5s infinite;
    margin-right: 6px; vertical-align: middle;
    box-shadow: 0 0 6px #2ea04366;
  }
  .footer-text { text-align: center; font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 16px; opacity: 0.5; }
</style>
</head>
<body>

<div class="overlay">
<div class="panel">

  <div class="card">
    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px">
      <span class="plan-badge plan-${q.planName.toLowerCase()}">${q.planName}</span>
      <span class="email">${q.email}</span>
    </div>
  </div>

  ${dailyBar}
  ${weeklyBar}

  <div class="card cascade-section">
    <div class="cascade-title">CASCADE</div>
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-label">Messages</div>
        <div class="stat-value ${msgPct >= 50 ? 'green' : msgPct >= 20 ? 'gold' : 'red'}">${q.remainingMessages}</div>
        <div class="stat-sub">${q.usedMessages} used of ${q.totalMessages}</div>
        <div class="mini-bar"><div class="mini-fill mini-${msgPct >= 50 ? 'green' : msgPct >= 20 ? 'yellow' : 'red'}" style="width:${msgPct}%"></div></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Flow Actions</div>
        <div class="stat-value ${flowPct >= 50 ? 'green' : flowPct >= 20 ? 'gold' : 'red'}">${q.remainingFlowActions}</div>
        <div class="stat-sub">${q.usedFlowActions} used of ${q.totalFlowActions}</div>
        <div class="mini-bar"><div class="mini-fill mini-${flowPct >= 50 ? 'green' : flowPct >= 20 ? 'yellow' : 'red'}" style="width:${flowPct}%"></div></div>
      </div>
      ${q.totalFlexCredits > 0 ? `
      <div class="stat-item">
        <div class="stat-label">Flex Credits</div>
        <div class="stat-value blue">${q.remainingFlexCredits}</div>
        <div class="stat-sub">${q.usedFlexCredits} used of ${q.totalFlexCredits}</div>
      </div>` : ''}
      <div class="stat-item">
        <div class="stat-label">Overage Balance</div>
        <div class="stat-value blue">$${q.overageBalanceDollars}</div>
        <div class="stat-sub">Pay-per-use credits</div>
        <div class="mini-bar"><div class="mini-fill mini-blue" style="width:100%"></div></div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <span><span class="live-dot"></span> Live -- real-time</span>
    <span>Billing: ${q.billingStrategy}</span>
  </div>

  <div class="footer-text">Windsurf Quota v1.0.5</div>

</div>
</div>

</body>
</html>`;
}

function makeBar(label, pct, resetAt, icon) {
    const color = pct >= 50 ? 'green' : pct >= 20 ? 'yellow' : 'red';
    const resetText = resetAt ? `Resets in ${formatResetTime(resetAt)} (${formatResetTimeFull(resetAt)})` : '';
    const iconSvg = icon ? SVG_ICONS[icon](16) : '';
    return `<div class="card">
  <div class="bar-wrap">
    <div class="bar-label">
      <span class="bar-label-title">${iconSvg} ${label}</span>
      <span class="bar-label-pct" style="color:var(--vscode-foreground)">${pct}%</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill bar-${color}" style="width:${Math.max(pct, 3)}%">${pct}%</div>
    </div>
    ${resetText ? `<div class="bar-reset"><span class="clock"></span>${resetText}</div>` : ''}
  </div>
</div>`;
}

// ─── Real-time DB Watcher ──────────────────────────────────────────────────────

function startDbWatcher(context) {
    const dbPath = findStateDbPath();
    if (!dbPath) return;

    let lastMtime = 0;

    try {
        dbWatcher = fs.watch(dbPath, (event) => {
            if (event === 'change') {
                updateStatusBar();
            }
        });
        context.subscriptions.push({ dispose: () => dbWatcher?.close() });
    } catch {
        const pollId = setInterval(() => {
            try {
                const stat = fs.statSync(dbPath);
                const mtime = stat.mtimeMs;
                if (mtime !== lastMtime) {
                    lastMtime = mtime;
                    updateStatusBar();
                }
            } catch {}
        }, 2000);
        context.subscriptions.push({ dispose: () => clearInterval(pollId) });
    }
}

// ─── Activation ───────────────────────────────────────────────────────────────

function activate(context) {
    // Status bar — hover shows SVG gradient bar tooltip, click refreshes
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(sync~spin) Windsurf...';
    statusBarItem.command = 'windsurfQuota.refresh';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Click = refresh only
    context.subscriptions.push(
        vscode.commands.registerCommand('windsurfQuota.refresh', async () => {
            statusBarItem.text = '$(sync~spin) Syncing...';
            await updateStatusBar();
            vscode.window.setStatusBarMessage('$(check) Quota updated', 2000);
        })
    );

    // Detail panel via command palette only
    context.subscriptions.push(
        vscode.commands.registerCommand('windsurfQuota.showDetails', async () => {
            await updateStatusBar();
            showDetailsPanel();
        })
    );

    // Real-time: watch DB file for instant updates
    startDbWatcher(context);

    // Fallback poll every 15s
    const config = vscode.workspace.getConfiguration('windsurfQuota');
    const interval = config.get('refreshIntervalSeconds', 15) * 1000;
    refreshTimer = setInterval(updateStatusBar, interval);
    context.subscriptions.push({ dispose: () => clearInterval(refreshTimer) });

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('windsurfQuota')) {
                clearInterval(refreshTimer);
                const newConfig = vscode.workspace.getConfiguration('windsurfQuota');
                const newInterval = newConfig.get('refreshIntervalSeconds', 15) * 1000;
                refreshTimer = setInterval(updateStatusBar, newInterval);
                updateStatusBar();
            }
        })
    );

    updateStatusBar();
}

function deactivate() {
    if (refreshTimer) clearInterval(refreshTimer);
    if (dbWatcher) dbWatcher.close();
}

module.exports = { activate, deactivate };
