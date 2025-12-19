import React, { useState, useEffect } from "react";
import "./Submission.css";
import { API_BASE_URL } from "../config";

const Submissions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {}, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const submitFile = async () => {
    if (!selectedFile) {
      setStatusMessage("Please select a PPT/PDF file first.");
      return;
    }
    setIsLoading(true);
    setStatusMessage("");
    setShowSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const team = JSON.parse(localStorage.getItem("team") || "{}");
      if (!team?._id || !token) {
        setStatusMessage("No authenticated session. Please sign in.");
        setIsLoading(false);
        return;
      }

      const leaderEmail =
        (team.members || []).find((m) => m.isLeader)?.email || team.email;
      const fd = new FormData();
      fd.append("pptFile", selectedFile);
      fd.append("leaderEmail", leaderEmail);

      const res = await fetch(
        `${API_BASE_URL}/team/team-ppt/${team._id}/submit-ppt`,
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
      setStatusMessage(
        "File uploaded and queued for evaluation. Check back for analysis.",
      );
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      setStatusMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      const team = JSON.parse(localStorage.getItem("team") || "{}");
      if (!team?._id || !token) {
        setStatusMessage("No authenticated session. Please sign in.");
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/team/team-ppt/${team._id}/ppt-analysis`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to load analysis");
      }
      setAnalysis(payload.data?.pptSubmission || null);
      setStatusMessage("");
    } catch (e) {
      setStatusMessage(e.message);
    }
  };

  return (
    <div className="submissions-page">
      <div className="submissions-container">
        <h1>Project Submissions</h1>

        <div className="submission-upload">
          <h2>Submit Your Project</h2>
          <p className="upload-description">
            Upload your PPT/PDF. We’ll analyze it and show the results here.
          </p>

          <input
            type="file"
            accept=".ppt,.pptx,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileChange}
            disabled={isLoading}
            style={{ marginBottom: 16 }}
          />

          <button
            className={`google-form-btn ${isLoading ? "loading" : ""}`}
            onClick={submitFile}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Uploading...
              </>
            ) : (
              <>🚀 Upload and Analyze</>
            )}
          </button>

          {showSuccess && (
            <div className="success-message">
              ✨ File uploaded! We’re processing it. You can check the analysis
              below.
            </div>
          )}

          {statusMessage && (
            <div
              className="success-message"
              style={{ borderLeftColor: "#0891b2" }}
            >
              {statusMessage}
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 800, textAlign: "center" }}>
          <button
            className="download-btn"
            onClick={checkAnalysis}
            style={{ marginBottom: 16 }}
          >
            Check Analysis
          </button>

          {analysis ? (
            <div className="member-list" style={{ textAlign: "left" }}>
              <h4>Latest Analysis</h4>
              <ul>
                <li>Status: {analysis.analysisStatus}</li>
                {analysis.analysisDate && (
                  <li>
                    Completed At:{" "}
                    {new Date(analysis.analysisDate).toLocaleString()}
                  </li>
                )}
                {analysis.analysisResults && (
                  <>
                    <li>
                      Overall Score:{" "}
                      {analysis.analysisResults.overall_score ?? "N/A"}
                    </li>
                    <li>
                      Summary: {analysis.analysisResults.summary ?? "N/A"}
                    </li>
                  </>
                )}
              </ul>
            </div>
          ) : (
            <div className="member-list">
              <h4>No analysis yet</h4>
            </div>
          )}
        </div>

        <div className="page-bottom-spacer" />
      </div>
    </div>
  );
};

export default Submissions;
