import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Team } from "../../models/team/user.model.js";
import { Leaderboard } from "../../models/admin/leaderboard.model.js";
import * as XLSX from "xlsx";
import bcrypt from "bcrypt";

/**
 * Upload Excel file with team data and create team records
 * Expects columns: Team ID, Select Category, Team Name, Team Leader Name, 
 * University Roll No, Team Leader Email ID, Team Leader Contact No., PSID, Statement
 */
export const uploadTeamsExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    // Parse Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new ApiError(400, "The uploaded Excel file is empty");
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: [],
      total: jsonData.length
    };

    for (const row of jsonData) {
      try {
        // Map Excel columns to model fields (handle various column name formats)
        const teamName = row["Team Name"] || row["team name"] || row["teamName"];
        const email = row["Team Leader Email id (gla email id only)"] || 
                      row["Team Leader Email ID"] || 
                      row["email"] || 
                      row["Email"];
        const category = row["Select Category"] || row["category"] || row["Category"];
        const leaderName = row["Team Leader Name"] || row["leader"];
        const rollNo = row["University Roll No"] || row["rollNo"];
        const phone = row["Team Leader Contact No."] || row["phone"];
        const psId = row["PSID"] || row["psid"];
        const statement = row["Statement"] || row["statement"];

        if (!teamName || !email) {
          results.skipped.push({
            team_name: teamName || "Unknown",
            reason: "Missing required fields (Team Name or Email)"
          });
          continue;
        }

        // Check if team already exists
        let team = await Team.findOne({ 
          $or: [{ teamName }, { email: email.toLowerCase() }] 
        });

        if (team) {
          // Update existing team
          team.category = category || team.category;
          team.problemStatement = {
            ps_id: psId,
            description: statement,
            category: category
          };
          await team.save();
          results.updated++;
        } else {
          // Create new team with generated password
          const defaultPassword = `team_${Date.now().toString(36)}`;
          
          team = await Team.create({
            teamName,
            email: email.toLowerCase(),
            password: defaultPassword,
            category,
            members: [{
              name: leaderName || teamName,
              email: email.toLowerCase(),
              phone: phone || "",
              isLeader: true
            }],
            problemStatement: {
              ps_id: psId,
              description: statement,
              category: category
            },
            isActive: true,
            isVerified: false
          });
          results.created++;
        }

        // Add team members if present
        for (let i = 1; i <= 5; i++) {
          const memberName = row[`Team_Memeber_${i}`] || row[`Team_Member_${i}`];
          if (memberName && memberName.trim()) {
            const memberExists = team.members.some(m => 
              m.name.toLowerCase() === memberName.trim().toLowerCase()
            );
            if (!memberExists) {
              team.members.push({
                name: memberName.trim(),
                email: "",
                isLeader: false
              });
            }
          }
        }
        await team.save();

      } catch (rowError) {
        results.skipped.push({
          team_name: row["Team Name"] || "Unknown",
          reason: rowError.message
        });
      }
    }

    return res.status(200).json(
      new ApiResponse(200, results, 
        `Upload complete: ${results.created} created, ${results.updated} updated, ${results.skipped.length} skipped`)
    );

  } catch (error) {
    throw new ApiError(500, "Error processing Excel file: " + error.message);
  }
});

/**
 * Upload PPT evaluation report Excel and update leaderboard
 * Expects columns: Rank, Team Name, Score (and optionally category-specific scores)
 */
export const uploadPptReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    // Parse Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new ApiError(400, "The uploaded Excel file is empty");
    }

    const results = {
      processed: 0,
      skipped: [],
      total: jsonData.length
    };

    for (const row of jsonData) {
      try {
        const teamName = row["Team Name"] || row["team_name"] || row["teamName"];
        const rank = row["Rank"] || row["rank"];
        const score = row["Score"] || row["score"] || row["Total"] || row["total_score"];

        if (!teamName || rank === undefined || score === undefined) {
          results.skipped.push({
            team_name: teamName || "Unknown",
            reason: "Missing required fields (Team Name, Rank, or Score)"
          });
          continue;
        }

        // Upsert leaderboard entry
        await Leaderboard.findOneAndUpdate(
          { teamName },
          {
            teamName,
            rank: parseInt(rank),
            score: parseFloat(score),
            category: row["Category"] || row["category"],
            innovationCreativity: row["Innovation"] || row["innovation_creativity"],
            technicalFeasibility: row["Technical"] || row["technical_feasibility"],
            potentialImpact: row["Impact"] || row["potential_impact"],
            fileName: req.file.originalname,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );

        results.processed++;

      } catch (rowError) {
        results.skipped.push({
          team_name: row["Team Name"] || "Unknown",
          reason: rowError.message
        });
      }
    }

    return res.status(200).json(
      new ApiResponse(200, results,
        `PPT Report processed: ${results.processed} entries updated, ${results.skipped.length} skipped`)
    );

  } catch (error) {
    throw new ApiError(500, "Error processing PPT report: " + error.message);
  }
});
