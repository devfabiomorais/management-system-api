export async function gerarHtmlDanfe(data: any) {
  try {
    console.log("📥 Estrutura recebida em gerarHtmlDanfe:");
    console.dir(data, { depth: 5 });

    const nota = data?.nfeProc?.NFe?.infNFe;
    if (!nota) throw new Error("Estrutura da NF-e inválida.");

    const emit = nota.emit;
    const dest = nota.dest;
    const ide = nota.ide;
    const total = nota.total?.ICMSTot;
    const prot = data?.nfeProc?.protNFe?.infProt;

    // Garante que produtos seja sempre um array
    const produtos = Array.isArray(nota.det) ? nota.det : [nota.det];

    const formatCampo = (titulo: string, valor: any) => `
      <tr>
        <td class="label">${titulo}</td>
        <td>${valor ?? "N/A"}</td>
      </tr>
    `;

    const formatLinhaProduto = (prod: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${prod.prod.cProd}</td>
        <td>${prod.prod.xProd}</td>
        <td>${prod.prod.qCom}</td>
        <td>${prod.prod.uCom}</td>
        <td>${prod.prod.vUnCom}</td>
        <td>${prod.prod.vProd}</td>
      </tr>
    `;

    return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
        h1 { text-align: center; font-size: 16px; margin-bottom: 10px; }
        .secao { border: 1px solid #000; margin-bottom: 10px; }
        .secao-title {
          background-color: #ddd;
          font-weight: bold;
          padding: 4px;
          border-bottom: 1px solid #000;
        }
        table { width: 100%; border-collapse: collapse; }
        .dados-table td {
          border: 1px solid #000;
          padding: 4px;
        }
        .label {
          font-weight: bold;
          background-color: #f3f3f3;
          width: 30%;
        }
        .produtos-table th, .produtos-table td {
          border: 1px solid #000;
          padding: 3px;
          text-align: left;
        }
        .produtos-table th {
          background-color: #eee;
        }
      </style>
    </head>
    <body>
      <h1>DANFE - Documento Auxiliar da Nota Fiscal Eletrônica</h1>

      <div class="secao">
        <div class="secao-title">Chave de Acesso</div>
        <table class="dados-table">
          ${formatCampo("Chave de Acesso", prot?.chNFe)}
          ${formatCampo("Número NF-e", ide.nNF)}
          ${formatCampo("Série", ide.serie)}
          ${formatCampo("Data de Emissão", ide.dhEmi)}
        </table>
      </div>

      <div class="secao">
        <div class="secao-title">Emitente</div>
        <table class="dados-table">
          ${formatCampo("Nome", emit.xNome)}
          ${formatCampo("CNPJ", emit.CNPJ)}
          ${formatCampo("Endereço", `${emit.enderEmit?.xLgr}, ${emit.enderEmit?.nro}`)}
          ${formatCampo("Município", emit.enderEmit?.xMun)}
          ${formatCampo("UF", emit.enderEmit?.UF)}
        </table>
      </div>

      <div class="secao">
        <div class="secao-title">Destinatário</div>
        <table class="dados-table">
          ${formatCampo("Nome", dest.xNome)}
          ${formatCampo("CNPJ/CPF", dest.CNPJ || dest.CPF)}
          ${formatCampo("Endereço", `${dest.enderDest?.xLgr}, ${dest.enderDest?.nro}`)}
          ${formatCampo("Município", dest.enderDest?.xMun)}
          ${formatCampo("UF", dest.enderDest?.UF)}
        </table>
      </div>

      <div class="secao">
        <div class="secao-title">Produtos</div>
        <table class="produtos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            ${produtos.map((p: any, i: number) => formatLinhaProduto(p, i)).join("")}
          </tbody>
        </table>
      </div>

      <div class="secao">
        <div class="secao-title">Totais</div>
        <table class="dados-table">
          ${formatCampo("Valor Total da NF-e", total.vNF)}
          ${formatCampo("Base de Cálculo do ICMS", total.vBC)}
          ${formatCampo("ICMS", total.vICMS)}
          ${formatCampo("Frete", total.vFrete)}
          ${formatCampo("Desconto", total.vDesc)}
          ${formatCampo("Outros", total.vOutro)}
        </table>
      </div>

      <div class="secao">
        <div class="secao-title">Informações Adicionais</div>
        <table class="dados-table">
          ${formatCampo("Protocolo de Autorização", prot.nProt)}
          ${formatCampo("Data da Autorização", prot.dhRecbto)}
        </table>
      </div>
    </body>
    </html>
    `;
  } catch (error) {
    console.error("❌ 'gerarHtmlDanfe': Erro ao gerar HTML da DANFE:", error);
    throw error;
  }
}
