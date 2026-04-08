function doPost(e) {
  // Use the active sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    let data;
    // Handle different ways data might arrive
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter; // Fallback to form parameters
      }
    } else {
      data = e.parameter;
    }
    
    // Append data to sheet: Timestamp, Name, Phone, Medicine, Quantity, Urgency
    sheet.appendRow([
      new Date(),
      data.customerName,
      data.phoneNumber,
      data.medicineName,
      data.quantity,
      data.urgency
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
