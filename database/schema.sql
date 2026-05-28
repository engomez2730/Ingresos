-- =============================================================
-- SPN INGRESOS — Schema DDL para SQL Server
-- =============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SPN_INGRESOS')
    CREATE DATABASE SPN_INGRESOS COLLATE Latin1_General_CI_AS;
GO

USE SPN_INGRESOS;
GO

-- =============================================================
-- LIMPIEZA (re-ejecución segura)
-- =============================================================
IF OBJECT_ID('dbo.trg_Ingreso_Upd',      'TR') IS NOT NULL DROP TRIGGER dbo.trg_Ingreso_Upd;
IF OBJECT_ID('dbo.trg_Descuento_Upd',    'TR') IS NOT NULL DROP TRIGGER dbo.trg_Descuento_Upd;
IF OBJECT_ID('dbo.trg_Compania_Upd',     'TR') IS NOT NULL DROP TRIGGER dbo.trg_Compania_Upd;
IF OBJECT_ID('dbo.trg_Cliente_Upd',      'TR') IS NOT NULL DROP TRIGGER dbo.trg_Cliente_Upd;
IF OBJECT_ID('dbo.trg_ConceptoNomina_Upd','TR') IS NOT NULL DROP TRIGGER dbo.trg_ConceptoNomina_Upd;
IF OBJECT_ID('dbo.Ingreso',              'U')  IS NOT NULL DROP TABLE dbo.Ingreso;
IF OBJECT_ID('dbo.Descuento',            'U')  IS NOT NULL DROP TABLE dbo.Descuento;
IF OBJECT_ID('dbo.ConceptoNomina',       'U')  IS NOT NULL DROP TABLE dbo.ConceptoNomina;
IF OBJECT_ID('dbo.Compania',             'U')  IS NOT NULL DROP TABLE dbo.Compania;
IF OBJECT_ID('dbo.Cliente',              'U')  IS NOT NULL DROP TABLE dbo.Cliente;
GO

-- =============================================================
-- TABLA: Cliente
-- =============================================================
CREATE TABLE dbo.Cliente (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    Nombre              NVARCHAR(200)               NOT NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Cliente PRIMARY KEY CLUSTERED (ID)
);
GO

-- =============================================================
-- TABLA: Compania
-- =============================================================
CREATE TABLE dbo.Compania (
    ID                  INT            IDENTITY(1,1) NOT NULL,
    ClienteID           INT                          NOT NULL,
    Descripcion         NVARCHAR(300)                NOT NULL,
    SucursalPrincipal   NVARCHAR(300)                NULL,
    Latitud             DECIMAL(10,8)                NULL,
    Longitud            DECIMAL(11,8)                NULL,
    TipoEmpresa         NVARCHAR(100)                NULL,
    FechaCreacion       DATETIME2      DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2      DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Compania         PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT FK_Compania_Cliente FOREIGN KEY (ClienteID)
        REFERENCES dbo.Cliente (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO
CREATE INDEX IX_Compania_ClienteID ON dbo.Compania (ClienteID);
GO

-- =============================================================
-- TABLA: Ingreso
-- =============================================================
CREATE TABLE dbo.Ingreso (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    CompaniaID          INT                         NOT NULL,
    Descripcion         NVARCHAR(400)               NOT NULL,
    -- 1 = Activo | 0 = Inactivo
    Estado              BIT           DEFAULT 1     NOT NULL,
    Observaciones       NVARCHAR(MAX)               NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Ingreso           PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT FK_Ingreso_Compania  FOREIGN KEY (CompaniaID)
        REFERENCES dbo.Compania (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO
CREATE INDEX IX_Ingreso_CompaniaID ON dbo.Ingreso (CompaniaID);
CREATE INDEX IX_Ingreso_Estado     ON dbo.Ingreso (Estado);
GO

-- =============================================================
-- TABLA: Descuento
-- =============================================================
CREATE TABLE dbo.Descuento (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    CompaniaID          INT                         NOT NULL,
    Descripcion         NVARCHAR(400)               NOT NULL,
    -- 1 = Activo | 0 = Inactivo
    Estado              BIT           DEFAULT 1     NOT NULL,
    Observaciones       NVARCHAR(MAX)               NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Descuento           PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT FK_Descuento_Compania  FOREIGN KEY (CompaniaID)
        REFERENCES dbo.Compania (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO
CREATE INDEX IX_Descuento_CompaniaID ON dbo.Descuento (CompaniaID);
CREATE INDEX IX_Descuento_Estado     ON dbo.Descuento (Estado);
GO

-- =============================================================
-- TRIGGERS — FechaActualizacion automática
-- =============================================================
CREATE OR ALTER TRIGGER trg_Cliente_Upd ON dbo.Cliente AFTER UPDATE AS
BEGIN
    UPDATE dbo.Cliente SET FechaActualizacion = GETDATE()
    FROM dbo.Cliente c INNER JOIN inserted i ON c.ID = i.ID;
END;
GO

CREATE OR ALTER TRIGGER trg_Compania_Upd ON dbo.Compania AFTER UPDATE AS
BEGIN
    UPDATE dbo.Compania SET FechaActualizacion = GETDATE()
    FROM dbo.Compania c INNER JOIN inserted i ON c.ID = i.ID;
END;
GO

CREATE OR ALTER TRIGGER trg_Ingreso_Upd ON dbo.Ingreso AFTER UPDATE AS
BEGIN
    UPDATE dbo.Ingreso SET FechaActualizacion = GETDATE()
    FROM dbo.Ingreso ing INNER JOIN inserted i ON ing.ID = i.ID;
END;
GO

CREATE OR ALTER TRIGGER trg_Descuento_Upd ON dbo.Descuento AFTER UPDATE AS
BEGIN
    UPDATE dbo.Descuento SET FechaActualizacion = GETDATE()
    FROM dbo.Descuento d INNER JOIN inserted i ON d.ID = i.ID;
END;
GO

-- =============================================================
-- DATOS DE PRUEBA
-- =============================================================
INSERT INTO dbo.Cliente (Nombre) VALUES
    ('Grupo Empresarial Andina'),
    ('Corporacion Pacífico S.A.');

INSERT INTO dbo.Compania (ClienteID, Descripcion, SucursalPrincipal, TipoEmpresa) VALUES
    (1, 'Andina Logística Ltda.',  'Bogotá - Sede Principal',  'LTDA'),
    (1, 'Andina Retail S.A.S.',    'Medellín - CC El Tesoro',  'S.A.S.'),
    (2, 'Pacífico Servicios S.A.', 'Cali - Torre Empresarial', 'S.A.');

-- Ingresos
INSERT INTO dbo.Ingreso (CompaniaID, Descripcion, Estado) VALUES
    (1, 'Salario Básico',        1),
    (1, 'Auxilio de Transporte', 1),
    (1, 'Prima de Servicios',    1),
    (2, 'Salario Básico',        1),
    (2, 'Comisiones por Ventas', 1),
    (3, 'Salario Básico',        1),
    (3, 'Bono de Desempeño',     1);

-- Descuentos
INSERT INTO dbo.Descuento (CompaniaID, Descripcion, Estado) VALUES
    (1, 'Seguridad Social (Empleado)', 1),
    (1, 'Retención en la Fuente',      1),
    (1, 'Fondo de Pensiones',          1),
    (2, 'Seguridad Social (Empleado)', 1),
    (2, 'Fondo de Pensiones',          1),
    (3, 'Retención en la Fuente',      1);
GO

PRINT 'Schema SPN_INGRESOS creado exitosamente con tablas Ingreso y Descuento.';
