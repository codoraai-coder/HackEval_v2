import React, { useState } from "react";
import "./Submission.css";
import { API_BASE_URL } from "../config";

const Submissions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const submitFile = async () => {
    if (!selectedFile) {
      setStatusMessage("Please select a PPT or PDF file.");
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage("");
      const token = localStorage.getItem("token");
      const team = JSON.parse(localStorage.getItem("team") || "{}");

      if (!team?._id || !token) {
        setStatusMessage("Session expired. Please sign in again.");
        return;
      }

      const leaderEmail =
        (team.members || []).find((m) => m.isLeader)?.email || team.email;

      const fd = new FormData();
      fd.append("pptFile", selectedFile);
      fd.append("leaderEmail", leaderEmail);

      const res = await fetch(
        `${API_BASE_URL}/team/ppt/${team._id}/submit-ppt`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Upload failed");
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      const team = JSON.parse(localStorage.getItem("team") || "{}");

      const res = await fetch(
        `${API_BASE_URL}/team/ppt/${team._id}/ppt-analysis`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Analysis not available yet");
      }

      setAnalysis(payload.data?.pptSubmission || null);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  return (
    <div className="team-schedule-container">
      {/* Header */}
      <div className="team-schedule-header">
        <h1 className="team-schedule-title">
          <span className="team-schedule-title-text">PROJECT SUBMISSION</span>
          <span className="team-schedule-title-highlight"></span>
        </h1>

        <div className="team-schedule-timer">
          <div className="team-schedule-timer-label">SUBMISSION STATUS</div>
          <div className="team-schedule-timer-digits">
            {analysis ? "EVALUATED" : "PENDING"}
          </div>
        </div>
      </div>

      {/* Section */}
      <div className="team-schedule-section">
        <div className="team-schedule-section-header team-schedule-gradient">
          <div className="team-schedule-section-title">
            <span className="team-schedule-section-number">01</span>
            <span className="team-schedule-section-text">UPLOAD FILE</span>
          </div>
        </div>

        <p className="submission-desc">
          Upload your project PPT or PDF. Our system will analyze it and
          generate evaluation insights.
        </p>

        <div className="submission-upload-row">
          <label className="file-input-box">
            <input
              type="file"
              accept=".ppt,.pptx,.pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              hidden
            />
            {selectedFile ? selectedFile.name : "📁 Choose File"}
          </label>

          <button
            className="submission-btn"
            onClick={submitFile}
            disabled={isLoading || !selectedFile}
          >
            🚀 Upload & Analyze
          </button>
        </div>
        {statusMessage && (
          <div className="submission-error">{statusMessage}</div>
        )}
      </div>

      {/* Analysis Section */}
      <div className="team-schedule-section">
        <div className="team-schedule-section-header team-schedule-gradient">
          <div className="team-schedule-section-title">
            <span className="team-schedule-section-number">02</span>
            <span className="team-schedule-section-text">ANALYSIS RESULT</span>
          </div>
        </div>

        <div className="analysis-card">
          <button className="analysis-btn" onClick={checkAnalysis}>
            🔍 Check Latest Analysis
          </button>

          {analysis ? (
            <div className="analysis-details">
              <div>
                <strong>Status:</strong> {analysis.analysisStatus}
              </div>
              {analysis.analysisDate && (
                <div>
                  <strong>Completed At:</strong>{" "}
                  {new Date(analysis.analysisDate).toLocaleString()}
                </div>
              )}
              {analysis.analysisResults && (
                <>
                  {/* <div>
                    <strong>Overall Score:</strong>{" "}
                    {analysis.analysisResults.overall_score ?? "N/A"}
                  </div> */}
                  <div>
                    <strong>Summary:</strong>{" "}
                    {analysis.analysisResults.summary ?? "N/A"}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="analysis-empty">No analysis available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submissions;
