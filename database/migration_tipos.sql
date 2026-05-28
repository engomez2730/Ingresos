-- =============================================================
-- MIGRACIÓN: Tablas de tipos dinámicos
-- Ejecutar sobre BD existente (no borra datos)
-- =============================================================
USE SPN_INGRESOS;
GO

-- ── TipoIngreso ───────────────────────────────────────────────
IF OBJECT_ID('dbo.TipoIngreso', 'U') IS NULL
CREATE TABLE dbo.TipoIngreso (
    ID          INT           IDENTITY(1,1) NOT NULL,
    Descripcion NVARCHAR(200)               NOT NULL,
    Estado      BIT           DEFAULT 1     NOT NULL,
    CONSTRAINT PK_TipoIngreso PRIMARY KEY CLUSTERED (ID)
);
GO

-- ── TipoDescuento ─────────────────────────────────────────────
IF OBJECT_ID('dbo.TipoDescuento', 'U') IS NULL
CREATE TABLE dbo.TipoDescuento (
    ID          INT           IDENTITY(1,1) NOT NULL,
    Descripcion NVARCHAR(200)               NOT NULL,
    Estado      BIT           DEFAULT 1     NOT NULL,
    CONSTRAINT PK_TipoDescuento PRIMARY KEY CLUSTERED (ID)
);
GO

-- ── TipoCompania ──────────────────────────────────────────────
IF OBJECT_ID('dbo.TipoCompania', 'U') IS NULL
CREATE TABLE dbo.TipoCompania (
    ID          INT           IDENTITY(1,1) NOT NULL,
    Descripcion NVARCHAR(100)               NOT NULL,
    Estado      BIT           DEFAULT 1     NOT NULL,
    CONSTRAINT PK_TipoCompania PRIMARY KEY CLUSTERED (ID)
);
GO

-- ── Seeds ─────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.TipoCompania)
INSERT INTO dbo.TipoCompania (Descripcion) VALUES
    ('S.A.'), ('S.A.S.'), ('LTDA'), ('E.U.'), ('S.C.A.');

IF NOT EXISTS (SELECT 1 FROM dbo.TipoIngreso)
INSERT INTO dbo.TipoIngreso (Descripcion) VALUES
    ('Salarial'), ('Prestacional'), ('Comisiones'),
    ('Bonificaciones'), ('Horas Extra'), ('Subsidios');

IF NOT EXISTS (SELECT 1 FROM dbo.TipoDescuento)
INSERT INTO dbo.TipoDescuento (Descripcion) VALUES
    ('Seguridad Social'), ('Pensión'), ('Retención en la Fuente'),
    ('Parafiscales'), ('Embargos Judiciales'), ('Préstamos Internos');
GO

-- ── Agregar TipoIngresoID a Ingreso ───────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Ingreso') AND name = 'TipoIngresoID'
)
BEGIN
    ALTER TABLE dbo.Ingreso ADD TipoIngresoID INT NULL;
    ALTER TABLE dbo.Ingreso ADD CONSTRAINT FK_Ingreso_TipoIngreso
        FOREIGN KEY (TipoIngresoID) REFERENCES dbo.TipoIngreso(ID)
        ON DELETE SET NULL ON UPDATE CASCADE;
END;
GO

-- ── Agregar TipoDescuentoID a Descuento ───────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Descuento') AND name = 'TipoDescuentoID'
)
BEGIN
    ALTER TABLE dbo.Descuento ADD TipoDescuentoID INT NULL;
    ALTER TABLE dbo.Descuento ADD CONSTRAINT FK_Descuento_TipoDescuento
        FOREIGN KEY (TipoDescuentoID) REFERENCES dbo.TipoDescuento(ID)
        ON DELETE SET NULL ON UPDATE CASCADE;
END;
GO

-- ── Agregar TipoCompaniaID a Compania ─────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Compania') AND name = 'TipoCompaniaID'
)
BEGIN
    ALTER TABLE dbo.Compania ADD TipoCompaniaID INT NULL;
    ALTER TABLE dbo.Compania ADD CONSTRAINT FK_Compania_TipoCompania
        FOREIGN KEY (TipoCompaniaID) REFERENCES dbo.TipoCompania(ID)
        ON DELETE SET NULL ON UPDATE CASCADE;
END;
GO

-- ── Migrar TipoEmpresa → TipoCompaniaID ───────────────────────
UPDATE c
SET    c.TipoCompaniaID = tc.ID
FROM   dbo.Compania c
INNER  JOIN dbo.TipoCompania tc ON c.TipoEmpresa = tc.Descripcion
WHERE  c.TipoCompaniaID IS NULL;
GO

PRINT 'Migración de tipos completada exitosamente.';
