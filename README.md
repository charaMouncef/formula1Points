# 🏎️ Formula 1 Points Tracker

A web application built with **React + Vite** that tracks Formula 1 standings, historical race results, and the current season schedule — all in one place, with smooth animations and a modern UI.

🔗 **Live Site:** [formula1points.netlify.app](https://formula1points.netlify.app)

---

## ✨ Features

### 🏆 Championship Standings (Current Season)
- Interactive **Drivers' Championship** and **Constructors' Championship** points charts via Recharts
- Color-coded cards matching each team's official livery
- Click any driver or constructor card to expand last 3 race results, click again for the full modal with complete race-by-race breakdown
- Close modals via **X button**, overlay click, or **browser back button**

### 📋 Race & Qualifying Results Archive (2018 – Present)
- Browse results by **season** (2018 through current) and **round**
- Filter by **session type**: Race, Qualifying, Sprint, etc.
- Each result card shows position, points, driver number, and status (DNF, DSQ, etc.)
- Team-colored left borders for quick visual identification
- Navigate directly from a schedule race to its results via URL params (`/sessions?round=4&year=2026`)

### 📅 Season Schedule
- Full calendar of the **current F1 season**
- **Ended races** display the **top 3 finishers** (P1, P2, P3) with podium styling (gold/silver/bronze)
- Click any ended race to jump directly to its **Race session results**
- **Next race** featured in a prominent dark countdown block with **days & hours remaining**
- Remaining upcoming races shown in a grid

### 🎬 Animations
- Scroll-triggered fade-in-up sections using **Motion** (formerly Framer Motion)
- Staggered card entrance animations in grids
- Spring-physics hover/tap effects on all interactive elements
- Smooth page transitions via `AnimatePresence`
- Animated modals with scale + fade transitions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 6** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Motion** | Animations & transitions |
| **React Router v7** | Client-side routing & URL params |
| **Recharts** | Championship points charts |
| **Lucide React** | Icon library |
| **React Toastify** | Toast notifications |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- npm `v9+`

### Installation

```bash
# Clone the repository
git clone https://github.com/charaMouncef/formula1Points.git

# Navigate into the project
cd formula1Points

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder.

### Lint

```bash
npm run lint
```

---

## 📁 Project Structure

```
formula1Points/
├── public/                  # Static assets (favicon, etc.)
├── src/
│   ├── assets/              # JSON data files (session results, schedule)
│   ├── Components/
│   │   ├── AnimatedSection.jsx   # Scroll-triggered animation wrapper
│   │   └── Navbar.jsx            # Responsive navigation bar
│   ├── Pages/
│   │   ├── CurrentSession.jsx    # Home — current season standings
│   │   ├── Schedule.jsx          # Season schedule with countdown
│   │   └── Session.jsx           # Race/qualifying results archive
│   ├── reducers/                 # useReducer state management
│   ├── App.jsx                   # App shell + animated routes
│   ├── index.css                 # Tailwind imports + global styles
│   └── main.jsx                  # Entry point
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## 🌐 Deployment

This project is deployed on **Netlify** with automatic deploys on every push to `main`.

To deploy manually:
```bash
npm run build
# Then drag the dist/ folder into Netlify, or use the Netlify CLI
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Data sourced from the Formula 1 media API. This project is not affiliated with Formula 1 or the FIA.
