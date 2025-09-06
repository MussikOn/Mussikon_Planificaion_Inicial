-- Actualizar tabla requests para cambiar budget por extra_amount
-- Primero agregar la nueva columna
ALTER TABLE requests ADD COLUMN extra_amount DECIMAL(10,2) DEFAULT 0;

-- Actualizar registros existentes (si los hay)
UPDATE requests SET extra_amount = COALESCE(budget, 0);

-- Eliminar la columna budget
ALTER TABLE requests DROP COLUMN budget;

-- Agregar comentario a la nueva columna
COMMENT ON COLUMN requests.extra_amount IS 'Monto extra opcional que el líder quiere dar al músico';
