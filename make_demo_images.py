from PIL import Image, ImageDraw, ImageFont

# ─── Fonts ──────────────────────────────────────────────────────────────
try:
    mono = ImageFont.truetype('consola.ttf', 13)
    mono_sm = ImageFont.truetype('consola.ttf', 11)
    title_font = ImageFont.truetype('segoeui.ttf', 15)
    label_font = ImageFont.truetype('segoeui.ttf', 11)
    value_font = ImageFont.truetype('segoeui.ttf', 28)
    sub_font = ImageFont.truetype('segoeui.ttf', 10)
    bar_font = ImageFont.truetype('segoeui.ttf', 12)
    badge_font = ImageFont.truetype('segoeui.ttf', 13)
except:
    mono = mono_sm = title_font = label_font = value_font = sub_font = bar_font = badge_font = ImageFont.load_default()

# Colors
BG = (13, 17, 23, 255)
CARD = (22, 27, 34, 255)
BORDER = (48, 54, 61, 255)
BLUE = (88, 166, 255)
GREEN = (46, 160, 67)
YELLOW = (210, 153, 34)
RED = (248, 81, 73)
DIM = (139, 148, 158)
WHITE = (201, 209, 217)

# ─── Status Bar Demo ────────────────────────────────────────────────
sb = Image.new('RGBA', (520, 36), BG)
draw = ImageDraw.Draw(sb)
draw.rounded_rectangle([2, 2, 518, 34], radius=6, fill=CARD, outline=BORDER)
draw.text((12, 10), "Free | D:0%  W:19%  $38.78", fill=WHITE, font=mono)
sb.save(r'D:\windsurf-quota\images\statusbar.png')

# ─── Tooltip Demo ────────────────────────────────────────────────────
tw, th = 480, 260
tt = Image.new('RGBA', (tw, th), BG)
draw = ImageDraw.Draw(tt)

y = 12
draw.text((14, y), "Free Plan - Live Stats", fill=WHITE, font=mono)
y += 20
draw.text((14, y), "Email: user@example.com", fill=DIM, font=mono_sm)
y += 18
# separator
draw.line([(14, y), (tw-14, y)], fill=BORDER, width=1)
y += 10

# Daily row
draw.text((14, y), "Daily        [..........]    0%   23h 11m", fill=WHITE, font=mono)
y += 18
# Weekly row
draw.text((14, y), "Weekly       [##........]   19%   23h 11m", fill=WHITE, font=mono)
y += 22
draw.line([(14, y), (tw-14, y)], fill=BORDER, width=1)
y += 10

# Cascade
draw.text((14, y), "CASCADE", fill=BLUE, font=mono)
y += 18
draw.text((14, y), "Messages     [##########]  100%    2500 / 2500", fill=WHITE, font=mono)
y += 18
draw.text((14, y), "Flows        [##########]  100%     500 / 500", fill=WHITE, font=mono)
y += 22
draw.line([(14, y), (tw-14, y)], fill=BORDER, width=1)
y += 10

draw.text((14, y), "Overage      [##........]        $38.78", fill=WHITE, font=mono)

tt.save(r'D:\windsurf-quota\images\tooltip.png')

# ─── Detail Panel Demo ────────────────────────────────────────────────
w, h = 620, 520
dp = Image.new('RGBA', (w, h), BG)
draw = ImageDraw.Draw(dp)

y = 16

# Card 1: Plan badge
draw.rounded_rectangle([16, y, w-16, y+50], radius=12, fill=CARD, outline=BORDER)
draw.rounded_rectangle([30, y+12, 130, y+38], radius=20, fill=(56, 139, 253, 40), outline=(88, 166, 255, 80))
draw.text((42, y+14), "FREE", fill=BLUE, font=badge_font)
draw.text((150, y+18), "user@email.com", fill=DIM, font=label_font)
y += 62

# Card 2: Daily quota bar
draw.rounded_rectangle([16, y, w-16, y+80], radius=12, fill=CARD, outline=BORDER)
draw.text((30, y+10), "Daily Quota", fill=WHITE, font=title_font)
draw.text((w-70, y+10), "0%", fill=RED, font=title_font)
draw.rounded_rectangle([30, y+38, w-30, y+62], radius=10, fill=(33, 38, 45))
draw.rounded_rectangle([30, y+38, 42, y+62], radius=10, fill=RED)
draw.text((w-140, y+68), "Resets in 2h 30m", fill=DIM, font=sub_font)
y += 92

# Card 3: Weekly quota bar
draw.rounded_rectangle([16, y, w-16, y+80], radius=12, fill=CARD, outline=BORDER)
draw.text((30, y+10), "Weekly Quota", fill=WHITE, font=title_font)
draw.text((w-70, y+10), "19%", fill=YELLOW, font=title_font)
draw.rounded_rectangle([30, y+38, w-30, y+62], radius=10, fill=(33, 38, 45))
bar_w = int((w-60) * 0.19)
draw.rounded_rectangle([30, y+38, 30+bar_w, y+62], radius=10, fill=YELLOW)
draw.text((w-150, y+68), "Resets in 1d 2h 30m", fill=DIM, font=sub_font)
y += 92

# Card 4: Cascade section
draw.rounded_rectangle([16, y, w-16, y+170], radius=12, fill=CARD, outline=BORDER)
draw.rounded_rectangle([16, y, 20, y+170], radius=2, fill=BLUE)

draw.text((34, y+10), "CASCADE", fill=BLUE, font=title_font)

stats = [
    ("MESSAGES", "2500", "0 / 2500 used", GREEN),
    ("FLOW ACTIONS", "500", "0 / 500 used", GREEN),
    ("OVERAGE", "$38.78", "Pay-per-use", BLUE),
    ("BILLING", "quota", "Strategy", DIM),
]

for i, (label, value, sub, color) in enumerate(stats):
    col = i % 2
    row = i // 2
    sx = 34 + col * 280
    sy = y + 38 + row * 66
    draw.rounded_rectangle([sx, sy, sx+260, sy+58], radius=10, fill=BG, outline=BORDER)
    draw.text((sx+12, sy+4), label, fill=DIM, font=label_font)
    draw.text((sx+12, sy+18), value, fill=color, font=value_font)
    draw.text((sx+12, sy+46), sub, fill=(100, 100, 100), font=sub_font)

y += 182

# Footer
draw.rounded_rectangle([16, y, w-16, y+30], radius=10, fill=CARD, outline=BORDER)
draw.ellipse([30, y+10, 40, y+20], fill=GREEN)
draw.text((46, y+8), "Live -- real-time", fill=DIM, font=label_font)
draw.text((w-120, y+8), "Billing: quota", fill=DIM, font=label_font)

dp.save(r'D:\windsurf-quota\images\detail-panel.png')

print("Demo images created: statusbar.png, tooltip.png, detail-panel.png")
