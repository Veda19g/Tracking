import React from 'react'
import Tracking from './components/Tracking'
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tracking />} />
        <Route path="/create/:roomId/:startLat/:startLng/:endLat/:endLng" element={<CreateRoom />} />
        <Route path="/join/:roomId" element={<JoinRoom />} />
      </Routes>
    </Router>
  )
}

export default App
