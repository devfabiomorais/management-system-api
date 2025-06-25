import puppeteer from 'puppeteer';

export async function convertHtmlToPdf(html: string, outputPath: string) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPath, format: 'A4' });
    console.log(`✅ 'convertHtmlToPdf': PDF gerado com sucesso em: ${outputPath}`);
  } catch (error) {
    console.error(`❌ 'convertHtmlToPdf': Erro ao converter HTML para PDF:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
