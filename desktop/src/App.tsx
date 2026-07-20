import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Runs from "./pages/Runs";
import Events from "./pages/Events";
import Files from "./pages/Files";
import Metrics from "./pages/Metrics";
import Plugins from "./pages/Plugins";
import Settings from "./pages/Settings";
import Replay from "./pages/Replay";
import DiffViewerPage from "./pages/DiffViewer";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/replay" element={<ReplayIndex />} />
          <Route path="/replay/:id" element={<Replay />} />
          <Route path="/events" element={<Events />} />
          <Route path="/files" element={<Files />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/diff" element={<DiffViewerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

const ReplayIndex: React.FC = () => (
  <div className="p-6 fade-in">
    <h1 className="text-[18px] font-semibold text-text">Replay</h1>
    <p className="text-[12px] text-muted mt-1 max-w-md">
      Select a run from the{" "}
      <a href="/runs" className="text-accent hover:underline">Runs</a> page to
      replay it. The replay viewer shows the event timeline and lets you
      inspect each event.
    </p>
  </div>
);

const NotFound: React.FC = () => (
  <div className="p-6 fade-in text-center">
    <div className="text-[14px] text-text">Not found</div>
    <p className="text-[12px] text-muted mt-1">The page you requested does not exist.</p>
  </div>
);

export default App;
