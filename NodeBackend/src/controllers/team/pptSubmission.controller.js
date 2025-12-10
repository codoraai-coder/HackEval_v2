import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Team } from "../../models/team/user.model.js";
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configure Flask API URL
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

const submitPPT = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  
  if (!req.file) {
    throw new ApiError(400, "PPT file is required");
  }

  // Check if team exists
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if team already submitted PPT
  if (team.pptSubmission && team.pptSubmission.pptFile) {
    throw new ApiError(400, "Team has already submitted a PPT. Only one submission allowed.");
  }

  try {
    // Prepare file for Flask API
    const pptFile = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      uploadDate: new Date()
    };

    // Update team with PPT file info (set status to processing)
    team.pptSubmission = {
      pptFile: pptFile,
      analysisStatus: 'processing'
    };
    await team.save();

    // Send to Flask API for analysis
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new Blob([fileBuffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    const flaskResponse = await axios.post(`${FLASK_API_URL}/api/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000 // 5 minutes timeout for analysis
    });

    // Update team with analysis results
    team.pptSubmission.analysisResults = flaskResponse.data.result;
    team.pptSubmission.analysisStatus = 'completed';
    team.pptSubmission.analysisDate = new Date();
    
    await team.save();

    // Clean up uploaded file after analysis
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          team: team,
          analysisId: flaskResponse.data.analysis_id
        },
        "PPT submitted and analyzed successfully"
      )
    );

  } catch (error) {
    // Handle analysis failure
    team.pptSubmission.analysisStatus = 'failed';
    team.pptSubmission.analysisError = error.message;
    await team.save();

    throw new ApiError(500, `PPT analysis failed: ${error.message}`);
  }
});

const getPPTAnalysis = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (!team.pptSubmission || !team.pptSubmission.pptFile) {
    throw new ApiError(404, "No PPT submission found for this team");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pptSubmission: team.pptSubmission
      },
      "PPT analysis retrieved successfully"
    )
  );
});

const getTeamPPTByTeamName = asyncHandler(async (req, res) => {
  const { teamName } = req.params;

  const team = await Team.findOne({ teamName: teamName });
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (!team.pptSubmission || !team.pptSubmission.analysisResults) {
    throw new ApiError(404, "No PPT analysis found for this team");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: {
          upload_timestamp: team.pptSubmission.pptFile.uploadDate,
          total_weighted_score: team.pptSubmission.analysisResults.overall_score,
          total_raw_score: calculateRawScore(team.pptSubmission.analysisResults.scores),
          evaluation_scores: team.pptSubmission.analysisResults.scores,
          summary: team.pptSubmission.analysisResults.summary,
          feedback_positive: team.pptSubmission.analysisResults.feedback?.strengths?.join('. '),
          feedback_criticism: team.pptSubmission.analysisResults.feedback?.improvements?.join('. '),
          feedback_technical: "Technical analysis based on content and structure",
          feedback_suggestions: team.pptSubmission.analysisResults.feedback?.suggestions?.join('. ')
        }
      },
      "PPT analysis data retrieved successfully"
    )
  );
});

// Helper function to calculate raw score
const calculateRawScore = (scores) => {
  if (!scores) return 0;
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
};





export {
  submitPPT,
  getPPTAnalysis,
  getTeamPPTByTeamName
};