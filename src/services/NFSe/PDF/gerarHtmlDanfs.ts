export async function gerarHtmlDanfs(data: any) {
  try {

    if (!data?.tbnfd?.nfdok?.NewDataSet?.NOTA_FISCAL) {
      throw new Error("Estrutura de dados inválida: data.tbnfd.nfdok.NewDataSet.NOTA_FISCAL está indefinida.");
    }

    const nota = data.tbnfd.nfdok.NewDataSet.NOTA_FISCAL;

    const notaFormatada = JSON.stringify(nota, (key, value) => {
      if (typeof value === 'string' && value.length > 500) {
        return '[DADO OMITIDO POR SER MUITO GRANDE]';
      }
      return value;
    }, 2);

    console.log("'gerarHtmlDanfs': Dados da nota recebida:", notaFormatada);

    const campo = (titulo: string, valor: any) => `
      <div class="campo">
        <strong>${titulo}</strong><br>
        ${valor || '"valor indefinido"'}
      </div>
    `;

    const secao = (tituloSecao: string, campos: string, colunas: number = 3) => `
      <div class="linha"></div>
      ${tituloSecao ? `<h2>${tituloSecao}</h2>` : ''}
      <div class="grid col-${colunas}">
        ${campos}
      </div>
    `;

    const URLlogo = "https://www.gov.br/nfse/pt-br/municipios/formulario-de-adesao/formulario-de-adesao/logo_nfe_horizontal.png";

    return `
  <html>
  <head>
    <style>
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Arial, sans-serif;
    font-size: 10px;
    margin: 5px; 
  }

  .container {
    border: 2px solid #000;
    padding: 10px;
    position: relative;
    min-height: calc(100vh - 10px);
    box-sizing: border-box;
  }

  h1 { font-size: 14px; margin: 5px 0; text-align: center; }
  h2 { font-size: 12px; margin: 5px 0; }
  .linha { border-top: 2px solid #000; margin: 5px 0; }
  .grid { display: grid; gap: 4px; }
  .col-3 { grid-template-columns: repeat(3, 1fr); }
  .col-4 { grid-template-columns: repeat(4, 1fr); }
  .campo { margin-bottom: 2px; }
  .header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    height: 50px;
  }
  .logo {
    position: absolute;
    left: 0;
    height: 30px;
    width: auto;
  }
  .title h1 {
    font-size: 14px;
    margin: 0;
    text-align: center;
    line-height: 1.2;
  }
</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${URLlogo}" alt="Logo NFS-e" class="logo">
        <div class="title">
          <h1>DANFSe v1.0<br>Documento Auxiliar da NFS-e</h1>
        </div>
      </div>

      ${secao('', `
        ${campo('Chave de Acesso da NFS-e', nota.ChaveValidacao)}
        ${campo('Número da NFS-e', nota.NumeroNota)}
        ${campo('Competência da NFS-e', nota.Competencia)}
        ${campo('Data e Hora da Emissão da NFS-e', nota.DataEmissao)}
        ${campo('Número da DPS', nota.NumeroDPS)}
        ${campo('Série da DPS', nota.SerieDPS)}
        ${campo('Data e Hora da Emissão da DPS', nota.DataEmissaoDPS)}
      `, 3)}

      ${secao('', `
        ${campo('Emitente da NFS-e', nota.TimbreContribuinteLinha1)}
        ${campo('CNPJ / CPF / NIF', nota.TimbreContribuinteLinha4)}
        ${campo('Inscrição Municipal', nota.ClienteInscricaoMunicipal)}
        ${campo('Telefone', nota.ClienteFone)}
        ${campo('Nome / Nome Empresarial', nota.ClienteNomeFantasia)}
        ${campo('E-mail', nota.ClienteEmail)}
        ${campo('Endereço', `${nota.ClienteEndereco}, ${nota.ClienteNumeroLogradouro}`)}
        ${campo('Município', nota.ClienteCidade)}
        ${campo('CEP', nota.ClienteCEP)}
      `, 4)}

      ${secao('Tomador do Serviço', `
        ${campo('CNPJ / CPF / NIF', nota.ClienteCNPJCPF)}
        ${campo('Inscrição Municipal', nota.ClienteInscricaoMunicipal)}
        ${campo('Telefone', nota.ClienteFone)}
        ${campo('Nome / Nome Empresarial', nota.ClienteNomeFantasia)}
        ${campo('E-mail', nota.ClienteEmail)}
        ${campo('Endereço', `${nota.ClienteEndereco}, ${nota.ClienteNumeroLogradouro}`)}
        ${campo('Município', nota.ClienteCidade)}
        ${campo('CEP', nota.ClienteCEP)}
      `, 4)}

      ${secao('Serviço Prestado', `
        ${campo('Descrição do Serviço', nota.Observacao)}
        ${campo('Código de Tributação Nacional', nota.Cae)}
        ${campo('Código de Tributação Municipal', nota.CodigoTribMun)}
        ${campo('Local da Prestação', nota.ClienteCidade)}
        ${campo('País da Prestação', nota.ClientePais)}
      `, 4)}

      ${secao('Tributação Municipal', `
        ${campo('Tributação do ISSQN', nota.ISSQNTotal)}
        ${campo('Operação Tributável', nota.NaturezaOperacao)}
        ${campo('Município de Incidência do ISSQN', nota.ClienteCidade)}
        ${campo('Regime Especial de Tributação', nota.RegimeEspecial)}
      `, 4)}

      ${secao('Tributação Federal', `
        ${campo('IRRF', nota.Irrf)}
        ${campo('CSLL', nota.Csll)}
        ${campo('PIS', nota.Pis)}
        ${campo('COFINS', nota.Cofins)}
        ${campo('Retenção do PIS/COFINS', nota.RetencaoPISCOFINS)}
        ${campo('Total Tributação Federal', nota.TotalTribFed)}
      `, 4)}

      ${secao('VALOR TOTAL DA NFS-E', `
        ${campo('Valor do Serviço', nota.ValorTotalNota)}
        ${campo('Desconto Condicionado', nota.DescontoCondicionado)}
        ${campo('Desconto Incondicionado', nota.DescontoIncondicionado)}
        ${campo('ISSQN Retido', nota.ISSQNRetido)}
        ${campo('Valor Líquido da NFS-e', nota.ValorLiquido)}
      `, 4)}

      ${secao('Totais Aproximados dos Tributos', `
        ${campo('Federais', nota.TotaisFederais)}
        ${campo('Estaduais', nota.TotaisEstaduais)}
        ${campo('Municipais', nota.TotaisMunicipais)}
      `, 4)}

      ${campo('Informações Complementares', nota.InformacoesComplementares)}
      ${campo('NBS', nota.NBS)}
    </div>
  </body>
  </html>
  `;
  } catch (error) {
    console.error("'gerarHtmlDanfs': Erro ao gerar HTML da DANFSe:", error);
    throw error;
  }
}
