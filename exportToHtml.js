import fs from "fs";

// Load JSON
const results = JSON.parse(fs.readFileSync("itemResponses.json", "utf-8"));

// Define table headers
const headers = [
  "Timestamp","extProductId","Brand","Fit","Sizes","Product Type",
  "User Gender","Height","Weight","Age","Size Name","Second Size",
  "Scenario","Will Fit","URL","Store"
];

// Build HTML
let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Item Responses</title>
  <style>
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      background: #f9fafb;
      color: #333;
    }
    h1, h2 {
      font-weight: 600;
      color: #222;
      margin-bottom: 10px;
    }
    .filters {
      margin: 15px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .filters input {
      flex: 1 1 200px;
      min-width: 150px;
      padding: 6px 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    .actions {
      margin: 10px 0 20px 0;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 14px;
      margin-right: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    button:hover {
      background: #1e40af;
    }
    button.secondary {
      background: #6b7280;
    }
    button.secondary:hover {
      background: #374151;
    }
    .table-container {
      max-height: 600px;   /* scrollable area */
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #eee;
      padding: 6px 10px;
      font-size: 14px;
    }
    th {
      background: #f1f5f9;
      position: sticky;
      top: 0;
      z-index: 2;
      text-align: left;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    tr:hover td {
      background: #fef3c7;
    }
  </style>
</head>
<body>
  <h1>Virtusize Item Responses</h1>

  <h2>Filters</h2>
  <div class="filters">
    ${headers.map((h, i) => 
      `<input type="text" data-col="${i}" placeholder="🔍 ${h}..." onkeyup="filterTable()">`
    ).join("")}
  </div>

  <div class="actions">
    <button onclick="exportTableToCSV()">⬇️ Export Filtered CSV</button>
    <button class="secondary" onclick="clearFilters()">✖ Clear Filters</button>
  </div>

  <div class="table-container">
    <table id="responsesTable">
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
`;

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
          <td>${r.store || ""}</td>
        </tr>
  `;
});

html += `
      </tbody>
    </table>
  </div>

  <h2>Paste Product URLs</h2>
  <textarea id="urlInput" rows="3" style="width:100%; max-width:600px;" placeholder="Paste product URLs here..."></textarea><br>
  <button onclick="saveUrls()">💾 Save URLs</button>
  <button onclick="exportAsStoreLinksJS()">⬇️ Export storeLinks.js</button>

  <script>
    function filterTable() {
      const filters = document.querySelectorAll(".filters input");
      const rows = document.querySelectorAll("#responsesTable tbody tr");

      rows.forEach(row => {
        let visible = true;
        filters.forEach(input => {
          const colIndex = parseInt(input.dataset.col);
          const query = input.value.toLowerCase().trim();
          if (query) {
            const cell = row.cells[colIndex];
            const text = cell ? cell.innerText.toLowerCase().trim() : "";
            if (!text.includes(query)) {
              visible = false;
            }
          }
        });
        row.style.display = visible ? "" : "none";
      });
    }

    function clearFilters() {
      document.querySelectorAll(".filters input").forEach(input => input.value = "");
      filterTable();
    }

    function downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    }

    function exportTableToCSV() {
      const rows = document.querySelectorAll("#responsesTable tr");
      let csv = [];
      rows.forEach(row => {
        if (row.style.display === "none") return;
        const cols = row.querySelectorAll("td, th");
        const rowData = [];
        cols.forEach(col => {
          let text = "";
          const link = col.querySelector("a");
          text = link ? link.href : col.innerText;
          text = text.replace(/"/g, '""').replace(/\\r?\\n|\\r/g, " ");
          rowData.push('"' + text + '"');
        });
        csv.push(rowData.join(","));
      });
      const today = new Date().toISOString().split("T")[0];
      downloadCSV(csv.join("\\n"), "itemResponses-" + today + ".csv");
    }

    function saveUrls() {
      const input = document.getElementById("urlInput").value.trim();
      if (!input) return;
      let saved = JSON.parse(localStorage.getItem("savedLinks") || "[]");
      input.split("\\n").forEach(url => {
        if (url && !saved.includes(url)) saved.push(url.trim());
      });
      localStorage.setItem("savedLinks", JSON.stringify(saved));
      alert("✅ URLs saved to localStorage!");
      document.getElementById("urlInput").value = "";
    }

    function exportAsStoreLinksJS() {
      const urls = JSON.parse(localStorage.getItem("savedLinks") || "[]");
      if (!urls.length) {
        alert("⚠️ No URLs saved yet.");
        return;
      }
      const jsContent = \`// storeLinks.js
export default [
  \${urls.map(u => \`"\${u}"\`).join(",\\n  ")}
];\`;
      const blob = new Blob([jsContent], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "storeLinks.js";
      link.click();
    }
  </script>
</body>
</html>
`;

// Save as HTML
fs.writeFileSync("itemResponses.html", html);
console.log("✅ Exported BEAUTIFUL HTML with all column filters, reset, CSV, and storeLinks.js export to itemResponses.html");
