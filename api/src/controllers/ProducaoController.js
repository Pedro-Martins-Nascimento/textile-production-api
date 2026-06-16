const producaoRepository=require('../repositories/ProducaoRepository');
const producaoService=require('../services/ProducaoService')

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
    // Pega as query strings da URL (ex: ?page=1&limit=10&turno=1)
    let { page, limit, turno } = req.query;

    // Sanitiza e define valores padrão para não quebrar o cálculo matemático
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    turno = turno ? parseInt(turno) : null;

    const resultado = await producaoRepository.obterProducoesPaginada(page, limit, turno);

    return res.status(200).json({
      meta: {
        pagina_atual: page,
        limite_por_pagina: limit,
        total_registros: resultado.totalRegistros,
        total_paginas: resultado.totalPaginas
      },
      data: resultado.dados
    });
  } catch (error) {
    console.error("Erro na paginação:", error);
    return res.status(500).json({ message: "Erro ao listar produções.", error: error.message });
  }
};

const gravarProducao = async (req, res) => {
  try {
    const { data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas } = req.body;

    // jogar para o service...
    if (!data_producao || !numero_tear || !codigo_produto || !turno || !qualidade || !quilos || !pecas) {
      return res.status(400).json({ message: "Todos os campos da produção são obrigatórios." });
    }

    const novaProducao = await producaoService.criarProducao({
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

const atualizarProducao = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas } = req.body;

    if (!data_producao || !numero_tear || !codigo_produto || !turno || !qualidade || !quilos || !pecas) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios para atualização total." });
    }

    const producaoAtualizada = await producaoRepository.atualizarProducao(id, {
      data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas
    });

    if (!producaoAtualizada) {
      return res.status(404).json({ message: "Produção não encontrada para atualização." });
    }

    return res.status(200).json(producaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar produção:", error);
    return res.status(500).json({ message: "Erro interno ao atualizar", error: error.message });
  }
};

const deletarProducao = async (req, res) => {
  try {
    const { id } = req.params;

    const deletadoComSucesso = await producaoRepository.removerProducao(id);

    if (!deletadoComSucesso) {
      return res.status(404).json({ message: "Produção não encontrada para exclusão." });
    }

    return res.status(200).json({ message: `Registro com ID ${id} removido com sucesso.` });
  } catch (error) {
    console.error("Erro ao deletar produção:", error);
    return res.status(500).json({ message: "Erro interno ao deletar", error: error.message });
  }
};

module.exports = {
  obterProducaoPeloId,
  obterTodasProducoes,
  gravarProducao,
  atualizarProducao,
  deletarProducao
};