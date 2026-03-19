const { chromium } = require('playwright');
const fs = require('fs');

const cities = ['madrid'];

(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  let allDeals = [];

  for (const city of cities) {

    try {

      console.log(`Scraping ${city}...`);

      await page.goto(`https://www.groupon.es/ofertas/${city}`, {
        waitUntil: 'networkidle',
        timeout: 60000
      });

      // Esperar carga
      await page.waitForTimeout(10000);

      // Scroll varias veces
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(2000);
      }

      const deals = await page.evaluate(() => {

        let results = [];

        // selector 1
        document.querySelectorAll('a[href*="/deals/"]').forEach(el => {
          results.push({
            title: el.innerText.trim(),
            link: el.href
          });
        });

        // selector 2 (fallback)
        document.querySelectorAll('a').forEach(el => {
          if (el.href.includes('/deals/')) {
            results.push({
              title: el.innerText.trim(),
              link: el.href
            });
          }
        });

        return results;
      });

      console.log(`Encontrados: ${deals.length}`);

      allDeals.push(...deals.map(d => ({
        ...d,
        city
      })));

    } catch (err) {
      console.log(`Error en ${city}:`, err.message);
    }
  }

  // limpiar duplicados y vacíos
  const uniqueDeals = Object.values(
    allDeals
      .filter(d => d.title && d.link)
      .reduce((acc, deal) => {
        acc[deal.link] = deal;
        return acc;
      }, {})
  );

  console.log(`Total únicos: ${uniqueDeals.length}`);

  fs.writeFileSync('deals.json', JSON.stringify(uniqueDeals, null, 2));

  console.log("✅ JSON generado");

  await browser.close();

})();
