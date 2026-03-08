### formula1Points
# 🏎️ Formula 1 Points Tracker

A web application built with **React + Vite** that tracks Formula 1 standings, historical race results, and the current season schedule — all in one place.

🔗 **Live Site:** [formula1points.netlify.app](https://formula1points.netlify.app)

---

## 📸 Features

### 🏆 Championship Standings
- Interactive charts displaying the **Drivers' Championship** and **Constructors' Championship** points for the current season
- Each team is color-coded with their official livery color
- Updated after every race weekend

### 📋 Race Results (2018 – Present)
- Full archive of **race and qualifying results** from the 2018 season up to today
- Browse by season and round
- Includes driver positions, fastest laps, and grid positions

### 📅 Season Schedule
- Full calendar of the **current F1 season**
- **Completed races** display the **top 3 finishers** (P1, P2, P3) with their results
- **Upcoming races** show the **date, circuit name, and circuit image** so you know what's coming next

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Recharts / Chart.js | Championship points charts |
| Ergast API / OpenF1 API | Formula 1 data |
| Netlify | Deployment |

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

---

## 📁 Project Structure

```
formula1Points/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/
│   │   ├── Standings/  # Championship points charts
│   │   ├── Results/    # Race & qualifying results archive
│   │   └── Schedule/   # Season schedule page
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
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

> Data provided by the [Ergast Developer API](http://ergast.com/mrd/) and/or [OpenF1 API](https://openf1.org/). This project is not affiliated with Formula 1 or the FIA.
