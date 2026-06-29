const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();

const producaoRoute = require('./routes/ProducaoRoute');
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

app.use(cors());
app.use(express.json());

app.use('/api',producaoRoute);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
})
