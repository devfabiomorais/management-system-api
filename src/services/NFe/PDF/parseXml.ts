import { XMLParser } from 'fast-xml-parser';

export function parseXml(xmlString: string) {
  try {
    const cleanedXml = xmlString.replace(/\\"/g, '"');

    const parserOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
      trimValues: true,
      ignoreDeclaration: false,
      processEntities: true,
      removeNSPrefix: true,
      parseAttributeValue: true,
    };

    const parser = new XMLParser(parserOptions);
    const jsonObj = parser.parse(cleanedXml);

    // Verifica se veio dentro de nfeProc ou diretamente como NFe
    const nfe = jsonObj?.nfeProc?.NFe || jsonObj?.NFe;
    const nota = nfe?.infNFe;
    const chave =
      jsonObj?.nfeProc?.protNFe?.infProt?.chNFe ||
      nfe?.infNFe?.Id?.replace(/^NFe/, '') || // tenta extrair da Id, se disponível
      null;

    if (!nota) {
      console.warn("⚠️ Estrutura da NF-e incompleta: 'infNFe' não encontrado.");
    }

    return {
      nota,
      chave,
      original: jsonObj,
    };
  } catch (error) {
    console.error('❌ "parseXml": Erro ao fazer o parse do XML:', error);
    throw error;
  }
}
