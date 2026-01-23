const puppeteer = require('puppeteer');

async function scrape(company: string, topic: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Build search URL: e.g., Google News, company site
    await page.goto(`https://www.example.com/search?q=${company}+${topic}`);
    // Extract text
    const texts = await page.evaluate(() => Array.from(document.querySelectorAll('p'), el => el.innerText));
    await browser.close();
    console.log(JSON.stringify(texts.slice(0, 10))); // return top 10 paragraphs
}

scrape(process.argv[2], process.argv[3]);