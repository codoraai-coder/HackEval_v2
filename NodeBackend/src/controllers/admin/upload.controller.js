import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Team } from "../../models/team/user.model.js";
import { Leaderboard } from "../../models/admin/leaderboard.model.js";
import * as XLSX from "xlsx";
import bcrypt from "bcrypt";
import { sendWelcomeEmail } from "../../services/email.services.js";

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
      emailsSent: 0,
      emailsFailed: 0,
      total: jsonData.length,
    };

    for (const row of jsonData) {
      try {
        // Helper function to find column value (case-insensitive and flexible)
        const getColumnValue = (possibleNames) => {
          for (const name of possibleNames) {
            // Check exact match first
            if (row[name] !== undefined) return row[name];

            // Check case-insensitive match
            const key = Object.keys(row).find(
              (k) => k.trim().toLowerCase() === name.trim().toLowerCase(),
            );
            if (key && row[key] !== undefined) return row[key];
          }
          return null;
        };

        // Map Excel columns to model fields with all possible variations
        const teamName = getColumnValue([
          "Team Name",
          "team name",
          "teamName",
          "Team_Name",
        ]);

        const email = getColumnValue([
          "Team Leader Email id", // Your exact column name
          "Team Leader Email id ", // With trailing space
          "Team Leader Email ID",
          "Team Leader Email id (gla email id only)",
          "email",
          "Email",
          "team leader email",
        ]);

        const category = getColumnValue([
          "Select Category",
          "category",
          "Category",
          "Select_Category",
        ]);

        const leaderName = getColumnValue([
          "Team Leader Name",
          "leader",
          "Team_Leader_Name",
          "Leader Name",
        ]);

        const rollNo = getColumnValue([
          "University Roll No",
          "rollNo",
          "Roll No",
          "University_Roll_No",
        ]);

        const phone = getColumnValue([
          "Team Leader Contact No.",
          "phone",
          "Contact No",
          "Team_Leader_Contact_No",
        ]);

        const psId = getColumnValue(["PSID", "psid", "PS_ID", "ps_id"]);

        const statement = getColumnValue([
          "Statement",
          "statement",
          "Problem Statement",
          "Description",
        ]);

        // Validate required fields
        if (!teamName || !email) {
          results.skipped.push({
            team_name: teamName || "Unknown",
            reason: `Missing required fields - Team Name: ${teamName ? "✓" : "✗"}, Email: ${email ? "✓" : "✗"}`,
          });
          continue;
        }

        // Validate email format (basic check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.skipped.push({
            team_name: teamName,
            reason: `Invalid email format: ${email}`,
          });
          continue;
        }

        // Check if team already exists
        let team = await Team.findOne({
          $or: [{ teamName }, { email: email.toLowerCase().trim() }],
        });

        let isNewTeam = false;
        let generatedPassword = null;

        if (team) {
          // Update existing team
          if (category) team.category = category;

          team.problemStatement = {
            ps_id: psId || team.problemStatement?.ps_id,
            description: statement || team.problemStatement?.description,
            category: category || team.problemStatement?.category,
          };

          await team.save();
          results.updated++;
        } else {
          // Create new team with generated password
          generatedPassword = `Codora@${Date.now().toString(36).toUpperCase()}`;
          isNewTeam = true;

          team = await Team.create({
            teamName: teamName.trim(),
            email: email.toLowerCase().trim(),
            password: generatedPassword,
            category: category || "General",
            members: [
              {
                name: leaderName ? leaderName.trim() : teamName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone ? phone.toString().trim() : "",
                rollNo: rollNo ? rollNo.toString().trim() : "",
                isLeader: true,
              },
            ],
            problemStatement: {
              ps_id: psId || "",
              description: statement || "",
              category: category || "General",
            },
            isActive: true,
            isVerified: false,
          });
          results.created++;
        }

        // Add team members if present
        for (let i = 1; i <= 5; i++) {
          const memberName = getColumnValue([
            `Team_Memeber_${i}`,
            `Team_Member_${i}`,
            `Team Memeber ${i}`,
            `Team Member ${i}`,
            `Member_${i}`,
          ]);

          const memberEmail = getColumnValue([
            `Team_Memeber_${i}_Email`,
            `Team_Member_${i}_Email`,
            `Member_${i}_Email`,
          ]);

          // Add member if name exists (email is optional for members in your data)
          if (memberName && memberName.toString().trim()) {
            const memberExists = team.members.some(
              (m) =>
                m.name.toLowerCase() ===
                memberName.toString().trim().toLowerCase(),
            );

            if (!memberExists) {
              team.members.push({
                name: memberName.toString().trim(),
                email: memberEmail
                  ? memberEmail.toString().trim().toLowerCase()
                  : "",
                isLeader: false,
              });
            }
          }
        }

        await team.save();

        // Send welcome email for new teams
        if (isNewTeam && generatedPassword) {
          try {
            await sendWelcomeEmail(
              teamName.trim(),
              email.toLowerCase().trim(),
              generatedPassword,
            );
            results.emailsSent++;
            console.log(`✅ Welcome email sent to ${teamName} (${email})`);
          } catch (emailError) {
            results.emailsFailed++;
            console.error(
              `❌ Failed to send email to ${teamName}:`,
              emailError.message,
            );
          }
        }
      } catch (rowError) {
        console.error("Row processing error:", rowError);
        results.skipped.push({
          team_name: row["Team Name"] || row["team name"] || "Unknown",
          reason: rowError.message,
        });
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          results,
          `Upload complete: ${results.created} created, ${results.updated} updated, ${results.skipped.length} skipped, ${results.emailsSent} emails sent${results.emailsFailed > 0 ? `, ${results.emailsFailed} emails failed` : ""}`,
        ),
      );
  } catch (error) {
    console.error("Excel processing error:", error);
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
      total: jsonData.length,
    };

    for (const row of jsonData) {
      try {
        const teamName =
          row["Team Name"] || row["team_name"] || row["teamName"];
        const rank = row["Rank"] || row["rank"];
        const score =
          row["Score"] || row["score"] || row["Total"] || row["total_score"];

        if (!teamName || rank === undefined || score === undefined) {
          results.skipped.push({
            team_name: teamName || "Unknown",
            reason: "Missing required fields (Team Name, Rank, or Score)",
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
            innovationCreativity:
              row["Innovation"] || row["innovation_creativity"],
            technicalFeasibility:
              row["Technical"] || row["technical_feasibility"],
            potentialImpact: row["Impact"] || row["potential_impact"],
            fileName: req.file.originalname,
            updatedAt: new Date(),
          },
          { upsert: true, new: true },
        );

        results.processed++;
      } catch (rowError) {
        results.skipped.push({
          team_name: row["Team Name"] || "Unknown",
          reason: rowError.message,
        });
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          results,
          `PPT Report processed: ${results.processed} entries updated, ${results.skipped.length} skipped`,
        ),
      );
  } catch (error) {
    throw new ApiError(500, "Error processing PPT report: " + error.message);
  }
});
