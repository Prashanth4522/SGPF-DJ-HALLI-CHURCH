const SHEET_NAME = "Prayer Requests";

function doPost(e) {
  const sheet = getPrayerRequestSheet_();
  const data = e && e.parameter ? e.parameter : {};

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.phone || "",
    data.message || "",
    data.prayer || "",
    data.page || "",
    data.submittedAt || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getPrayerRequestSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Received At",
      "Name",
      "Phone",
      "Message",
      "Prayer Request",
      "Page",
      "Submitted At",
    ]);
  }

  return sheet;
}
