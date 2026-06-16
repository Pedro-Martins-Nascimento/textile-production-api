const express = require('express');
const router = express.Router();
const producaoControler = require('../controllers/ProducaoController');

//Definição de rotas da API de Produção
router.get('/producoes/:id', producaoControler.obterProducaoPeloId);
router.get('/producoes', producaoControler.obterTodasProducoes);
router.post('/producoes', producaoControler.gravarProducao);

module.exports = router;