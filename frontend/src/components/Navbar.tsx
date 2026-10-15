import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  FilePlus2,
  Info,
  Menu,
  Users,
  X,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar" role="banner">
      <div className="nav-brand">
        <div className="brand-icon" aria-hidden="true">
          <Activity size={22} />
        </div>
        <span>CarePulse AI</span>
        <span className="brand-badge">Demo</span>
      </div>

      <button
        className="nav-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav
        className={`nav-links ${mobileMenuOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          <BarChart3 size={16} aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          <Users size={16} aria-hidden="true" />
          <span>Patient Monitoring</span>
        </NavLink>

        <NavLink
          to="/assessment"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          <FilePlus2 size={16} aria-hidden="true" />
          <span>New Assessment</span>
        </NavLink>

        <NavLink
          to="/model-card"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          <BrainCircuit size={16} aria-hidden="true" />
          <span>Model Transparency</span>
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          <Info size={16} aria-hidden="true" />
          <span>About & Safety</span>
        </NavLink>
      </nav>
    </header>
  );
};
