CREATE TABLE IF NOT EXISTS producoes (
  id             SERIAL PRIMARY KEY,
  data_producao  TIMESTAMP     NOT NULL,
  numero_tear    VARCHAR(20)   NOT NULL,
  codigo_produto VARCHAR(30)   NOT NULL,
  turno          INTEGER       NOT NULL CHECK (turno IN (1, 2, 3)),
  qualidade      INTEGER       NOT NULL CHECK (qualidade IN (1, 2, 3)), -- Alterado para INTEGER
  quilos         DECIMAL(10,2) NOT NULL CHECK (quilos > 0),
  pecas          INTEGER       NOT NULL CHECK (pecas > 0),
  created_at     TIMESTAMP     DEFAULT NOW()
);

-- Dados de teste com qualidade numérica (1=A, 2=B, 3=C)
INSERT INTO producoes (data_producao, numero_tear, codigo_produto, turno, qualidade, quilos, pecas) VALUES
  ('2026-04-20 06:15:22', 'T-001', 'MAL-001', 1, 1, 8.50,  275),
  ('2026-04-20 09:30:45', 'T-002', 'MAL-001', 1, 1, 7.80,  252),
  ('2026-04-20 14:22:10', 'T-003', 'MAL-002', 2, 2, 6.20,  200),
  ('2026-04-20 17:45:31', 'T-004', 'MAL-002', 2, 1, 9.10,  294),
  ('2026-04-20 22:10:15', 'T-005', 'MAL-003', 3, 3, 5.40,  175),
  ('2026-04-21 07:05:12', 'T-001', 'MAL-001', 1, 1, 8.90,  288),
  ('2026-04-21 15:40:55', 'T-002', 'MAL-003', 2, 2, 7.10,  230),
  ('2026-04-21 23:50:18', 'T-003', 'MAL-001', 3, 1, 8.30,  269),
  ('2026-04-21 08:20:01', 'T-004', 'MAL-002', 1, 2, 6.70,  217),
  ('2026-04-21 16:15:40', 'T-002', 'MAL-003', 2, 1, 9.40,  304);