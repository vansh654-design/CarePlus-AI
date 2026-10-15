import React, { useCallback, useEffect, useState } from "react";
import { apiService } from "../services/api";
import { PatientRecord, PatientSummary } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PatientDetailModal } from "../components/PatientDetailModal";
import {
  AlertCircle,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { formatDateTime } from "../utils/formatters";

export const PatientMonitoring: React.FC = () => {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("priority_desc");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPatients(search, categoryFilter, sortBy);
      setPatients(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load patient records from backend.");
      }
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, sortBy]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setSortBy("priority_desc");
    // Directly fetch without filters
    apiService.getPatients("", "", "priority_desc").then(setPatients);
  };

  const handleViewPatient = async (patientId: string) => {
    try {
      const details = await apiService.getPatientDetails(patientId);
      setSelectedPatient(details);
    } catch {
      alert("Unable to fetch patient record details.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Users size={26} color="#0284c7" aria-hidden="true" />
          Synthetic Patient Monitoring
        </h1>
        <p className="page-description">
          Review synthetic patient observations, filter by demonstration review category, and inspect observation histories.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: "1rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search
              size={18}
              style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              aria-hidden="true"
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "2.3rem" }}
              placeholder="Search by ID (e.g. DEMO-001) or Care Unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search synthetic patients"
            />
          </div>

          <div style={{ flex: "0 1 200px" }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Demonstration Category"
            >
              <option value="">All Categories</option>
              <option value="Higher demonstration review priority">Higher Priority</option>
              <option value="Review suggested by demonstration model">Review Suggested</option>
              <option value="Routine demonstration review">Routine Review</option>
            </select>
          </div>

          <div style={{ flex: "0 1 180px" }}>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort synthetic patients"
            >
              <option value="priority_desc">Priority: High to Low</option>
              <option value="priority_asc">Priority: Low to High</option>
              <option value="age_desc">Age: Oldest to Youngest</option>
              <option value="id">Identifier</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Search
          </button>

          {(search || categoryFilter || sortBy !== "priority_desc") && (
            <button type="button" onClick={handleClearFilters} className="btn btn-secondary">
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert-box alert-danger" role="alert">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Error Loading Patients</strong>
            <p style={{ marginTop: "0.2rem" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }} role="status">
          <RefreshCw size={28} className="spinning" style={{ margin: "0 auto 1rem", color: "#0284c7" }} />
          <p style={{ color: "#64748b" }}>Loading synthetic patient telemetry...</p>
        </div>
      ) : patients.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }} role="region" aria-label="Empty search results">
          <Filter size={36} color="#94a3b8" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.15rem", color: "#0f172a", marginBottom: "0.5rem" }}>
            No Matching Synthetic Records Found
          </h2>
          <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 auto 1.5rem auto", fontSize: "0.875rem" }}>
            No synthetic patients matched your search criteria {search ? `"${search}"` : ""}. Try clearing filters or searching for an ID like "DEMO-001".
          </p>
          <button onClick={handleClearFilters} className="btn btn-primary">
            Clear Filters & View All
          </button>
        </div>
      ) : (
        /* Patients Data Table */
        <div className="table-container">
          <table className="data-table" aria-label="Synthetic patient monitoring directory">
            <thead>
              <tr>
                <th scope="col">Patient ID</th>
                <th scope="col">Demographics</th>
                <th scope="col">Care Unit</th>
                <th scope="col">SpO2</th>
                <th scope="col">Heart Rate</th>
                <th scope="col">BP</th>
                <th scope="col">Demonstration Priority</th>
                <th scope="col">Threshold Flags</th>
                <th scope="col">Last Telemetry</th>
                <th scope="col" style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((pt) => (
                <tr key={pt.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{pt.id}</span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>
                      {pt.display_code}
                    </span>
                  </td>
                  <td>
                    {pt.age} yrs • {pt.biological_sex}
                  </td>
                  <td>{pt.unit}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: pt.current_vital_signs.oxygen_saturation < 92 ? "#dc2626" : "#0f172a" }}>
                      {pt.current_vital_signs.oxygen_saturation}%
                    </span>
                  </td>
                  <td>{pt.current_vital_signs.heart_rate} bpm</td>
                  <td>{pt.current_vital_signs.systolic_blood_pressure} mmHg</td>
                  <td>
                    <StatusBadge category={pt.demonstration_category} />
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                      Score: {Math.round(pt.review_priority_score * 100)}%
                    </span>
                  </td>
                  <td>
                    {pt.illustrative_flags.length > 0 ? (
                      <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>
                        {pt.illustrative_flags.length} Flag{pt.illustrative_flags.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>None</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#475569" }}>
                    {formatDateTime(pt.last_updated)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleViewPatient(pt.id)}
                      className="btn btn-secondary"
                      style={{ padding: "0.35rem 0.65rem", fontSize: "0.8125rem" }}
                      aria-label={`View clinical observation details for patient ${pt.id}`}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
};
