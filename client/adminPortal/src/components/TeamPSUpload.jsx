import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./ExcelUpload.css"; // Reusing the existing CSS

const TeamPSUpload = () => {
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

      const fileHeaders = Object.keys(jsonData[0]).map((h) =>
        h.trim().toLowerCase(),
      );
      
      // Required columns for team and problem statement details
      const requiredColumns = [
        "team name",
        "college",
        "department", 
        "year",
        "team leader name",
        "team leader roll no",
        "team leader email",
        "team leader contact",
        "member 1 name",
        "member 1 roll no", 
        "member 1 email",
        "member 1 contact",
        "member 2 name",
        "member 2 roll no",
        "member 2 email", 
        "member 2 contact",
        "problem statement id",
        "problem statement title",
        "problem statement description",
        "category",
        "difficulty",
        "domain"
      ];
      
      const missingColumns = requiredColumns.filter(
        (col) => !fileHeaders.includes(col),
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(", ")}`,
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

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/team-ps/upload-excel`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to upload file. Server returned an error.",
        );
      }

      setUploadStatus({
        type: "success",
        message: result.message,
        details: {
          teams_processed: result.teams_processed,
          teams_saved: result.teams_saved,
          errors: result.errors
        },
      });
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
        <h2 className="excel-upload-title">Upload Team & Problem Statement Details</h2>

        <div className="instructions-box">
          <p className="instructions-title">Instructions:</p>
          <ul className="instructions-list">
            <li>
              Upload Excel file (.xlsx or .xls) with the first sheet containing
              team and problem statement data.
            </li>
            <li>
              Ensure all required columns are present with the exact names:
              <ul className="instructions-sublist">
                <li>Team Name</li>
                <li>College</li>
                <li>Department</li>
                <li>Year</li>
                <li>Team Leader Name</li>
                <li>Team Leader Roll No</li>
                <li>Team Leader Email</li>
                <li>Team Leader Contact</li>
                <li>Member 1 Name</li>
                <li>Member 1 Roll No</li>
                <li>Member 1 Email</li>
                <li>Member 1 Contact</li>
                <li>Member 2 Name</li>
                <li>Member 2 Roll No</li>
                <li>Member 2 Email</li>
                <li>Member 2 Contact</li>
                <li>Problem Statement ID</li>
                <li>Problem Statement Title</li>
                <li>Problem Statement Description</li>
                <li>Category</li>
                <li>Difficulty</li>
                <li>Domain</li>
              </ul>
            </li>
            <li>
              All fields are required. Empty member fields will be ignored.
            </li>
            <li>
              Teams will be automatically assigned unique team IDs.
            </li>
          </ul>
        </div>

        {/* --- Upload Status Display --- */}
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            <p>{uploadStatus.message}</p>
            {uploadStatus.type === "success" && uploadStatus.details && (
              <div className="upload-details">
                <p><strong>Teams Processed:</strong> {uploadStatus.details.teams_processed}</p>
                <p><strong>Teams Saved:</strong> {uploadStatus.details.teams_saved}</p>
                {uploadStatus.details.errors && uploadStatus.details.errors.length > 0 && (
                  <div className="error-details">
                    <strong>Errors:</strong>
                    <ul>
                      {uploadStatus.details.errors.map((error, index) => (
                        <li key={index} className="error-item">{error}</li>
                      ))}
                    </ul>
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
              className={`cursor-pointer flex flex-col items-center ${loading ? "cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 mb-3 rounded-full bg-gray-300"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <span className="text-gray-500 font-medium">
                    Processing...
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
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: !file || loading ? "not-allowed" : "pointer",
              opacity: !file || loading ? 0.6 : 1,
            }}
          >
            {loading ? "Uploading..." : "Upload Teams & PS Details"}
          </button>
        </div>

        {excelData.length > 0 && (
          <div className="data-table-section">
            <h3 className="table-title">Preview of Uploaded Data</h3>
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
                  {excelData.slice(0, 5).map((row, index) => (
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
              {excelData.length > 5 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Showing first 5 rows of {excelData.length} total rows
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPSUpload;
