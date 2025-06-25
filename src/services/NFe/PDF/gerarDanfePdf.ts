import { parseXml } from "./parseXml.js";
import { gerarHtmlDanfe } from "./gerarHtmlDanfe.js";
import { convertHtmlToPdf } from "./convertHtmlToPdf.js";

export async function gerarDanfePdf(xml: string, outputPath: string): Promise<void> {
  try {
    const { nota, chave, original } = parseXml(xml);

    if (!nota) {
      console.error("❌ Estrutura inválida: 'infNFe' (nota) não encontrada.");
      throw new Error("Estrutura da NF-e inválida: 'infNFe' não encontrada.");
    }

    // Log para depuração opcional
    console.log("📦 Estrutura 'nota' recebida:");
    console.dir(nota, { depth: 4 });

    // Chave de acesso também é importante (mas não obrigatória para o DANFE)
    if (!chave) {
      console.warn("⚠️ Aviso: chave de acesso (chNFe) não encontrada.");
    }

    // Gera o HTML da DANFE
    const html = await gerarHtmlDanfe({ nfeProc: original?.nfeProc });
    if (!html || typeof html !== "string") {
      console.error("❌ 'gerarHtmlDanfe': Retornou HTML vazio ou inválido.");
      throw new Error("Erro ao gerar HTML da DANFE.");
    }

    // Converte o HTML para PDF
    await convertHtmlToPdf(html, outputPath);
    console.log(`✅ 'gerarDanfePdf': PDF DANFE gerado com sucesso em: ${outputPath}`);

  } catch (error) {
    console.error(`❌ 'gerarDanfePdf': Erro ao gerar DANFE PDF:`, error);
    throw error;
  }
}
