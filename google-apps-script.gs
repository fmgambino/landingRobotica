function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inscripciones");

    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Inscripciones");
      sheet.appendRow([
        "Fecha",
        "Nombre y Apellido",
        "Edad",
        "Curso",
        "Division",
        "Nota Pronostico",
        "Competencias"
      ]);
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.fullName || "",
      data.age || "",
      data.course || "",
      data.division || "",
      data.forecastGrade || "",
      (data.competitions || []).join(", ")
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "success",
        message: "Inscripción guardada correctamente"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        result: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
