import { Router } from "express";
import multer from "multer";
import { uploadTeamsExcel, uploadPptReport } from "../../controllers/admin/upload.controller.js";
import { adminAuthMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

// Configure multer for memory storage (files stored in buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        const allowedMimes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel" // .xls
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false);
        }
    }
});

// Apply authentication middleware to all routes
router.use(adminAuthMiddleware);

// Upload Excel with team data
router.post("/teams", upload.single("file"), uploadTeamsExcel);

// Upload PPT evaluation report
router.post("/ppt-report", upload.single("file"), uploadPptReport);

export default router;
