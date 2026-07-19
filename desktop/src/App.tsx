import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import About from './pages/About';
import Runs from './pages/Runs';
import Events from './pages/Events';
import Files from './pages/Files';
import Metrics from './pages/Metrics';
import Plugins from './pages/Plugins';
import Replay from './pages/Replay';
import DiffViewerPage from './pages/DiffViewer';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/files" element={<Files />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/replay/:id" element={<Replay />} />
          <Route path="/diff" element={<DiffViewerPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
