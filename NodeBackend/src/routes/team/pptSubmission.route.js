import { Router } from "express";
import {
  submitPPT,
  getPPTAnalysis,
  getTeamPPTByTeamName
} from "../../controllers/team/pptSubmission.controller.js";
import { verifyTeamJWT } from "../../middlewares/team.Auth.middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const ensureUploadDir = () => {
  const uploadDir = 'uploads/ppt/';
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
  }
  
  // Create ppt directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  }
};

// Call this function to create directories
ensureUploadDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists for each upload
    const uploadDir = 'uploads/ppt/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Ensure proper file extension
    let extension = path.extname(file.originalname);
    if (!extension) {
      // Add default extension based on mimetype
      if (file.mimetype.includes('pdf')) {
        extension = '.pdf';
      } else if (file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation')) {
        extension = '.pptx';
      } else {
        extension = '.ppt';
      }
    }
    cb(null, 'ppt-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is PPT/PPTX or PDF
  const allowedMimeTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/pdf',
    'application/octet-stream' // Sometimes PPT files come as octet-stream
  ];
  
  const allowedExtensions = ['.ppt', '.pptx', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || 
      allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only PowerPoint (.ppt, .pptx) and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

const router = Router();

// Team routes (protected) - for teams to submit their PPT
router.post("/:teamId/submit-ppt", 
  verifyTeamJWT, 
  upload.single('pptFile'),
  handleMulterError,
  submitPPT
);

router.get("/:teamId/ppt-analysis", verifyTeamJWT, getPPTAnalysis);

// Judge routes (public) - for judges to access PPT analysis by team name
router.get("/team-evaluation/:teamName", getTeamPPTByTeamName);

export default router;