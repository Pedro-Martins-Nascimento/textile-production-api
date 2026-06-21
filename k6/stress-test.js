import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuração de cenários via variável de ambiente
export const options = {
    // Cenário de estresse
    stages: [
        { duration: '1m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '3m', target: 450 },
	{ duration: '1m', target: 200 },
	{ duration: '30s', target: 100 },
	{ duration: '30s', target: 0 },
    ],
};

const BASE_URL = 'http://localhost:3000/api/producoes';
const HEADERS = { 'Content-Type': 'application/json' };

export default function () {
    // GET utilizando paginacao
    let getAllRes = http.get(`${BASE_URL}?page=1&limit=10`);
    check(getAllRes, { 'GET lista status 200': (r) => r.status === 200 });

    // GET sem usar paginacao
    let getAllData = http.get(`${BASE_URL}`);
    check(getAllData, {'GET de todos os dados': (r) => r.status === 200 });

    // 2. GET /producoes/1
    let getOneRes = http.get(`${BASE_URL}/1`);
    check(getOneRes, { 'GET id 1 status 200/404': (r) => r.status === 200 || r.status === 404 });

    // 3. POST /producoes com dados
    let payload = JSON.stringify({
        data_producao: "2026-06-21T12:37:53.000Z",
        numero_tear: "T-010",
        codigo_produto: "MAL-471",
        turno: 2,
        qualidade: 1,
        quilos: "18.50",
        pecas: 653
    });

    let postRes = http.post(BASE_URL, payload, { headers: HEADERS });

    // Check status POST
    let createdId;
    if (check(postRes, { 'POST criado com sucesso': (r) => r.status === 201 || r.status === 200 })) {
        try {
            // Extrair ID do body de resposta JSON
            const responseBody = JSON.parse(postRes.body);
            createdId = responseBody.id || (responseBody.data && responseBody.data.id);
        } catch (e) {
            // Erro JSON parse
        }
    }

    if (createdId) {
        let itemUrl = http.url`${BASE_URL}/${createdId}`;

        // 4. PUT /producoes/{id} no registro criado
        let updatePayload = JSON.stringify({
            data_producao: "2026-06-21T12:37:53.000Z",
            numero_tear: "T-010",
            codigo_produto: "MAL-471",
            turno: 3,
            qualidade: 1,
            quilos: "20.00",
            pecas: 653
        });

        let putRes = http.put(itemUrl, updatePayload, { headers: HEADERS });
        check(putRes, { 'PUT status 200': (r) => r.status === 200 });

        // 5. DELETE /producoes/{id} no registro criado
        let delRes = http.del(itemUrl);
        check(delRes, { 'DELETE status 200/204': (r) => r.status === 200 || r.status === 204 });
    }

    sleep(1);
}
