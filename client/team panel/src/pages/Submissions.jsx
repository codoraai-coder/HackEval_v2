import React, { useState, useEffect } from "react";
import "./Submission.css";

const Submissions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoogleForm = async () => {
    setIsLoading(true);
    setTimeout(() => {
      window.open("https://forms.gle/UmcmyMqyq5kZF7SD7", "_blank");
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const mockSubmissions = [
    {
      id: 1,
      title: "Initial Project Proposal",
      submittedAt: "2024-03-15 14:30",
      status: "Reviewed",
      feedback:
        "Great initial concept! Please expand on the technical implementation details in your next submission.",
    },
    {
      id: 2,
      title: "Technical Documentation",
      submittedAt: "2024-03-18 09:15",
      status: "Pending Review",
      feedback: null,
    },
    {
      id: 3,
      title: "Prototype Demo",
      submittedAt: "2024-03-20 16:45",
      status: "Approved",
      feedback:
        "Excellent work! The prototype demonstrates strong technical skills and innovation.",
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#22c55e";
      case "pending review":
        return "#ffc107";
      case "reviewed":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  const getStatusEmoji = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "✅";
      case "pending review":
        return "⏳";
      case "reviewed":
        return "👁️";
      default:
        return "📄";
    }
  };

  return (
    <div className="submissions-page">
      <div className={`submissions-container ${isVisible ? "visible" : ""}`}>
        <h1>Project Submissions</h1>

        <div className="submission-upload">
          <h2>Submit Your Project</h2>
          <p className="upload-description">
            Ready to submit your project? Click the button below to access our
            submission form. Make sure you have all your project files and
            documentation ready!
          </p>

          <button
            className={`google-form-btn ${isLoading ? "loading" : ""}`}
            onClick={handleGoogleForm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Opening Form...
              </>
            ) : (
              <>🚀 Go to Submission Form</>
            )}
          </button>

          {showSuccess && (
            <div className="success-message">
              ✨ Submission form opened successfully! Complete your submission
              there.
            </div>
          )}

          <div className="submission-info-cards">
            <div className="info-card">
              <div className="info-icon">📋</div>
              <h4>Prepare Documents</h4>
              <p>Have your project files, documentation, and presentation ready</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h4>Quick Submission</h4>
              <p>Our streamlined form makes submission fast and easy</p>
            </div>
            {/* <div className="info-card">
              <div className="info-icon">🔒</div>
              <h4>Secure Upload</h4>
              <p>All submissions are securely stored and processed</p>
            </div> */}
          </div>
        </div>

        {/* <div className="submission-history">
          <h2>Submission History</h2>
          <p className="history-description">
            Track all your project submissions and their review status below.
          </p>

          <div className="submissions-list">
            {mockSubmissions.length > 0 ? (
              mockSubmissions.map((submission) => (
                <div key={submission.id} className="submission-card">
                  <div className="submission-info">
                    <h3>{submission.title}</h3>
                    <p>
                      <strong>Submitted:</strong> {submission.submittedAt}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className="status-badge"
                        style={{
                          color: getStatusColor(submission.status),
                          backgroundColor: `${getStatusColor(
                            submission.status
                          )}15`,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          marginLeft: "8px",
                          fontWeight: "600",
                        }}
                      >
                        {getStatusEmoji(submission.status)}{" "}
                        {submission.status}
                      </span>
                    </p>

                    {submission.feedback && (
                      <div className="feedback">
                        <h4>Reviewer Feedback</h4>
                        <p>{submission.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="submission-actions">
                    <button
                      className="download-btn"
                      onClick={() =>
                        alert("Download feature will be implemented soon!")
                      }
                    >
                      Download
                    </button>
                    {submission.status === "Pending Review" && (
                      <button
                        className="edit-btn"
                        onClick={() =>
                          alert("Edit feature will be implemented soon!")
                        }
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-submissions">
                <div className="no-submissions-icon">📭</div>
                <h3>No Submissions Yet</h3>
                <p>
                  You haven't made any submissions yet. Click the button above
                  to get started!
                </p>
              </div>
            )}
          </div>

          {mockSubmissions.length > 0 && (
            <div className="submission-stats">
              <div className="stat-card">
                <div className="stat-number">{mockSubmissions.length}</div>
                <div className="stat-label">Total Submissions</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {mockSubmissions.filter((s) => s.status === "Approved")
                    .length}
                </div>
                <div className="stat-label">Approved</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {
                    mockSubmissions.filter(
                      (s) => s.status === "Pending Review"
                    ).length
                  }
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          )}
        </div>

        <div className="submission-tips">
          <h3>💡 Submission Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <span className="tip-icon">📝</span>
              <p>
                <strong>Clear Documentation:</strong> Include comprehensive
                project documentation with your submission.
              </p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎥</span>
              <p>
                <strong>Demo Video:</strong> Consider including a demo video to
                showcase your project's functionality.
              </p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔍</span>
              <p>
                <strong>Review Guidelines:</strong> Make sure your submission
                meets all the competition requirements.
              </p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⏰</span>
              <p>
                <strong>Submit Early:</strong> Don't wait until the last minute
                - submit early to avoid technical issues.
              </p>
              <div style={{ height: "64px" }} />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Submissions;
