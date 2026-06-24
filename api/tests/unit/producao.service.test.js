const producaoRepository = require('../../src/repositories/ProducaoRepository');
const producaoService = require('../../src/services/ProducaoService');

jest.mock('../../src/repositories/ProducaoRepository');

describe('ProducaoService', () => {

  test('deve criar produção com sucesso', async () => {

    producaoRepository.gravarProducao.mockResolvedValue({
      id: 1
    });

    const resultado = await producaoService.criarProducao({
      data_producao: '2025-01-01T10:00:00',
      numero_tear: 'T-001',
      codigo_produto: 'MAL-001',
      turno: 1,
      qualidade: 1,
      quilos: 10,
      pecas: 100
    });

    expect(resultado.id).toBe(1);
  });

  test('deve falhar quando faltar numero_tear', async () => {

    await expect(
      producaoService.criarProducao({
        data_producao: '2025-01-01T10:00:00'
      })
    ).rejects.toThrow();
  });

  test('deve falhar com turno inválido', async () => {

    await expect(
      producaoService.criarProducao({
        data_producao: '2025-01-01T10:00:00',
        numero_tear: 'T-001',
        codigo_produto: 'MAL-001',
        turno: 5,
        qualidade: 1,
        quilos: 10,
        pecas: 100
      })
    ).rejects.toThrow();
  });

  test('deve falhar com qualidade inválida', async () => {

    await expect(
      producaoService.criarProducao({
        data_producao: '2025-01-01T10:00:00',
        numero_tear: 'T-001',
        codigo_produto: 'MAL-001',
        turno: 1,
        qualidade: 5,
        quilos: 10,
        pecas: 100
      })
    ).rejects.toThrow();
  });

  test('deve falhar com quilos negativos', async () => {

    await expect(
      producaoService.criarProducao({
        data_producao: '2025-01-01T10:00:00',
        numero_tear: 'T-001',
        codigo_produto: 'MAL-001',
        turno: 1,
        qualidade: 1,
        quilos: -1,
        pecas: 100
      })
    ).rejects.toThrow();
  });

});