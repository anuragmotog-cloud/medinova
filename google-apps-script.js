function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Append data to sheet: Timestamp, Name, Phone, Medicine, Quantity, Urgency
    sheet.appendRow([
      new Date(),
      data.customerName,
      data.phoneNumber,
      data.medicineName,
      data.quantity,
      data.urgency
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data logged successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Handle CORS for preflight requests if needed (though Apps Script handles this differently)
function doGet(e) {
  return ContentService.createTextOutput("Medicine Shortage Tracker API is active.");
}
