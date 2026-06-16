const poolPgSQL = require('../db/ConexaoDB');

const obterPeloId = async(id) => {
  const query = 'SELECT * FROM producoes WHERE id = $1';
  const result = await poolPgSQL.query(query, [id]);

  return result.rows[0];
}

const obterTodos = async() => {
  const query = 'SELECT * FROM producoes ORDER BY id ASC';
  const result = await poolPgSQL.query(query);

  return result.rows;
}

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

module.exports={
  obterPeloId,
  obterTodos,
  gravarProducao
};