# Size Recommendation Collector

Script that visits PDP links, captures Virtusize `/item` API responses, and saves them into `itemResponses.json`.

---

## 🚀 How to Run

### 1. Install dependencies

```bash
npm install
2. Initialize Puppeteer profile (first time only)
bash
Copy code and paster to terminal
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir="/Users/rachel/Documents/sizeRec/PuppeteerProfile"
➡️ Log in to required sites (Virtusize, etc.), then close Chrome.

3. Run the script
bash
Copy code
node collectItemResponses.js
Results are saved to:

pgsql
Copy code
itemResponses.json

4. Run your exporter to regenerate the HTML
node exportToHtml.js


👉 This reads itemResponses.json and writes a fresh itemResponses.html.
```
