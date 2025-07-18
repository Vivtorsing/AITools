import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import AIChat from './pages/AIChat';
import AIImage from './pages/AIImage';

function App() {
  return (
    <HelmetProvider>
      <Router basename="/AITools">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/aiimage" element={<AIImage />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
