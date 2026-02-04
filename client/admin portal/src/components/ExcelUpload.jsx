import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./ExcelUpload.css";
import { API_BASE_URL } from "../config";

const ExcelUpload = () => {
  const [excelData, setExcelData] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Handle file selection and preview
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploadStatus(null);
    setExcelData([]);
    setFile(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("The uploaded Excel file is empty.");
      }

      const fileHeaders = Object.keys(jsonData[0]);
      console.log("Detected headers:", fileHeaders); // Debug log

      // More flexible header checking
      const hasTeamName = fileHeaders.some(
        (h) =>
          h.trim().toLowerCase().includes("team") &&
          h.trim().toLowerCase().includes("name"),
      );

      const hasEmail = fileHeaders.some((h) =>
        h.trim().toLowerCase().includes("email"),
      );

      if (!hasTeamName || !hasEmail) {
        throw new Error(
          `Missing required columns. Found headers: ${fileHeaders.join(", ")}`,
        );
      }

      setExcelData(jsonData);
      setFile(selectedFile);
    } catch (error) {
      console.error("Error reading file:", error);
      setUploadStatus({ type: "error", message: error.message });
    }
  };

  // Handle actual upload to backend
  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/admin/upload/teams`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            result.message ||
            "Failed to upload file. Server returned an error.",
        );
      }

      const data = result.data || result;
      setUploadStatus({
        type: "success",
        message: result.message,
        details: {
          created: data.created || 0,
          updated: data.updated || 0,
          skipped: data.skipped || [],
          emailsSent: data.emailsSent || 0,
          emailsFailed: data.emailsFailed || 0,
        },
      });

      // Clear the file input after successful upload
      setFile(null);
      setExcelData([]);
      document.getElementById("file-upload").value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="excel-upload-container">
      <div className="excel-upload-card">
        <h2 className="excel-upload-title">Upload Shortlisted Teams</h2>

        <div className="instructions-box">
          <p className="instructions-title">📋 Instructions:</p>
          <ul className="instructions-list">
            <li>
              Upload Excel file (.xlsx or .xls) with the first sheet containing
              team data.
            </li>
            <li>
              <strong>Required columns</strong> (must be present):
              <ul className="instructions-sublist">
                <li>
                  <b>Team Name</b>
                </li>
                <li>
                  <b>Team Leader Email id</b>
                </li>
              </ul>
            </li>
            <li>
              <strong>Optional columns</strong> (recommended):
              <ul className="instructions-sublist">
                <li>Select Category</li>
                <li>Team Leader Name</li>
                <li>University Roll No</li>
                <li>Team Leader Contact No.</li>
                <li>Team_Memeber_1</li>
                <li>Team_Memeber_2</li>
                <li>Team_Memeber_3</li>
                <li>Team_Memeber_4</li>
                <li>Team_Memeber_5</li>
                <li>PSID</li>
                <li>Statement</li>
              </ul>
            </li>
            <li>
              📧 Welcome emails will be sent automatically to new teams with
              their login credentials.
            </li>
          </ul>
        </div>

        {/* Upload Status Display */}
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              {uploadStatus.message}
            </p>

            {uploadStatus.type === "success" && uploadStatus.details && (
              <div style={{ marginTop: "15px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      background: "#d1fae5",
                      padding: "10px",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <strong>✅ Created:</strong> {uploadStatus.details.created}
                  </div>
                  <div
                    style={{
                      background: "#dbeafe",
                      padding: "10px",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <strong>🔄 Updated:</strong> {uploadStatus.details.updated}
                  </div>
                  <div
                    style={{
                      background: "#fee2e2",
                      padding: "10px",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <strong>⏭️ Skipped:</strong>{" "}
                    {uploadStatus.details.skipped.length}
                  </div>
                  <div
                    style={{
                      background: "#fef3c7",
                      padding: "10px",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <strong>📧 Emails Sent:</strong>{" "}
                    {uploadStatus.details.emailsSent}
                  </div>
                </div>

                {uploadStatus.details.skipped.length > 0 && (
                  <div className="skipped-details">
                    <strong>⚠️ Skipped Teams:</strong>
                    <ul style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {uploadStatus.details.skipped.map((item, index) => (
                        <li key={index}>
                          <strong>{item.team_name}:</strong> {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {uploadStatus.details.emailsFailed > 0 && (
                  <div
                    style={{
                      background: "#fee2e2",
                      padding: "10px",
                      borderRadius: "6px",
                      marginTop: "10px",
                    }}
                  >
                    <strong>⚠️ Warning:</strong>{" "}
                    {uploadStatus.details.emailsFailed} email(s) failed to send.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              loading
                ? "border-gray-300 bg-gray-50"
                : "border-gray-300 hover:border-blue-500"
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 mb-3 rounded-full bg-gray-300"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <span className="text-gray-500 font-medium">
                    Processing... This may take a moment.
                  </span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15v-6m-3 3l3-3 3 3"
                    ></path>
                  </svg>
                  <span className="text-gray-600 font-medium mb-1">
                    Click to upload Excel file
                  </span>
                  <span className="text-gray-500 text-sm">
                    or drag and drop
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!file || loading}
            style={{
              padding: "0.75rem 2rem",
              background: !file || loading ? "#9ca3af" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: !file || loading ? "not-allowed" : "pointer",
              opacity: !file || loading ? 0.6 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Uploading..." : "Submit & Send Emails"}
          </button>
        </div>

        {excelData.length > 0 && (
          <div className="data-table-section">
            <h3 className="table-title">
              📊 Preview of Uploaded Data ({excelData.length} teams)
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    {Object.keys(excelData[0]).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, index) => (
                    <tr key={index} className="table-row">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="table-cell">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;
