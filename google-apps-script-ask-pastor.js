/**
 * ═══════════════════════════════════════════════════════════════
 * GOOGLE APPS SCRIPT — ASK PASTOR QUESTION SUBMISSIONS
 * ═══════════════════════════════════════════════════════════════
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this script into Code.gs
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL and add it to site-data.json as:
 *    "askPastor": { "googleSheetsWebhookUrl": "YOUR_URL_HERE" }
 *
 * SHEET COLUMNS:
 * A: Received At       — Server timestamp
 * B: Submission ID     — Client-generated ID for idempotency
 * C: Question          — The submitted question text
 * D: Topic             — Optional topic category
 * E: Language          — Optional language
 * F: Consent Given     — Yes/No
 * G: Consent Version   — Version string (e.g. v1.0)
 * H: Consent Timestamp — ISO timestamp of consent
 * I: Submitted At      — Client-side timestamp
 * J: Review Status     — New / Shortlisted / Answered
 * K: Edited Question   — For filming (editable by team)
 * L: Notes             — Internal team notes
 *
 * PRIVACY:
 * - No IP addresses, user agents, or device info are stored
 * - CSV formula injection protection applied to all text fields
 * - Idempotent: duplicate submission IDs are rejected
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_NAME = "Ask Pastor Questions";

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const data = e && e.parameter ? e.parameter : {};

    const submissionId = sanitize_(data.submissionId || "");
    const question = sanitize_(data.question || "");

    // Reject empty questions
    if (!question || question.trim().length === 0) {
      return jsonResponse_({ ok: false, error: "Empty question" });
    }

    // Idempotency check: reject duplicate submission IDs
    if (submissionId && isDuplicate_(sheet, submissionId)) {
      return jsonResponse_({ ok: true, duplicate: true });
    }

    // Append row
    sheet.appendRow([
      new Date(),                                  // A: Received At
      submissionId,                                // B: Submission ID
      question,                                    // C: Question
      sanitize_(data.topic || ""),                  // D: Topic
      sanitize_(data.language || ""),               // E: Language
      sanitize_(data.consentGiven || ""),           // F: Consent Given
      sanitize_(data.consentVersion || ""),         // G: Consent Version
      sanitize_(data.consentTimestamp || ""),        // H: Consent Timestamp
      sanitize_(data.submittedAt || ""),            // I: Submitted At
      "New",                                       // J: Review Status
      "",                                          // K: Edited Question
      "",                                          // L: Notes
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: "Server error" });
  }
}

/**
 * Get or create the Ask Pastor sheet with proper headers
 */
function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headers = [
      "Received At",
      "Submission ID",
      "Question",
      "Topic",
      "Language",
      "Consent Given",
      "Consent Version",
      "Consent Timestamp",
      "Submitted At",
      "Review Status",
      "Edited Question",
      "Notes",
    ];
    sheet.appendRow(headers);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#f0f0f0");

    // Set column widths
    sheet.setColumnWidth(1, 160);  // Received At
    sheet.setColumnWidth(2, 180);  // Submission ID
    sheet.setColumnWidth(3, 400);  // Question
    sheet.setColumnWidth(4, 120);  // Topic
    sheet.setColumnWidth(5, 100);  // Language
    sheet.setColumnWidth(10, 120); // Review Status
    sheet.setColumnWidth(11, 400); // Edited Question
    sheet.setColumnWidth(12, 200); // Notes

    // Add data validation for Review Status column
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Shortlisted", "Answered"], true)
      .setAllowInvalid(false)
      .build();
    // Apply to 1000 rows (will auto-expand)
    sheet.getRange(2, 10, 1000, 1).setDataValidation(statusRule);

    // Freeze header row
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Check if a submission ID already exists (idempotency)
 */
function isDuplicate_(sheet, submissionId) {
  if (!submissionId) return false;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  // Check column B (Submission ID) for duplicates
  const idRange = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  return idRange.some(function(row) {
    return row[0] === submissionId;
  });
}

/**
 * Sanitize text to prevent CSV formula injection
 * Prefixes dangerous characters with a single quote
 * Also trims whitespace
 */
function sanitize_(value) {
  if (typeof value !== "string") return String(value || "");
  let text = value.trim();

  // Prevent formula injection: prefix with single quote if starts with
  // =, +, -, @, \t, \r, or other formula triggers
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  // Also escape pipe and semicolon at start (DDE injection vectors)
  if (/^[|;]/.test(text)) {
    text = "'" + text;
  }

  return text;
}

/**
 * Create a JSON response
 */
function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET requests (health check)
 */
function doGet(e) {
  return jsonResponse_({ status: "ok", service: "ask-pastor" });
}
