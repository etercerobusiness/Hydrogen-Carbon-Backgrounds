# Hydrogen-Carbon Backgrounds

Interactive WebGL 2 live wallpapers for **Gemini 4 Hydrogen** and **Gemini 4 Carbon**, packaged as self-contained non-module bundles (`bundle.js`) so they run directly over `file://` in **Wallpaper Engine (Windows)** and **Ubuntu Linux** live wallpaper tools without CORS errors.

## Included Wallpapers

- **`gemini_4_carbon/`** — Gemini 4 Carbon 3D raymarched crystal & particle constellation
- **`gemini_4_hydrogen/`** — Gemini 4 Hydrogen interactive WebGL 2 hero animation

Each folder is self-contained with:
- `index.html`, `bundle.js`, `styles.css` (non-module IIFE WebGL 2 runtime)
- `poster-dark.webp`, `poster-light.webp` (theme fallback posters)
- `preview.jpg` (clean artwork preview)
- `project.json` (Wallpaper Engine `web` project manifest)

---

## Install Instructions for AGY (Antigravity)

Paste the prompt below into **AGY (Antigravity)** on either **Windows** or **Ubuntu Linux** to have AGY install and configure these backgrounds automatically:

> **Prompt for AGY:**
> ```text
> Clone https://github.com/etercerobusiness/Hydrogen-Carbon-Backgrounds and install both `gemini_4_carbon` and `gemini_4_hydrogen` as live desktop backgrounds on this machine:
> - On Windows: Locate Wallpaper Engine's `projects/myprojects` directory (usually `C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\projects\myprojects`), copy both `gemini_4_carbon` and `gemini_4_hydrogen` into it, ensure Windows Desktop Background is set to Picture (not Slideshow, `BackgroundType = 0` in `HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Wallpapers`) so Windows doesn't fight Wallpaper Engine, and open/apply the chosen wallpaper in Wallpaper Engine.
> - On Ubuntu Linux: Clone the repo to `~/Pictures/Hydrogen-Carbon-Backgrounds`, check if Hidamari (`io.github.jeffshee.Hidamari` via Flatpak) or KDE Plasma HTML wallpaper is installed (or install Hidamari if needed), and configure it to load `file://$HOME/Pictures/Hydrogen-Carbon-Backgrounds/gemini_4_hydrogen/index.html` (or `gemini_4_carbon/index.html`) as a Webpage wallpaper.
> ```

---

## Manual Setup

### Windows (Wallpaper Engine)
1. Copy `gemini_4_carbon/` and `gemini_4_hydrogen/` into your Wallpaper Engine `projects/myprojects/` folder:
   ```text
   C:\Program Files (x86)\Steam\steamapps\common\wallpaper_engine\projects\myprojects\
   ```
2. In **Windows Settings → Personalization → Background**, set **Personalize your background** to **Picture** (not *Slideshow*), so Windows doesn't override Wallpaper Engine.
3. Open **Wallpaper Engine** → **Installed** tab → select **Gemini 4 Carbon** or **Gemini 4 Hydrogen**.
4. *(Optional)* In Wallpaper Engine **Settings → Performance**, set **FPS** to `60` for full smoothness. Note that first-time WebGL shader compilation can take a few seconds, and `playbackmaximized: pause` will pause the animation if a maximized window covers the desktop.

### Ubuntu Linux (Without Wallpaper Engine)
1. Clone this repository:
   ```bash
   git clone https://github.com/etercerobusiness/Hydrogen-Carbon-Backgrounds.git ~/Pictures/Hydrogen-Carbon-Backgrounds
   ```
2. **Option A — Interactive WebGL (Hidamari):**
   - Install [Hidamari](https://flathub.org/apps/io.github.jeffshee.Hidamari) via Flatpak:
     ```bash
     flatpak install flathub io.github.jeffshee.Hidamari
     ```
   - Open Hidamari, choose **Webpage**, and point it to:
     - `file:///home/<your-user>/Pictures/Hydrogen-Carbon-Backgrounds/gemini_4_hydrogen/index.html`
     - or `file:///home/<your-user>/Pictures/Hydrogen-Carbon-Backgrounds/gemini_4_carbon/index.html`
3. **Option B — KDE Plasma:**
   - Use a Plasma HTML Wallpaper plugin in **Configure Desktop and Wallpaper** and point it to either `index.html`.
