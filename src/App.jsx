import Navbar from "./Components/Navbar"
import Session from "./Pages/Session"
import Schedule from "./Pages/Schedule";
import CurrentSession from "./Pages/CurrentSession"


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/sessions" element={<Session />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/" element={<CurrentSession />} />
      </Routes>
      
    </Router>
  )
}

export default App
