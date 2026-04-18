from PIL import Image, ImageDraw, ImageFont

# ─── Status Bar Demo ────────────────────────────────────────────────
sb = Image.new('RGBA', (600, 40), (30, 30, 30, 255))
draw = ImageDraw.Draw(sb)
try:
    font = ImageFont.truetype('consola.ttf', 14)
    font_sm = ImageFont.truetype('consola.ttf', 11)
except:
    font = ImageFont.load_default()
    font_sm = font

# Simulate status bar
draw.rounded_rectangle([4, 4, 596, 36], radius=6, fill=(45, 45, 45, 255))
draw.text((14, 12), "🌊 Free │ D:0% · W:59% · $45.84", fill=(200, 200, 200), font=font)
sb.save(r'D:\windsurf-quota\images\statusbar.png')

# ─── Detail Panel Demo ────────────────────────────────────────────────
w, h = 620, 580
dp = Image.new('RGBA', (w, h), (30, 30, 30, 255))
draw = ImageDraw.Draw(dp)

try:
    title_font = ImageFont.truetype('segoeui.ttf', 16)
    label_font = ImageFont.truetype('segoeui.ttf', 11)
    value_font = ImageFont.truetype('segoeui.ttf', 28)
    sub_font = ImageFont.truetype('segoeui.ttf', 10)
    bar_font = ImageFont.truetype('segoeui.ttf', 12)
except:
    title_font = font
    label_font = font_sm
    value_font = font
    sub_font = font_sm
    bar_font = font_sm

y = 16

# Card 1: Plan badge
draw.rounded_rectangle([16, y, w-16, y+50], radius=10, fill=(45, 45, 45, 255))
draw.rounded_rectangle([30, y+12, 120, y+38], radius=16, fill=(56, 139, 253, 60))
draw.text((40, y+14), "🌊 FREE", fill=(88, 166, 255), font=title_font)
draw.text((140, y+18), "user@email.com", fill=(140, 140, 140), font=label_font)
y += 62

# Card 2: Daily quota bar
draw.rounded_rectangle([16, y, w-16, y+80], radius=10, fill=(45, 45, 45, 255))
draw.text((30, y+10), "☀ Daily Quota", fill=(200, 200, 200), font=title_font)
draw.text((w-80, y+10), "0%", fill=(248, 81, 73), font=title_font)
# Bar track
draw.rounded_rectangle([30, y+38, w-30, y+62], radius=6, fill=(60, 60, 60, 255))
# Bar fill (red, tiny)
draw.rounded_rectangle([30, y+38, 42, y+62], radius=6, fill=(248, 81, 73, 255))
draw.text((w-140, y+68), "⏱ Resets in 2h 30m", fill=(140, 140, 140), font=sub_font)
y += 92

# Card 3: Weekly quota bar
draw.rounded_rectangle([16, y, w-16, y+80], radius=10, fill=(45, 45, 45, 255))
draw.text((30, y+10), "📅 Weekly Quota", fill=(200, 200, 200), font=title_font)
draw.text((w-80, y+10), "59%", fill=(227, 179, 65), font=title_font)
# Bar track
draw.rounded_rectangle([30, y+38, w-30, y+62], radius=6, fill=(60, 60, 60, 255))
# Bar fill (yellow, 59%)
bar_w = int((w-60) * 0.59)
draw.rounded_rectangle([30, y+38, 30+bar_w, y+62], radius=6, fill=(210, 153, 34, 255))
draw.text((30+bar_w//2-10, y+42), "59%", fill=(255, 255, 255), font=bar_font)
draw.text((w-150, y+68), "⏱ Resets in 1d 2h 30m", fill=(140, 140, 140), font=sub_font)
y += 92

# Card 4: Cascade section
draw.rounded_rectangle([16, y, w-16, y+180], radius=10, fill=(45, 45, 45, 255))
# Blue left border
draw.rounded_rectangle([16, y, 20, y+180], radius=2, fill=(88, 166, 255, 255))

draw.text((34, y+10), "⚡ CASCADE", fill=(88, 166, 255), font=title_font)

# Stat grid: 2x2
stats = [
    ("MESSAGES", "2500", "0 / 2500 used", (126, 231, 135)),
    ("FLOW ACTIONS", "500", "0 / 500 used", (126, 231, 135)),
    ("OVERAGE BALANCE", "$45.84", "Pay-per-use credits", (88, 166, 255)),
    ("BILLING", "quota", "Strategy", (140, 140, 140)),
]

for i, (label, value, sub, color) in enumerate(stats):
    col = i % 2
    row = i // 2
    sx = 34 + col * 280
    sy = y + 40 + row * 70
    draw.rounded_rectangle([sx, sy, sx+260, sy+60], radius=6, fill=(30, 30, 30, 255))
    draw.text((sx+10, sy+4), label, fill=(140, 140, 140), font=label_font)
    draw.text((sx+10, sy+18), value, fill=color, font=value_font)
    draw.text((sx+10, sy+48), sub, fill=(100, 100, 100), font=sub_font)

y += 192

# Footer
draw.rounded_rectangle([16, y, w-16, y+30], radius=6, fill=(45, 45, 45, 255))
draw.ellipse([30, y+10, 38, y+18], fill=(46, 160, 67))  # green dot
draw.text((44, y+8), "Live — updates in real-time", fill=(140, 140, 140), font=label_font)

dp.save(r'D:\windsurf-quota\images\detail-panel.png')

print("Demo images created!")
