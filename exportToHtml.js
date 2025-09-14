import fs from "fs";

// Load JSON
const results = JSON.parse(fs.readFileSync("itemResponses.json", "utf-8"));

// Build HTML
let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Item Responses</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; font-size: 14px; }
    th { background: #f4f4f4; }
    td { vertical-align: top; }
    button { margin-bottom: 15px; padding: 8px 12px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Virtusize Item Responses</h1>
  <button onclick="exportTableToCSV()">⬇️ Export to CSV</button>
  <table id="responsesTable">
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>extProductId</th>
        <th>Brand</th>
        <th>Fit</th>
        <th>Sizes</th>
        <th>Product Type</th>
        <th>User Gender</th>
        <th>User Height</th>
        <th>User Weight</th>
        <th>User Age</th>
        <th>Size Name</th>
        <th>Second Size</th>
        <th>Scenario</th>
        <th>Will Fit</th>
        <th>URL</th>
        <th>Store</th>
      </tr>
    </thead>
    <tbody>
`;

// Insert JSON data into rows
results.forEach(r => {
  html += `
    <tr>
      <td>${r.timestamp || ""}</td>
      <td>${r.extProductId || ""}</td>
      <td>${r.payload?.brand || ""}</td>
      <td>${r.payload?.fit || ""}</td>
      <td>${(r.payload?.sizes || []).join(", ")}</td>
      <td>${r.payload?.product_type || ""}</td>
      <td>${r.payload?.user_gender || ""}</td>
      <td>${r.payload?.user_height || ""}</td>
      <td>${r.payload?.user_weight || ""}</td>
      <td>${r.payload?.user_age || ""}</td>
      <td>${r.response?.sizeName || ""}</td>
      <td>${r.response?.secondSize || ""}</td>
      <td>${r.response?.scenario || ""}</td>
      <td>${r.response?.willFit ? "true" : "false"}</td>
      <td><a href="${r.url}" target="_blank">Link</a></td>
      <td>${r.store}</td>
    </tr>
  `;
});

html += `
    </tbody>
  </table>

  <script>
    function downloadCSV(csv, filename) {
      const csvFile = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = URL.createObjectURL(csvFile);
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

    function exportTableToCSV() {
      const rows = document.querySelectorAll("#responsesTable tr");
      let csv = [];

      rows.forEach(row => {
        const cols = row.querySelectorAll("td, th");
        const rowData = [];

        cols.forEach(col => {
          let text = "";

          // If cell contains a link, export the href instead of "Link"
          const link = col.querySelector("a");
          if (link) {
            text = link.href;
          } else {
            text = col.innerText;
          }

          // Escape quotes and newlines for CSV safety
          text = text.replace(/"/g, '""').replace(/\\r?\\n|\\r/g, " ");

          // Always wrap in double quotes
          rowData.push('"' + text + '"');
        });

        csv.push(rowData.join(","));
      });

      // Add today's date to filename
      const today = new Date().toISOString().split("T")[0];
      downloadCSV(csv.join("\\n"), "itemResponses-" + today + ".csv");
    }
  </script>
</body>
</html>
`;

// Save as HTML
fs.writeFileSync("itemResponses.html", html);
console.log("✅ Exported HTML with CSV export button to itemResponses.html");
