const producaoRepository=require('../repositories/ProducaoRepository');

const obterProducaoPeloId = async (req, res) => {
  try {
    const { id } = req.params;

    const producao=await producaoRepository.obterPeloId(id);

    if (!producao) {
      return res.status(404).json({ message: "Produção não encontrada" });
    }

    return res.status(200).json(producao);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar produção", error: error.message });
  }
}

const obterTodasProducoes = async (req, res) => {
  try {
    const listaProducao=await producaoRepository.obterTodos();
    
    return res.status(200).json(listaProducao);
  } catch (error) {
    console.error("Erro no SELECT:", error);
    return res.status(500).json({ message: "Erro ao buscar produções", error: error.message });
  }
}

const gravarProducao = async (req, res) => {
  try {
    const { data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas } = req.body;

    // jogar para o service...
    if (!data_producao || !numero_tear || !codigo_produto || !turno || !qualidade || !quilos || !pecas) {
      return res.status(400).json({ message: "Todos os campos da produção são obrigatórios." });
    }

    const novaProducao = await producaoRepository.create({
      data_producao,
      numero_tear,
      codigo_produto,
      turno,
      qualidade,
      quilos,
      pecas
    });

    return res.status(201).json(novaProducao);

  } catch (error) {
    console.error("Erro ao gravar produção:", error);
    return res.status(500).json({ message: "Erro ao salvar o registro no banco", error: error.message });
  }
};

module.exports = {
  obterProducaoPeloId,
  obterTodasProducoes,
  gravarProducao
};