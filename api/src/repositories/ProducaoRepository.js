const poolPgSQL = require('../db/ConexaoDB');

const obterPeloId = async(id) => {
  const query = 'SELECT * FROM producoes WHERE id = $1';
  const result = await poolPgSQL.query(query, [id]);

  return result.rows[0];
}


const obterProducoesPaginada = async (page, limit, turno) => {
  const offset = (page - 1) * limit;
  const values = [];
  let query = 'SELECT * FROM producoes';
  let queryNumRegistros = 'SELECT COUNT(*) FROM producoes';

  if (turno) {
    query += ' WHERE turno = $1';
    queryNumRegistros += ' WHERE turno = $1';
    values.push(turno);
  }

  const limitPlaceholder = values.length + 1;
  const offsetPlaceholder = values.length + 2;
  
  query += ` ORDER BY id ASC LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`;
  
  const finalValues = [...values, limit, offset];

  const resul = await poolPgSQL.query(query, finalValues);
  const numRegistros = await poolPgSQL.query(queryNumRegistros, values);
  
  const totalRegistros = parseInt(numRegistros.rows[0]?.count) || 0;

  return {
    dados: resul.rows,
    totalRegistros,
    totalPaginas: Math.ceil(totalRegistros / limit)
  };
};

const gravarProducao = async (dadosProducao) => {
  const { data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas } = dadosProducao;

  const query = `
    INSERT INTO producoes 
      (data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas) 
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *;
 `;

  const values = [data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas];

  const result = await poolPgSQL.query(query, values);
  return result.rows[0]; 
};

const atualizarProducao = async (id, dadosAtualizados) => {
  const { data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas } = dadosAtualizados;

  const query = `
    UPDATE producoes 
    SET data_producao = $1, numero_tear = $2, codigo_produto = $3, turno = $4, qualidade = $5, quilos = $6, pecas = $7
    WHERE id = $8
    RETURNING *;
  `;

  const values = [data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas, id];

  const result = await poolPgSQL.query(query, values);
  return result.rows[0];
};

const removerProducao = async (id) => {
  const query = 'DELETE FROM producoes WHERE id = $1 RETURNING id;';
  const result = await poolPgSQL.query(query, [id]);
  
  return result.rowCount > 0;
};

module.exports={
  obterPeloId,
  obterProducoesPaginada,
  gravarProducao,
  atualizarProducao,
  removerProducao
};