-- ================================================================
-- SPN INGRESOS — Schema V2 (estructura final normalizada)
-- Sin datos de prueba. Ejecutar desde master.
-- ================================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'SPN_INGRESOS')
BEGIN
    ALTER DATABASE SPN_INGRESOS SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SPN_INGRESOS;
END
GO

CREATE DATABASE SPN_INGRESOS COLLATE Latin1_General_CI_AS;
GO

USE SPN_INGRESOS;
GO

-- ================================================================
-- CATÁLOGOS DE TIPOS
-- ================================================================
CREATE TABLE dbo.TipoCompania (
    ID           INT           IDENTITY(1,1) NOT NULL,
    Descripcion  NVARCHAR(100)               NOT NULL,
    Estado       BIT           DEFAULT 1     NOT NULL,
    CONSTRAINT PK_TipoCompania PRIMARY KEY CLUSTERED (ID)
);
GO

CREATE TABLE dbo.TipoIngreso (
    ID           INT           IDENTITY(1,1) NOT NULL,
    Descripcion  NVARCHAR(200)               NOT NULL,
    Estado       BIT           DEFAULT 1     NOT NULL,
    CONSTRAINT PK_TipoIngreso PRIMARY KEY CLUSTERED (ID)
);
GO

CREATE TABLE dbo.TipoDescuento (
    ID           INT           IDENTITY(1,1) NOT NULL,
    Descripcion  NVARCHAR(200)               NOT NULL,
    Estado       BIT           DEFAULT 1     NOT NULL,
    CONSTRAINT PK_TipoDescuento PRIMARY KEY CLUSTERED (ID)
);
GO

-- ================================================================
-- COMPANIA (entidad raíz — sin ClienteID)
-- ================================================================
CREATE TABLE dbo.Compania (
    ID                  INT            IDENTITY(1,1) NOT NULL,
    Descripcion         NVARCHAR(300)                NOT NULL,
    SucursalPrincipal   NVARCHAR(300)                NULL,
    Latitud             DECIMAL(10,8)                NULL,
    Longitud            DECIMAL(11,8)                NULL,
    TipoEmpresa         NVARCHAR(100)                NULL,
    TipoCompaniaID      INT                          NULL,
    FechaCreacion       DATETIME2      DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2      DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Compania           PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT FK_Compania_TipoCia   FOREIGN KEY (TipoCompaniaID)
        REFERENCES dbo.TipoCompania (ID) ON DELETE SET NULL ON UPDATE CASCADE
);
GO
CREATE INDEX IX_Compania_TipoCompaniaID ON dbo.Compania (TipoCompaniaID);
GO

-- ================================================================
-- CATÁLOGO MAESTRO DE INGRESOS (sin CompaniaID)
-- ================================================================
CREATE TABLE dbo.Ingreso (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    TipoIngresoID       INT                         NULL,
    Descripcion         NVARCHAR(400)               NOT NULL,
    Estado              BIT           DEFAULT 1     NOT NULL,
    Observaciones       NVARCHAR(MAX)               NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Ingreso           PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT UQ_Ingreso_Desc_Tipo UNIQUE (Descripcion, TipoIngresoID),
    CONSTRAINT FK_Ingreso_Tipo      FOREIGN KEY (TipoIngresoID)
        REFERENCES dbo.TipoIngreso (ID) ON DELETE SET NULL ON UPDATE CASCADE
);
GO
CREATE INDEX IX_Ingreso_TipoIngresoID ON dbo.Ingreso (TipoIngresoID);
CREATE INDEX IX_Ingreso_Estado        ON dbo.Ingreso (Estado);
GO

-- ================================================================
-- CATÁLOGO MAESTRO DE DESCUENTOS (sin CompaniaID)
-- ================================================================
CREATE TABLE dbo.Descuento (
    ID                  INT           IDENTITY(1,1) NOT NULL,
    TipoDescuentoID     INT                         NULL,
    Descripcion         NVARCHAR(400)               NOT NULL,
    Estado              BIT           DEFAULT 1     NOT NULL,
    Observaciones       NVARCHAR(MAX)               NULL,
    FechaCreacion       DATETIME2     DEFAULT GETDATE() NOT NULL,
    FechaActualizacion  DATETIME2     DEFAULT GETDATE() NOT NULL,
    CONSTRAINT PK_Descuento           PRIMARY KEY CLUSTERED (ID),
    CONSTRAINT UQ_Descuento_Desc_Tipo UNIQUE (Descripcion, TipoDescuentoID),
    CONSTRAINT FK_Descuento_Tipo      FOREIGN KEY (TipoDescuentoID)
        REFERENCES dbo.TipoDescuento (ID) ON DELETE SET NULL ON UPDATE CASCADE
);
GO
CREATE INDEX IX_Descuento_TipoDescuentoID ON dbo.Descuento (TipoDescuentoID);
CREATE INDEX IX_Descuento_Estado          ON dbo.Descuento (Estado);
GO

-- ================================================================
-- TABLAS PUENTE N:M
-- ================================================================
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
        REFERENCES dbo.Ingreso (ID) ON DELETE CASCADE ON UPDATE CASCADE
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
        REFERENCES dbo.Descuento (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO
CREATE INDEX IX_CD_CompaniaID  ON dbo.Compania_Descuento (CompaniaID);
CREATE INDEX IX_CD_DescuentoID ON dbo.Compania_Descuento (DescuentoID);
GO

-- ================================================================
-- TRIGGERS — FechaActualizacion automática
-- ================================================================
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

-- ================================================================
-- ANALYTICS VIEWS
-- ================================================================
CREATE OR ALTER VIEW dbo.vw_Ranking_Ingresos AS
SELECT
    i.ID,
    i.Descripcion,
    ti.Descripcion                                        AS TipoIngreso,
    COUNT(ci.CompaniaID)                                  AS TotalCompanias,
    SUM(CASE WHEN ci.Activo = 1 THEN 1 ELSE 0 END)       AS CompaniasActivas
FROM dbo.Ingreso i
LEFT JOIN dbo.TipoIngreso        ti ON ti.ID = i.TipoIngresoID
LEFT JOIN dbo.Compania_Ingreso   ci ON ci.IngresoID = i.ID
GROUP BY i.ID, i.Descripcion, ti.Descripcion;
GO

CREATE OR ALTER VIEW dbo.vw_Ranking_Descuentos AS
SELECT
    d.ID,
    d.Descripcion,
    td.Descripcion                                        AS TipoDescuento,
    COUNT(cd.CompaniaID)                                  AS TotalCompanias,
    SUM(CASE WHEN cd.Activo = 1 THEN 1 ELSE 0 END)       AS CompaniasActivas
FROM dbo.Descuento d
LEFT JOIN dbo.TipoDescuento      td ON td.ID = d.TipoDescuentoID
LEFT JOIN dbo.Compania_Descuento cd ON cd.DescuentoID = d.ID
GROUP BY d.ID, d.Descripcion, td.Descripcion;
GO

PRINT '✅ SPN_INGRESOS creada exitosamente (estructura V2, sin datos).';
GO
