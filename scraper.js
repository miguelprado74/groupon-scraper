const { chromium } = require('playwright');
const fs = require('fs');

const cities = ['madrid']; // luego añadimos más

(async () => {

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let allDeals = [];

  for (const city of cities) {

    console.log(`Scraping ${city}...`);

    await page.goto(`https://www.groupon.es/browse/${city}`, {
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(5000);

    const deals = await page.evaluate(() => {
      const items = document.querySelectorAll('a[data-testid="deal-card"]');

      return Array.from(items).map(el => ({
        title: el.innerText,
        link: el.href
      }));
    });

    allDeals.push(...deals.map(d => ({
      ...d,
      city
    })));
  }

  fs.writeFileSync('deals.json', JSON.stringify(allDeals, null, 2));

  await browser.close();

})();
