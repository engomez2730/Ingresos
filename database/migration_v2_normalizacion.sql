-- ================================================================
-- MIGRACIÓN V2: Normalización a Catálogos + Eliminación de Cliente
-- SPN_INGRESOS — SQL Server
-- Ejecutar SIEMPRE sobre una copia de respaldo primero.
-- ================================================================

USE SPN_INGRESOS;
GO

-- ================================================================
-- PASO 0: RESPALDO PREVENTIVO
-- Estas tablas NO se eliminan automáticamente; quedan como seguro.
-- ================================================================
IF OBJECT_ID('dbo.BAK_Ingreso',   'U') IS NOT NULL DROP TABLE dbo.BAK_Ingreso;
IF OBJECT_ID('dbo.BAK_Descuento', 'U') IS NOT NULL DROP TABLE dbo.BAK_Descuento;
IF OBJECT_ID('dbo.BAK_Compania',  'U') IS NOT NULL DROP TABLE dbo.BAK_Compania;
IF OBJECT_ID('dbo.BAK_Cliente',   'U') IS NOT NULL DROP TABLE dbo.BAK_Cliente;
GO

SELECT * INTO dbo.BAK_Ingreso   FROM dbo.Ingreso;
SELECT * INTO dbo.BAK_Descuento FROM dbo.Descuento;
SELECT * INTO dbo.BAK_Compania  FROM dbo.Compania;
SELECT * INTO dbo.BAK_Cliente   FROM dbo.Cliente;
GO

PRINT 'Paso 0 ✓ — Tablas BAK_ creadas con snapshot completo.';
GO

-- ================================================================
-- PASO 1: CREAR CATÁLOGO MAESTRO DE INGRESOS
-- La tabla Ingreso deja de tener CompaniaID; representa un concepto único.
-- ================================================================
IF OBJECT_ID('dbo.Ingreso_Nuevo', 'U') IS NOT NULL DROP TABLE dbo.Ingreso_Nuevo;
GO

CREATE TABLE dbo.Ingreso_Nuevo (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    TipoIngresoID       INT                         NULL,
    Descripcion         NVARCHAR(400)               NOT NULL,
    Estado              BIT           DEFAULT 1     NOT NULL,
    Observaciones       NVARCHAR(MAX)               NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Ingreso_Nuevo     PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT UQ_Ingreso_Desc_Tipo UNIQUE (Descripcion, TipoIngresoID),
    CONSTRAINT FK_IngNuevo_Tipo     FOREIGN KEY (TipoIngresoID)
        REFERENCES dbo.TipoIngreso (ID) ON DELETE SET NULL ON UPDATE CASCADE
);
GO

-- ================================================================
-- PASO 2: CREAR CATÁLOGO MAESTRO DE DESCUENTOS
-- ================================================================
IF OBJECT_ID('dbo.Descuento_Nuevo', 'U') IS NOT NULL DROP TABLE dbo.Descuento_Nuevo;
GO

CREATE TABLE dbo.Descuento_Nuevo (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    TipoDescuentoID     INT                         NULL,
    Descripcion         NVARCHAR(400)               NOT NULL,
    Estado              BIT           DEFAULT 1     NOT NULL,
    Observaciones       NVARCHAR(MAX)               NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Descuento_Nuevo       PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT UQ_Descuento_Desc_Tipo   UNIQUE (Descripcion, TipoDescuentoID),
    CONSTRAINT FK_DescNuevo_Tipo        FOREIGN KEY (TipoDescuentoID)
        REFERENCES dbo.TipoDescuento (ID) ON DELETE SET NULL ON UPDATE CASCADE
);
GO

PRINT 'Paso 1-2 ✓ — Tablas catálogo creadas.';
GO

-- ================================================================
-- PASO 3: POBLAR CATÁLOGOS (deduplicando por Descripcion + TipoID)
-- Cuando el mismo concepto existe en varias compañías se toma:
--   • la fecha de creación más antigua
--   • la última fecha de actualización
--   • activo si al menos una instancia estaba activa
-- ================================================================
BEGIN TRAN

    INSERT INTO dbo.Ingreso_Nuevo
        (TipoIngresoID, Descripcion, Estado, Observaciones, FechaCreacion, FechaActualizacion)
    SELECT
        TipoIngresoID,
        Descripcion,
        CAST(MAX(CAST(Estado AS INT)) AS BIT)           AS Estado,
        MIN(Observaciones)                               AS Observaciones,
        MIN(FechaCreacion)                               AS FechaCreacion,
        MAX(FechaActualizacion)                          AS FechaActualizacion
    FROM dbo.Ingreso
    GROUP BY Descripcion, TipoIngresoID;

    INSERT INTO dbo.Descuento_Nuevo
        (TipoDescuentoID, Descripcion, Estado, Observaciones, FechaCreacion, FechaActualizacion)
    SELECT
        TipoDescuentoID,
        Descripcion,
        CAST(MAX(CAST(Estado AS INT)) AS BIT)           AS Estado,
        MIN(Observaciones)                               AS Observaciones,
        MIN(FechaCreacion)                               AS FechaCreacion,
        MAX(FechaActualizacion)                          AS FechaActualizacion
    FROM dbo.Descuento
    GROUP BY Descripcion, TipoDescuentoID;

COMMIT
PRINT 'Paso 3 ✓ — Catálogos poblados.';
GO

-- ================================================================
-- PASO 4: CREAR TABLAS PUENTE N:M
-- ================================================================
IF OBJECT_ID('dbo.Compania_Ingreso',  'U') IS NOT NULL DROP TABLE dbo.Compania_Ingreso;
IF OBJECT_ID('dbo.Compania_Descuento','U') IS NOT NULL DROP TABLE dbo.Compania_Descuento;
GO

CREATE TABLE dbo.Compania_Ingreso (
    ID              INT        IDENTITY(1,1) NOT NULL,
    CompaniaID      INT                      NOT NULL,
    IngresoID       INT                      NOT NULL,
    FechaAsignacion DATETIME2  DEFAULT GETDATE() NOT NULL,
    Activo          BIT        DEFAULT 1         NOT NULL,
    CONSTRAINT PK_Compania_Ingreso  PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT UQ_CI_Compania_Ing   UNIQUE (CompaniaID, IngresoID),
    CONSTRAINT FK_CI_Compania       FOREIGN KEY (CompaniaID)
        REFERENCES dbo.Compania (ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_CI_Ingreso        FOREIGN KEY (IngresoID)
        REFERENCES dbo.Ingreso_Nuevo (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO
CREATE INDEX IX_CI_CompaniaID ON dbo.Compania_Ingreso (CompaniaID);
CREATE INDEX IX_CI_IngresoID  ON dbo.Compania_Ingreso (IngresoID);
GO

CREATE TABLE dbo.Compania_Descuento (
    ID              INT        IDENTITY(1,1) NOT NULL,
    CompaniaID      INT                      NOT NULL,
    DescuentoID     INT                      NOT NULL,
    FechaAsignacion DATETIME2  DEFAULT GETDATE() NOT NULL,
    Activo          BIT        DEFAULT 1         NOT NULL,
    CONSTRAINT PK_Compania_Descuento  PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT UQ_CD_Compania_Desc    UNIQUE (CompaniaID, DescuentoID),
    CONSTRAINT FK_CD_Compania         FOREIGN KEY (CompaniaID)
        REFERENCES dbo.Compania (ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_CD_Descuento        FOREIGN KEY (DescuentoID)
        REFERENCES dbo.Descuento_Nuevo (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO
CREATE INDEX IX_CD_CompaniaID  ON dbo.Compania_Descuento (CompaniaID);
CREATE INDEX IX_CD_DescuentoID ON dbo.Compania_Descuento (DescuentoID);
GO

PRINT 'Paso 4 ✓ — Tablas puente creadas.';
GO

-- ================================================================
-- PASO 5: POBLAR TABLAS PUENTE
-- Para cada fila antigua: mapear CompaniaID al nuevo ID de catálogo.
-- GROUP BY elimina duplicados si una compañía tenía el mismo concepto dos veces.
-- ================================================================
BEGIN TRAN

    INSERT INTO dbo.Compania_Ingreso (CompaniaID, IngresoID, FechaAsignacion, Activo)
    SELECT
        ing_old.CompaniaID,
        ing_new.ID                               AS IngresoID,
        MIN(ing_old.FechaCreacion)               AS FechaAsignacion,
        CAST(MAX(CAST(ing_old.Estado AS INT)) AS BIT) AS Activo
    FROM dbo.Ingreso ing_old
    INNER JOIN dbo.Ingreso_Nuevo ing_new
        ON  ing_old.Descripcion  = ing_new.Descripcion
        AND (   ing_old.TipoIngresoID = ing_new.TipoIngresoID
             OR (ing_old.TipoIngresoID IS NULL AND ing_new.TipoIngresoID IS NULL))
    GROUP BY ing_old.CompaniaID, ing_new.ID;

    INSERT INTO dbo.Compania_Descuento (CompaniaID, DescuentoID, FechaAsignacion, Activo)
    SELECT
        desc_old.CompaniaID,
        desc_new.ID                                  AS DescuentoID,
        MIN(desc_old.FechaCreacion)                  AS FechaAsignacion,
        CAST(MAX(CAST(desc_old.Estado AS INT)) AS BIT) AS Activo
    FROM dbo.Descuento desc_old
    INNER JOIN dbo.Descuento_Nuevo desc_new
        ON  desc_old.Descripcion    = desc_new.Descripcion
        AND (   desc_old.TipoDescuentoID = desc_new.TipoDescuentoID
             OR (desc_old.TipoDescuentoID IS NULL AND desc_new.TipoDescuentoID IS NULL))
    GROUP BY desc_old.CompaniaID, desc_new.ID;

COMMIT
PRINT 'Paso 5 ✓ — Tablas puente pobladas.';
GO

-- ================================================================
-- VERIFICACIÓN INTERMEDIA
-- Ejecuta estas consultas manualmente para validar integridad:
--   SELECT COUNT(*) FROM dbo.BAK_Ingreso    → total original
--   SELECT COUNT(*) FROM dbo.Ingreso_Nuevo  → catálogo deduplicado
--   SELECT COUNT(*) FROM dbo.Compania_Ingreso → relaciones (≥ total original / duplicado)
-- ================================================================

-- ================================================================
-- PASO 6: REEMPLAZAR TABLAS ORIGINALES POR LAS NUEVAS
-- NOTA: DISABLE/DROP TRIGGER no puede ir en el mismo batch que
-- sp_rename + ALTER TABLE en SQL Server. Se usan batches separados
-- separados por GO.
-- ================================================================

-- 6-A: Eliminar triggers de las tablas originales (batch propio)
IF OBJECT_ID('dbo.trg_Ingreso_Upd',   'TR') IS NOT NULL DROP TRIGGER dbo.trg_Ingreso_Upd;
IF OBJECT_ID('dbo.trg_Descuento_Upd', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Descuento_Upd;
GO

-- 6-B: Eliminar FKs hacia Compania (nombres generados por Prisma → búsqueda dinámica)
DECLARE @sql NVARCHAR(500);

SELECT @sql = 'ALTER TABLE dbo.Ingreso DROP CONSTRAINT [' + fk.name + ']'
FROM sys.foreign_keys fk
WHERE fk.parent_object_id     = OBJECT_ID('dbo.Ingreso')
  AND fk.referenced_object_id = OBJECT_ID('dbo.Compania');
IF @sql IS NOT NULL EXEC(@sql);

SET @sql = NULL;

SELECT @sql = 'ALTER TABLE dbo.Descuento DROP CONSTRAINT [' + fk.name + ']'
FROM sys.foreign_keys fk
WHERE fk.parent_object_id     = OBJECT_ID('dbo.Descuento')
  AND fk.referenced_object_id = OBJECT_ID('dbo.Compania');
IF @sql IS NOT NULL EXEC(@sql);
GO

-- 6-C: Renombrar tablas (batch propio — sp_rename no puede mezclarse con ALTER TABLE)
IF OBJECT_ID('dbo.Ingreso', 'U') IS NOT NULL AND OBJECT_ID('dbo.Ingreso_Old', 'U') IS NULL
    EXEC sp_rename 'dbo.Ingreso', 'Ingreso_Old';

IF OBJECT_ID('dbo.Ingreso_Nuevo', 'U') IS NOT NULL
    EXEC sp_rename 'dbo.Ingreso_Nuevo', 'Ingreso';

IF OBJECT_ID('dbo.Descuento', 'U') IS NOT NULL AND OBJECT_ID('dbo.Descuento_Old', 'U') IS NULL
    EXEC sp_rename 'dbo.Descuento', 'Descuento_Old';

IF OBJECT_ID('dbo.Descuento_Nuevo', 'U') IS NOT NULL
    EXEC sp_rename 'dbo.Descuento_Nuevo', 'Descuento';

PRINT 'Paso 6 ✓ — Tablas renombradas.';
GO

-- ================================================================
-- PASO 7: RECREAR TRIGGERS EN LAS TABLAS DEFINITIVAS
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

-- (La tabla pivot no tiene FechaActualizacion; no se necesita trigger.)

PRINT 'Paso 7 ✓ — Triggers recreados.';
GO

-- ================================================================
-- PASO 8: ELIMINAR ClienteID DE COMPANIA Y TABLA CLIENTE
-- El nombre del FK lo genera Prisma dinámicamente, así que lo
-- buscamos en sys.foreign_keys en lugar de asumir un nombre fijo.
-- ================================================================
BEGIN TRAN

    -- 1. Eliminar FK Compania → Cliente (nombre generado por Prisma)
    DECLARE @fkName NVARCHAR(256);
    SELECT @fkName = fk.name
    FROM   sys.foreign_keys      fk
    JOIN   sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    JOIN   sys.columns             c   ON c.object_id = fkc.parent_object_id
                                      AND c.column_id  = fkc.parent_column_id
    WHERE  fk.parent_object_id  = OBJECT_ID('dbo.Compania')
      AND  c.name               = 'ClienteID';

    IF @fkName IS NOT NULL
        EXEC('ALTER TABLE dbo.Compania DROP CONSTRAINT [' + @fkName + ']');

    -- 2. Eliminar índice sobre la columna (si existe)
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Compania') AND name = 'IX_Compania_ClienteID')
        DROP INDEX IX_Compania_ClienteID ON dbo.Compania;

    -- 3. Eliminar la columna
    ALTER TABLE dbo.Compania DROP COLUMN ClienteID;

    -- 4. Eliminar trigger de Cliente (si existe)
    IF OBJECT_ID('dbo.trg_Cliente_Upd', 'TR') IS NOT NULL
        DROP TRIGGER dbo.trg_Cliente_Upd;

    -- 5. Eliminar tabla Cliente
    DROP TABLE dbo.Cliente;

COMMIT
PRINT 'Paso 8 ✓ — Columna ClienteID y tabla Cliente eliminadas.';
GO

-- ================================================================
-- PASO 9: LIMPIAR TABLAS TEMPORALES _Old
-- (solo ejecutar DESPUÉS de verificar que todo funciona correctamente)
-- ================================================================
-- DROP TABLE dbo.Ingreso_Old;
-- DROP TABLE dbo.Descuento_Old;
-- Las tablas BAK_ pueden eliminarse tras confirmar producción:
-- DROP TABLE dbo.BAK_Ingreso;
-- DROP TABLE dbo.BAK_Descuento;
-- DROP TABLE dbo.BAK_Compania;
-- DROP TABLE dbo.BAK_Cliente;
-- GO

-- ================================================================
-- ANALYTICS VIEW — Ranking de uso por Ingreso y Descuento
-- ================================================================
CREATE OR ALTER VIEW dbo.vw_Ranking_Ingresos AS
SELECT
    i.ID,
    i.Descripcion,
    ti.Descripcion  AS TipoIngreso,
    COUNT(ci.CompaniaID) AS TotalCompanias,
    SUM(CASE WHEN ci.Activo = 1 THEN 1 ELSE 0 END) AS CompaniasActivas
FROM dbo.Ingreso i
LEFT JOIN dbo.TipoIngreso ti ON ti.ID = i.TipoIngresoID
LEFT JOIN dbo.Compania_Ingreso ci ON ci.IngresoID = i.ID
GROUP BY i.ID, i.Descripcion, ti.Descripcion;
GO

CREATE OR ALTER VIEW dbo.vw_Ranking_Descuentos AS
SELECT
    d.ID,
    d.Descripcion,
    td.Descripcion  AS TipoDescuento,
    COUNT(cd.CompaniaID) AS TotalCompanias,
    SUM(CASE WHEN cd.Activo = 1 THEN 1 ELSE 0 END) AS CompaniasActivas
FROM dbo.Descuento d
LEFT JOIN dbo.TipoDescuento td ON td.ID = d.TipoDescuentoID
LEFT JOIN dbo.Compania_Descuento cd ON cd.DescuentoID = d.ID
GROUP BY d.ID, d.Descripcion, td.Descripcion;
GO

PRINT '✅ Migración V2 completada. Verifica los BAK_ antes de limpiarlos.';
GO
