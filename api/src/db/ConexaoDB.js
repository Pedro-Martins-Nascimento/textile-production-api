require('dotenv').config();

const { Pool } = require('pg');

//Metadados para iniciar conexão com o PostgreSQL
const poolPgSQL = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || 5432), // porta padrão do Postgres
});

module.exports = poolPgSQL;