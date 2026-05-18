import Navbar from "./Components/Navbar"
import Session from "./Pages/Session"
import Schedule from "./Pages/Schedule";
import CurrentSession from "./Pages/CurrentSession"

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "motion/react";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/sessions" element={<Session />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/" element={<CurrentSession />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Navbar/>
      <AnimatedRoutes />
    </Router>
  )
}

export default App
