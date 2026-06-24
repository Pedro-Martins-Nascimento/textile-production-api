const producaoRepository=require('../repositories/ProducaoRepository');

const criarProducao = async (dados) => {
  const { data_producao, numero_tear, codigo_produto, quilos, pecas }=dados;
  let {qualidade,turno}=dados;
  
  if (!data_producao || !numero_tear || !codigo_produto || turno === undefined || !qualidade || quilos === undefined || pecas === undefined) {
    throw new Error("Todos los campos são estritamente obrigatórios.");
  }

  turno=parseInt(turno)
  if (turno<1||turno>3) throw new Error("O turno informado deve ser obrigatoriamente 1, 2 ou 3.");

  const dataSP = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const timestampSP = dataSP.replace(" ", "T");
  if (data_producao > timestampSP) {
    throw new Error(`A data de produção (${data_producao}) não pode ser uma data futura. Hoje é ${timestampSP}.`);
  }

  qualidade=parseInt(qualidade);
  if (qualidade<1||qualidade>3) throw new Error("A Qualidade informado deve ser obrigatoriamente 1, 2 ou 3.");

  const quilosNum = parseFloat(quilos);
  const pecasInt = parseInt(pecas);
  if (isNaN(quilosNum) || quilosNum <= 0 || isNaN(pecasInt) || pecasInt <= 0) {
    throw new Error("Quilos e peças devem ser números maiores que zero.");
  }

  return await producaoRepository.gravarProducao({
    data_producao,
    numero_tear,
    codigo_produto,
    turno: parseInt(turno),
    qualidade: qualidade,
    quilos: quilosNum,
    pecas: pecasInt
  });
};

module.exports = {
  criarProducao
};