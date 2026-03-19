const { chromium } = require('playwright');
const fs = require('fs');

const cities = ['madrid']; // luego añadimos más

(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
  });

  let allDeals = [];

  for (const city of cities) {

    try {

      console.log(`Scraping ${city}...`);

      await page.goto(`https://www.groupon.es/browse/${city}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Espera fuerte (Groupon carga dinámico)
      await page.waitForTimeout(8000);

      // Scroll para cargar más
      await page.evaluate(async () => {
        window.scrollBy(0, window.innerHeight);
        await new Promise(r => setTimeout(r, 2000));
      });

      const deals = await page.evaluate(() => {

        const links = document.querySelectorAll('a[href*="/deals/"]');

        let results = [];

        links.forEach(el => {

          const title = el.innerText?.trim();
          const link = el.href;

          if (title && link) {
            results.push({
              title,
              link
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

  // eliminar duplicados por URL
  const uniqueDeals = Object.values(
    allDeals.reduce((acc, deal) => {
      acc[deal.link] = deal;
      return acc;
    }, {})
  );

  console.log(`Total únicos: ${uniqueDeals.length}`);

  // SIEMPRE generar archivo
  fs.writeFileSync('deals.json', JSON.stringify(uniqueDeals, null, 2));

  console.log("✅ JSON generado");

  await browser.close();

})();
