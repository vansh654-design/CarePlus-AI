import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { OverviewDashboard } from "./pages/OverviewDashboard";
import { PatientMonitoring } from "./pages/PatientMonitoring";
import { NewAssessment } from "./pages/NewAssessment";
import { ModelTransparency } from "./pages/ModelTransparency";
import { AboutSafety } from "./pages/AboutSafety";

export const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <DisclaimerBanner />
        <Navbar />

        <main className="main-content" id="main-content" role="main">
          <Routes>
            <Route path="/" element={<OverviewDashboard />} />
            <Route path="/patients" element={<PatientMonitoring />} />
            <Route path="/assessment" element={<NewAssessment />} />
            <Route path="/model-card" element={<ModelTransparency />} />
            <Route path="/about" element={<AboutSafety />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer" role="contentinfo">
          <div>
            <strong>CarePulse AI</strong> — Explainable Patient Monitoring and Early-Warning Assistant
          </div>
          <div style={{ marginTop: "0.25rem", color: "#64748b" }}>
            Educational Hackathon Demonstration • 100% Synthetic Data • Not For Clinical Use
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
