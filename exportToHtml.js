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
    .table-container {
      max-height: 600px;   /* Limit height of visible rows */
      overflow-y: auto;    /* Vertical scroll */
      border: 1px solid #ccc;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; font-size: 14px; }
    th { 
      background: #f4f4f4; 
      position: sticky; 
      top: 0; 
      z-index: 2; 
    }
    td { vertical-align: top; }
    button, input { margin: 5px 5px 15px 0; padding: 8px 12px; font-size: 14px; }
    input { border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>Virtusize Item Responses</h1>
  
  <input type="text" id="brandFilter" placeholder="🔍 Filter by brand..." onkeyup="filterByBrand()">
  <button onclick="exportTableToCSV()">⬇️ Export to CSV</button>
  
  <div class="table-container">
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
  </div>

  <h2>Paste Product URLs</h2>
  <textarea id="urlInput" rows="3" style="width:100%; max-width:600px;" placeholder="Paste product URLs here..."></textarea><br>
  <button onclick="saveUrls()">💾 Save URLs</button>
  <button onclick="exportAsStoreLinksJS()">⬇️ Export storeLinks.js</button>

  <script>
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
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "storeLinks.js";
      link.click();
    }
  </script>
</body>
</html>
`;


// Save as HTML
fs.writeFileSync("itemResponses.html", html);
console.log("✅ Exported HTML with sticky header, scrollable body, brand filter, and CSV export to itemResponses.html");
