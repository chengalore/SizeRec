import fs from "fs";
import puppeteer from "puppeteer";
import storeLinks from "./storeLinks.js";

(async () => {
const browser = await puppeteer.launch({
  headless: false,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  userDataDir: "/Users/rachel/Documents/sizeRec/PuppeteerProfile",
  defaultViewport: null,
});


  const results = [];

  for (const link of storeLinks) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log(`\n🔗 Visiting ${link}`);

    page.on("response", async (response) => {
      if (
        response.url().includes("size-recommendation.virtusize.jp/item") &&
        response.request().method() === "POST"
      ) {
        try {
          const reqData = response.request().postData();
          const resData = await response.json();

          results.push({
            url: page.url(),
            store: new URL(page.url()).hostname,
            request: reqData,
            response: resData,
          });

          console.log("\n📦 Item API Captured:");
          console.log(" → extProductId:", resData?.extProductId || "N/A");
          console.log(" → sizeName:", resData?.sizeName || "N/A");
          console.log(" → secondSize:", resData?.secondSize || "N/A");
        } catch (err) {
          console.error("⚠ Error parsing /item response:", err.message);
        }
      }
    });

    try {
      await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });

      const widgetButton = await page.$("[data-attribute-id='vs-widget-button']");
      if (widgetButton) {
        await widgetButton.click();
        console.log("🖱️ Clicked Virtusize widget");
      }

      await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (err) {
      console.error(`⚠ Failed to load ${link}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  fs.writeFileSync("itemResponses.json", JSON.stringify(results, null, 2));
  console.log("\n✅ Saved all /item responses to itemResponses.json");

  await browser.close();
})();
