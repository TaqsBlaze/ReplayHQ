import React from 'react';
import { BrowserRouter, Routes, Route, Location } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
        <AnimatePresence>
          <motion.div
            key={location.key ?? location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
