# 🎵 JMusic

A high-performance, aesthetically pleasing music player built with **React Native** and **Expo**. Designed for the modern audiophile, **JMusic** combines professional-grade features with a minimalist, gesture-driven interface.

---

<p align="center">
  <img src="https://img.shields.io/badge/Status-Development-orange?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web%20%7C%20Desktop-lightgrey?style=for-the-badge&logo=react" alt="Platform" />
  <img src="https://img.shields.io/badge/Engine-Expo--Audio-0081ff?style=for-the-badge" alt="Engine" />
</p>

---

## ✨ Core Features

### 🎧 Superior Playback Control
- **Dynamic Store:** Powered by **Zustand** for ultra-smooth, synchronized playback states.
- **Precision Audio:** Integrated with `expo-audio` for high-fidelity sound.
- **Smart Queue:** Advanced shuffle and repeat modes (`none`, `one`, `all`).

### 📂 Professional Organization
- **Native Navigation:** Fluid screen transitions powered by **React Navigation**.
- **Metadata Engine:** Automatically extracts **Artist**, **Album**, and **Artwork** from your local files.
- **Virtual Folders:** Categorize your library with custom folders for quick access.

### 🛠 Audiophile Tools
- **FX Suite:** Playback speed controls with an in-progress FX interface.
- **Sleep Timer:** Intelligent countdown to gracefully stop your music.
- **Adaptive UI:** Seamlessly switch between **Obsidian Dark** and **Pure Light** modes.

---

## 🛠 Tech Stack & Architecture

- **Runtime:** [Expo SDK 55](https://expo.dev/)
- **UI Architecture:** React Native (TypeScript)
- **Desktop Wrapper:** [Electron](https://www.electronjs.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Navigation:** [React Navigation v7](https://reactnavigation.org/)
- **Audio Processing:** `expo-audio`
- **Metadata Parsing:** `music-metadata-browser`
- **Iconography:** `lucide-react-native`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Expo Go** (Available on iOS/Android)

### Installation & Launch

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LoganDoesThings/projectjmusic.git
   cd projectjmusic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Fire it up (Mobile/Web):**
   ```bash
   npx expo start
   ```

4. **Fire it up (Desktop Dev Mode):**
   ```bash
   npm run electron:start
   ```

---

## 🚀 Deployment

### Web
See [WEB.md](./WEB.md) for web hosting instructions.

### Android (Google Play)
See [RELEASE_ANDROID.md](./RELEASE_ANDROID.md) for a step-by-step guide on publishing to the Google Play Store.

---

## 📦 Desktop Releases

We provide installable solutions for multiple desktop platforms:

- **Linux (.deb):** `dist-desktop/projectjmusic_1.0.0_amd64.deb`
- **Linux (.AppImage):** `dist-desktop/JMusic-1.0.0.AppImage` (Portable)
- **Windows (.exe):** `dist-desktop/JMusic Setup 1.0.0.exe`

### Build instructions:
- Build Linux: `npm run electron:build:linux`
- Build Windows: `npm run electron:build:win`

---

## 🆕 What's New (v1.1.0)
- **Full Desktop Support:** Integrated Electron for native Linux and Windows applications.
- **Cross-Platform Packaging:** Automated builds for `.deb`, `.AppImage`, and `.exe` formats.
- **Polished Desktop UI:** Dark theme optimization and hidden menu bars for a clean look.
- **Improved Metadata Stability:** Hardened metadata parsing for malformed files.

---

## 📸 UI Gallery

*(Add your screenshots here later to make it even fancier!)*

---

<p align="center">
  Crafted with ❤️ by <b>Logan</b>
</p>
