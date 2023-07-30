// Require library
const xl = require("excel4node");

// Create a new instance of a Workbook class
let wb = new xl.Workbook();

// Add Worksheets to the workbook
var ws = wb.addWorksheet("Sheet 1");

// Create a reusable style
var style = wb.createStyle({
  font: {
    color: "#FF0800",
    size: 12,
  },
  numberFormat: "$#,##0.00; ($#,##0.00); -",
});
