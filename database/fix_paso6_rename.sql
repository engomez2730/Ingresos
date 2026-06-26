-- ================================================================
-- FIX: Paso 6 — Renombrar tablas al nombre definitivo
-- Ejecutar SOLO si migration_v2 ya corrió y los datos en
-- Ingreso_Nuevo / Descuento_Nuevo se ven correctos.
-- ================================================================

USE SPN_INGRESOS;
GO

-- Verificación previa: muestra cuántos registros hay en cada tabla
SELECT 'Ingreso (original)'   AS Tabla, COUNT(*) AS Filas FROM dbo.Ingreso
UNION ALL
SELECT 'Ingreso_Nuevo',                  COUNT(*) FROM dbo.Ingreso_Nuevo
UNION ALL
SELECT 'Compania_Ingreso',               COUNT(*) FROM dbo.Compania_Ingreso
UNION ALL
SELECT 'Descuento (original)',           COUNT(*) FROM dbo.Descuento
UNION ALL
SELECT 'Descuento_Nuevo',                COUNT(*) FROM dbo.Descuento_Nuevo
UNION ALL
SELECT 'Compania_Descuento',             COUNT(*) FROM dbo.Compania_Descuento;
GO

-- ================================================================
-- PASO 6-A: Eliminar triggers del original Ingreso/Descuento
-- (fuera de la transacción — DISABLE/DROP TRIGGER no puede ir
--  en el mismo batch que sp_rename + ALTER TABLE)
-- ================================================================
IF OBJECT_ID('dbo.trg_Ingreso_Upd',   'TR') IS NOT NULL DROP TRIGGER dbo.trg_Ingreso_Upd;
IF OBJECT_ID('dbo.trg_Descuento_Upd', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Descuento_Upd;
GO

-- ================================================================
-- PASO 6-B: Eliminar FKs de las tablas originales hacia Compania
-- Búsqueda dinámica porque Prisma genera nombres propios.
-- ================================================================
DECLARE @sql NVARCHAR(500);

-- FK de Ingreso (original) → Compania
SELECT @sql = 'ALTER TABLE dbo.Ingreso DROP CONSTRAINT [' + fk.name + ']'
FROM sys.foreign_keys fk
WHERE fk.parent_object_id     = OBJECT_ID('dbo.Ingreso')
  AND fk.referenced_object_id = OBJECT_ID('dbo.Compania');

IF @sql IS NOT NULL BEGIN EXEC(@sql); PRINT 'FK Ingreso→Compania eliminado.'; END
ELSE PRINT 'FK Ingreso→Compania no encontrado (ya fue eliminado).';

SET @sql = NULL;

-- FK de Descuento (original) → Compania
SELECT @sql = 'ALTER TABLE dbo.Descuento DROP CONSTRAINT [' + fk.name + ']'
FROM sys.foreign_keys fk
WHERE fk.parent_object_id     = OBJECT_ID('dbo.Descuento')
  AND fk.referenced_object_id = OBJECT_ID('dbo.Compania');

IF @sql IS NOT NULL BEGIN EXEC(@sql); PRINT 'FK Descuento→Compania eliminado.'; END
ELSE PRINT 'FK Descuento→Compania no encontrado (ya fue eliminado).';
GO

-- ================================================================
-- PASO 6-C: Renombrar tablas
-- ================================================================
-- Ingreso original → Ingreso_Old
IF OBJECT_ID('dbo.Ingreso', 'U') IS NOT NULL
   AND OBJECT_ID('dbo.Ingreso_Old', 'U') IS NULL
    EXEC sp_rename 'dbo.Ingreso', 'Ingreso_Old';

-- Ingreso_Nuevo (catálogo correcto) → Ingreso
IF OBJECT_ID('dbo.Ingreso_Nuevo', 'U') IS NOT NULL
    EXEC sp_rename 'dbo.Ingreso_Nuevo', 'Ingreso';

-- Descuento original → Descuento_Old
IF OBJECT_ID('dbo.Descuento', 'U') IS NOT NULL
   AND OBJECT_ID('dbo.Descuento_Old', 'U') IS NULL
    EXEC sp_rename 'dbo.Descuento', 'Descuento_Old';

-- Descuento_Nuevo (catálogo correcto) → Descuento
IF OBJECT_ID('dbo.Descuento_Nuevo', 'U') IS NOT NULL
    EXEC sp_rename 'dbo.Descuento_Nuevo', 'Descuento';
GO

PRINT 'Paso 6-C ✓ — Tablas renombradas.';
GO

-- ================================================================
-- PASO 6-D: Recrear triggers en las tablas definitivas
-- ================================================================
CREATE OR ALTER TRIGGER trg_Ingreso_Upd ON dbo.Ingreso AFTER UPDATE AS
BEGIN
    UPDATE dbo.Ingreso SET FechaActualizacion = GETDATE()
    FROM dbo.Ingreso i INNER JOIN inserted ins ON i.ID = ins.ID;
END;
GO

CREATE OR ALTER TRIGGER trg_Descuento_Upd ON dbo.Descuento AFTER UPDATE AS
BEGIN
    UPDATE dbo.Descuento SET FechaActualizacion = GETDATE()
    FROM dbo.Descuento d INNER JOIN inserted ins ON d.ID = ins.ID;
END;
GO

PRINT 'Paso 6-D ✓ — Triggers recreados en tablas definitivas.';
GO

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================
SELECT 'Ingreso (catálogo final)'  AS Tabla, COUNT(*) AS Filas FROM dbo.Ingreso
UNION ALL
SELECT 'Compania_Ingreso',                   COUNT(*) FROM dbo.Compania_Ingreso
UNION ALL
SELECT 'Descuento (catálogo final)',          COUNT(*) FROM dbo.Descuento
UNION ALL
SELECT 'Compania_Descuento',                 COUNT(*) FROM dbo.Compania_Descuento;

-- Confirmar que Ingreso NO tiene columna CompaniaID
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Ingreso'
ORDER BY ORDINAL_POSITION;
GO

PRINT '✅ Paso 6 completado. La migración V2 está finalizada.';
GO
