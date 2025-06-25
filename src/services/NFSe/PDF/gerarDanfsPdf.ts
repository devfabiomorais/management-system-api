import { parseXml } from "./parseXml.js"
import { gerarHtmlDanfs } from "./gerarHtmlDanfs.js"
import { convertHtmlToPdf } from "./convertHtmlToPdf.js"

export async function gerarDanfsPdf(xml: string, outputPath: string): Promise<void> {
  try {
    const json = parseXml(xml);

    const html = gerarHtmlDanfs(json);
    await convertHtmlToPdf(await html, outputPath);
    console.log(`✅ 'gerarDanfsPdf': PDF DANFSe gerado com sucesso em: ${outputPath}`);

  } catch (error) {
    console.error(`❌ 'gerarDanfsPdf': Erro ao gerar DANFSe PDF:`, error);
    throw error; // Lança o erro para quem chamou a função
  }
}
