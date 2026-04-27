# 📏 Unit Converter

**Unit Converter** is a versatile and user-friendly web application for converting between various units across different categories. Built with a modern, minimalist design, it provides real-time results, formula explanations, and localized support.

The project features a premium UI/UX inspired by modern design standards, ensuring a seamless experience across all devices.

[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6-yellow)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn-UI-black)](https://ui.shadcn.com/)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-9ca3af)

## ✨ Key Features

### 📏 Real-Time Conversion
- Convert as you type with instant updates.
- Support for multiple categories: Length, Weight, Temperature, Volume, Area, Speed, and more.
- Quick swap button to reverse "From" and "To" units.

### 🎨 Minimalist Design
- Modern black and white aesthetic with a clean, light gray background.
- High-quality typography and visual hierarchy using Shadcn UI.
- Smooth animations and interactive hover states.

### 🌐 Multilingual Support
- Fully localized interface in **English**, **Spanish**, and **French**.
- Powered by `i18next` for seamless language switching.

### ⭐ Favorites & History
- Save your most used conversions for quick access.
- View a history of recent conversions to keep track of your work.
- Persisted locally for convenience.

### 📱 PWA & Mobile Optimized
- Fully responsive layout tailored for mobile, tablet, and desktop.
- Installable as a Progressive Web App (PWA) with a dedicated splash screen and icon.

## 🛠 Tech Stack

### Frontend
- **React 19**
- **Vite 6** (Fast build & HMR)
- **Tailwind CSS** (Utility-first styling)
- **Shadcn UI / Radix UI** (Accessible components)
- **Lucide React** (Iconography)

### Utilities
- **i18next** (Internationalization)
- **Decimal.js** (Precision math)
- **Chart.js** (Visualizing conversion trends/data)
- **Local Storage** (Persistence)

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **npm**

### Installation
```bash
git clone https://github.com/Rixouu/unit-converter.git
cd unit-converter
npm install
npm run dev
```

Default dev URL: **http://localhost:5173**

## 📁 Project Structure
```txt
unit-converter/
├── public/           # Static assets (icons, manifest, sw.js)
├── src/
│   ├── components/   # Shared UI components (shadcn)
│   ├── lib/          # Utilities (utils.js)
│   ├── locales/      # i18n translation files
│   ├── utils/        # Conversion logic and formulas
│   └── ...           # App, main, index.css
├── tailwind.config.js
└── vite.config.js
```

## 📱 PWA Setup
- **Manifest**: `public/manifest.json` defines the app identity.
- **Service Worker**: `public/sw.js` ensures basic offline capabilities and installability.
- **Icons**: Branded icons and splash screens generated for various devices.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Team
- **Jonathan Rycx** — Lead Developer — [Rixouu](https://github.com/Rixouu)

## 🙏 Acknowledgments
- [Shadcn UI](https://ui.shadcn.com/) for the UI foundation.
- [Tailwind CSS](https://tailwindcss.com/) for the styling system.
- [Lucide Icons](https://lucide.dev/) for the clean iconography.

---

**Built with ❤️ for precision and simplicity.**
