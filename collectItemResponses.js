import fs from "fs";
import puppeteer from "puppeteer";
import storeLinks from "./storeLinks.js";

(async () => {
  const browser = await puppeteer.launch({
    headless: false, //set to false if to open browser
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    userDataDir: "/Users/rachel/Documents/sizeRec/PuppeteerProfile",
    defaultViewport: null,
  });

  // Load existing data if file exists
  let existingResults = [];
  if (fs.existsSync("itemResponses.json")) {
    existingResults = JSON.parse(fs.readFileSync("itemResponses.json", "utf-8"));
  }

  const newResults = [];

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
          const reqData = JSON.parse(response.request().postData());
          const payload = reqData.items?.[0]?.additional_info || {};
          const productType = reqData.items?.[0]?.product_type || "";
          const extProductId = reqData.items?.[0]?.ext_product_id || "";
          const userGender = reqData.user_gender || "";
          const userHeight = reqData.user_height || "";
          const userWeight = reqData.user_weight || "";
          const userAge = reqData.user_age || "";
          const sizeKeys = Object.keys(payload.sizes || {});

          const resData = await response.json();
          const resFirst = Array.isArray(resData) ? resData[0] : resData;

          newResults.push({
            timestamp: new Date().toISOString(), // ⏰ Add timestamp
            url: page.url(),
            store: new URL(page.url()).hostname,
            extProductId,
            payload: {
              brand: payload.brand || "",
              fit: payload.fit || "",
              sizes: sizeKeys,
              product_type: productType,
              user_gender: userGender,
              user_height: userHeight,
              user_weight: userWeight,
              user_age: userAge,
            },
            response: {
              sizeName: resFirst?.sizeName || "",
              secondSize: resFirst?.secondSize || "",
              scenario: resFirst?.scenario || "",
              willFit: resFirst?.willFit || false,
            },
          });

          console.log("📦 Captured:", extProductId);
        } catch (err) {
          console.error("⚠ Error parsing /item data:", err.message);
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

      await new Promise((resolve) => setTimeout(resolve, 10000));
    } catch (err) {
      console.error(`⚠ Failed to load ${link}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  // Merge old + new
  const allResults = [...existingResults, ...newResults];
  fs.writeFileSync("itemResponses.json", JSON.stringify(allResults, null, 2));

  console.log("\n✅ Appended new results with timestamp to itemResponses.json");

  await browser.close();
})();
