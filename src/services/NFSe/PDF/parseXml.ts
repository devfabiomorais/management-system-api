import { XMLParser } from 'fast-xml-parser';

export function parseXml(xmlString: string) {
  try {
    // Se o XML vier com aspas escapadas, faça um unescape simples:
    const cleanedXml = xmlString.replace(/\\"/g, '"');

    // Configurações para o parser
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

    return jsonObj;
  } catch (error) {
    console.error('❌ "parseXml": Erro ao fazer o parse do XML:', error);
    throw error;
  }
}
