import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./ExcelUpload.css";
import { API_BASE_URL } from "../config";

const ExcelUpload = () => {
  const [excelData, setExcelData] = useState([]);
  const [file, setFile] = useState(null); // Store selected file
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
      const requiredColumns = [
        "team name",
        "team leader email id (gla email id only)",
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
      setFile(selectedFile); // Store file for later upload
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
      const response = await fetch(
        `${API_BASE_URL}/admin/upload/teams`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || result.message || "Failed to upload file. Server returned an error.",
        );
      }

      const data = result.data || result;
      setUploadStatus({
        type: "success",
        message: result.message || `Upload complete: ${data.created || 0} created, ${data.updated || 0} updated`,
        details: data.skipped || [],
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
        <h2 className="excel-upload-title">Upload Shortlisted Teams</h2>

        <div className="instructions-box">
          <p className="instructions-title">Instructions:</p>
          <ul className="instructions-list">
            <li>
              Upload Excel file (.xlsx or .xls) with the first sheet containing
              team data.
            </li>
            <li>
              <strong>Required columns</strong> (must be present):
              <ul className="instructions-sublist"><b>
                <li>Team Name</li>
                <li>Team Leader Email id (gla email id only)</li>
              </b>
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
              Emails must be valid GLA university emails (e.g.,
              `example@gla.ac.in`).
            </li>
          </ul>
        </div>

        {/* --- Upload Status Display --- */}
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            <p>{uploadStatus.message}</p>
            {uploadStatus.type === "success" &&
              uploadStatus.details &&
              uploadStatus.details.length > 0 && (
                <div className="skipped-details">
                  <strong>Skipped Teams:</strong>
                  <ul>
                    {uploadStatus.details.map((item, index) => (
                      <li key={index}>
                        {item.team_name}: {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${loading
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
            Submit
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
