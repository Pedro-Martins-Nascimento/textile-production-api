const express = require('express');
const app = express();

const producaoRoute = require('./routes/ProducaoRoute');

app.use(express.json());

app.use('/api',producaoRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
})
