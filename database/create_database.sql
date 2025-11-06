-- =============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Gestión de Restaurante "ABOCADO"
-- SQL Server 2019+
-- =============================================

-- =============================================
-- 1. CREAR BASE DE DATOS
-- =============================================

USE master;
GO

-- Eliminar base de datos si existe (solo para desarrollo)
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'AbocadoRestaurant')
BEGIN
    ALTER DATABASE AbocadoRestaurant SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AbocadoRestaurant;
END
GO

-- Crear base de datos
CREATE DATABASE AbocadoRestaurant
    COLLATE Modern_Spanish_CI_AS;
GO

USE AbocadoRestaurant;
GO

PRINT 'Base de datos AbocadoRestaurant creada exitosamente';
GO

-- =============================================
-- 2. CREAR TABLAS PRINCIPALES
-- =============================================

-- ---------------------------------------------
-- Tabla: Dishes (Platos del Menú)
-- ---------------------------------------------
CREATE TABLE Dishes (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category NVARCHAR(20) NOT NULL CHECK (category IN ('principal', 'lado', 'bebida', 'postre')),
    prepTime INT NOT NULL CHECK (prepTime > 0 AND prepTime <= 240),
    image NVARCHAR(500),
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Tabla Dishes creada';
GO

-- ---------------------------------------------
-- Tabla: Tables (Mesas del Restaurante)
-- ---------------------------------------------
CREATE TABLE Tables (
    id NVARCHAR(50) PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 20),
    status NVARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
    currentOrderId NVARCHAR(50) NULL,
    partySize INT NULL CHECK (partySize >= 0),
    section NVARCHAR(50) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Tabla Tables creada';
GO

-- ---------------------------------------------
-- Tabla: Users (Usuarios del Sistema)
-- ---------------------------------------------
CREATE TABLE Users (
    id NVARCHAR(50) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    fullName NVARCHAR(200) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('chef', 'waiter', 'manager')),
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    lastLogin DATETIME2 NULL
);
GO

PRINT 'Tabla Users creada';
GO

-- ---------------------------------------------
-- Tabla: Orders (Órdenes/Pedidos)
-- ---------------------------------------------
CREATE TABLE Orders (
    id NVARCHAR(50) PRIMARY KEY,
    tableId NVARCHAR(50) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    -- ✅ NORMALIZADO 3NF: tax y total son COMPUTED COLUMNS (eliminan dependencias transitivas)
    tax AS (subtotal * 0.10) PERSISTED,
    total AS ((subtotal - discount) * 1.10) PERSISTED,
    customerName NVARCHAR(200) NULL,
    customerPhone NVARCHAR(20) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    completedAt DATETIME2 NULL,
    cancelledAt DATETIME2 NULL,
    createdBy NVARCHAR(50) NULL,

    CONSTRAINT FK_Orders_Tables FOREIGN KEY (tableId) REFERENCES Tables(id),
    CONSTRAINT FK_Orders_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id)
);
GO

PRINT 'Tabla Orders creada';
GO

-- Agregar FK de currentOrderId en Tables después de crear Orders
ALTER TABLE Tables
ADD CONSTRAINT FK_Tables_CurrentOrder
FOREIGN KEY (currentOrderId) REFERENCES Orders(id);
GO

-- ---------------------------------------------
-- Tabla: OrderItems (Items de las Órdenes)
-- ---------------------------------------------
CREATE TABLE OrderItems (
    id NVARCHAR(50) PRIMARY KEY,
    orderId NVARCHAR(50) NOT NULL,
    dishId NVARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    notes NVARCHAR(1000) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready')),
    unitPrice DECIMAL(10,2) NOT NULL CHECK (unitPrice > 0),
    totalPrice AS (quantity * unitPrice) PERSISTED,
    startedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    preparedBy NVARCHAR(50) NULL,

    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Dishes FOREIGN KEY (dishId) REFERENCES Dishes(id),
    CONSTRAINT FK_OrderItems_PreparedBy FOREIGN KEY (preparedBy) REFERENCES Users(id)
);
GO

PRINT 'Tabla OrderItems creada';
GO

-- ---------------------------------------------
-- Tabla: Payments (Pagos)
-- ---------------------------------------------
CREATE TABLE Payments (
    id NVARCHAR(50) PRIMARY KEY,
    orderId NVARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    method NVARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'transfer')),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    transactionId NVARCHAR(200) NULL,
    tip DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tip >= 0),
    processedAt DATETIME2 NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    processedBy NVARCHAR(50) NULL,

    CONSTRAINT FK_Payments_Orders FOREIGN KEY (orderId) REFERENCES Orders(id),
    CONSTRAINT FK_Payments_ProcessedBy FOREIGN KEY (processedBy) REFERENCES Users(id)
);
GO

PRINT 'Tabla Payments creada';
GO

-- ---------------------------------------------
-- Tabla: Reservations (Reservas)
-- ---------------------------------------------
CREATE TABLE Reservations (
    id NVARCHAR(50) PRIMARY KEY,
    tableId NVARCHAR(50) NOT NULL,
    customerName NVARCHAR(200) NOT NULL,
    customerPhone NVARCHAR(20) NOT NULL,
    customerEmail NVARCHAR(255) NULL,
    partySize INT NOT NULL CHECK (partySize > 0),
    reservationDate DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes NVARCHAR(1000) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy NVARCHAR(50) NULL,

    CONSTRAINT FK_Reservations_Tables FOREIGN KEY (tableId) REFERENCES Tables(id),
    CONSTRAINT FK_Reservations_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id)
);
GO

PRINT 'Tabla Reservations creada';
GO

-- ---------------------------------------------
-- Tabla: AuditLog (Registro de Auditoría)
-- ---------------------------------------------
CREATE TABLE AuditLog (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    userId NVARCHAR(50) NULL,
    tableName NVARCHAR(100) NOT NULL,
    recordId NVARCHAR(50) NOT NULL,
    action NVARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    oldValue NVARCHAR(MAX) NULL,
    newValue NVARCHAR(MAX) NULL,
    timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_AuditLog_Users FOREIGN KEY (userId) REFERENCES Users(id)
);
GO

PRINT 'Tabla AuditLog creada';
GO

-- =============================================
-- 3. CREAR ÍNDICES
-- =============================================

-- Índices para Dishes
CREATE INDEX IX_Dishes_Category ON Dishes(category);
CREATE INDEX IX_Dishes_IsActive ON Dishes(isActive);
CREATE INDEX IX_Dishes_Price ON Dishes(price);
GO

-- Índices para Tables
CREATE INDEX IX_Tables_Status ON Tables(status);
CREATE INDEX IX_Tables_Number ON Tables(number);
CREATE INDEX IX_Tables_Section ON Tables(section);
GO

-- Índices para Users
CREATE INDEX IX_Users_Username ON Users(username);
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);
CREATE INDEX IX_Users_IsActive ON Users(isActive);
GO

-- Índices para Orders
CREATE INDEX IX_Orders_TableId ON Orders(tableId);
CREATE INDEX IX_Orders_Status ON Orders(status);
CREATE INDEX IX_Orders_CreatedAt ON Orders(createdAt DESC);
CREATE INDEX IX_Orders_TableId_Status ON Orders(tableId, status);
CREATE INDEX IX_Orders_Status_CreatedAt ON Orders(status, createdAt DESC);
CREATE INDEX IX_Orders_CompletedAt ON Orders(completedAt) WHERE completedAt IS NOT NULL;
GO

-- Índices para OrderItems
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(orderId);
CREATE INDEX IX_OrderItems_DishId ON OrderItems(dishId);
CREATE INDEX IX_OrderItems_Status ON OrderItems(status);
CREATE INDEX IX_OrderItems_OrderId_Status ON OrderItems(orderId, status);
CREATE INDEX IX_OrderItems_DishId_CreatedAt ON OrderItems(dishId, createdAt);
GO

-- Índices para Payments
CREATE INDEX IX_Payments_OrderId ON Payments(orderId);
CREATE INDEX IX_Payments_Status ON Payments(status);
CREATE INDEX IX_Payments_Method ON Payments(method);
CREATE INDEX IX_Payments_CreatedAt ON Payments(createdAt DESC);
GO

-- Índices para Reservations
CREATE INDEX IX_Reservations_TableId ON Reservations(tableId);
CREATE INDEX IX_Reservations_Status ON Reservations(status);
CREATE INDEX IX_Reservations_ReservationDate ON Reservations(reservationDate);
CREATE INDEX IX_Reservations_CustomerPhone ON Reservations(customerPhone);
GO

-- Índices para AuditLog
CREATE INDEX IX_AuditLog_TableName ON AuditLog(tableName);
CREATE INDEX IX_AuditLog_RecordId ON AuditLog(recordId);
CREATE INDEX IX_AuditLog_Timestamp ON AuditLog(timestamp DESC);
CREATE INDEX IX_AuditLog_UserId ON AuditLog(userId);
GO

PRINT 'Índices creados exitosamente';
GO

-- =============================================
-- 4. CREAR TRIGGERS
-- =============================================

-- ---------------------------------------------
-- Trigger: Actualizar subtotal de Order al modificar OrderItems
-- ✅ NORMALIZADO 3NF: Solo actualiza subtotal, tax y total se calculan automáticamente
-- ---------------------------------------------
CREATE TRIGGER TR_UpdateOrderSubtotal
ON OrderItems
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Actualizar solo subtotal (tax y total se calculan automáticamente como COMPUTED COLUMNS)
    UPDATE o
    SET
        subtotal = ISNULL((SELECT SUM(totalPrice) FROM OrderItems WHERE orderId = o.id), 0)
    FROM Orders o
    WHERE o.id IN (
        SELECT DISTINCT orderId FROM inserted
        UNION
        SELECT DISTINCT orderId FROM deleted
    );
END;
GO

PRINT 'Trigger TR_UpdateOrderSubtotal creado';
GO

-- ---------------------------------------------
-- Trigger: Actualizar updatedAt automáticamente
-- ---------------------------------------------
CREATE TRIGGER TR_Dishes_UpdatedAt ON Dishes AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Dishes SET updatedAt = GETDATE() WHERE id IN (SELECT DISTINCT id FROM inserted);
END;
GO

CREATE TRIGGER TR_Tables_UpdatedAt ON Tables AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Tables SET updatedAt = GETDATE() WHERE id IN (SELECT DISTINCT id FROM inserted);
END;
GO

CREATE TRIGGER TR_Users_UpdatedAt ON Users AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET updatedAt = GETDATE() WHERE id IN (SELECT DISTINCT id FROM inserted);
END;
GO

PRINT 'Triggers de updatedAt creados';
GO

-- =============================================
-- 5. CREAR STORED PROCEDURES
-- =============================================

-- ---------------------------------------------
-- SP: Completar orden y procesar pago
-- ---------------------------------------------
CREATE PROCEDURE sp_CompleteOrder
    @orderId NVARCHAR(50),
    @paymentMethod NVARCHAR(50),
    @tip DECIMAL(10,2) = 0,
    @processedBy NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @tableId NVARCHAR(50);
        DECLARE @total DECIMAL(10,2);
        DECLARE @orderStatus NVARCHAR(20);

        -- Validar que la orden existe y está activa
        SELECT @tableId = tableId, @total = total, @orderStatus = status
        FROM Orders
        WHERE id = @orderId;

        IF @tableId IS NULL
        BEGIN
            THROW 50001, 'Orden no encontrada', 1;
        END;

        IF @orderStatus != 'active'
        BEGIN
            THROW 50002, 'La orden no está activa', 1;
        END;

        -- Verificar que todos los items estén listos
        IF EXISTS (SELECT 1 FROM OrderItems WHERE orderId = @orderId AND status != 'ready')
        BEGIN
            THROW 50003, 'No todos los items están listos', 1;
        END;

        -- Completar orden
        UPDATE Orders
        SET status = 'completed', completedAt = GETDATE()
        WHERE id = @orderId;

        -- Liberar mesa
        UPDATE Tables
        SET status = 'available', currentOrderId = NULL, partySize = NULL
        WHERE id = @tableId;

        -- Crear registro de pago
        DECLARE @paymentId NVARCHAR(50) = CAST(NEWID() AS NVARCHAR(50));
        INSERT INTO Payments (id, orderId, amount, method, status, tip, processedAt, createdAt, processedBy)
        VALUES (@paymentId, @orderId, @total, @paymentMethod, 'completed', @tip, GETDATE(), GETDATE(), @processedBy);

        COMMIT TRANSACTION;

        SELECT 'Orden completada exitosamente' AS Message, @paymentId AS PaymentId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT 'Stored Procedure sp_CompleteOrder creado';
GO

-- ---------------------------------------------
-- SP: Cancelar orden
-- ---------------------------------------------
CREATE PROCEDURE sp_CancelOrder
    @orderId NVARCHAR(50),
    @reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @tableId NVARCHAR(50);
        DECLARE @orderStatus NVARCHAR(20);

        -- Validar que la orden existe
        SELECT @tableId = tableId, @orderStatus = status
        FROM Orders
        WHERE id = @orderId;

        IF @tableId IS NULL
        BEGIN
            THROW 50001, 'Orden no encontrada', 1;
        END;

        IF @orderStatus = 'completed'
        BEGIN
            THROW 50004, 'No se puede cancelar una orden completada', 1;
        END;

        -- Cancelar orden
        UPDATE Orders
        SET status = 'cancelled', cancelledAt = GETDATE()
        WHERE id = @orderId;

        -- Liberar mesa si estaba ocupada
        UPDATE Tables
        SET status = 'available', currentOrderId = NULL, partySize = NULL
        WHERE id = @tableId AND currentOrderId = @orderId;

        COMMIT TRANSACTION;

        SELECT 'Orden cancelada exitosamente' AS Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT 'Stored Procedure sp_CancelOrder creado';
GO

-- ---------------------------------------------
-- SP: Crear nueva orden
-- ---------------------------------------------
CREATE PROCEDURE sp_CreateOrder
    @tableId NVARCHAR(50),
    @partySize INT,
    @customerName NVARCHAR(200) = NULL,
    @createdBy NVARCHAR(50) = NULL,
    @orderId NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @tableStatus NVARCHAR(20);
        DECLARE @currentOrder NVARCHAR(50);

        -- Validar que la mesa existe y está disponible
        SELECT @tableStatus = status, @currentOrder = currentOrderId
        FROM Tables
        WHERE id = @tableId;

        IF @tableStatus IS NULL
        BEGIN
            THROW 50005, 'Mesa no encontrada', 1;
        END;

        IF @currentOrder IS NOT NULL
        BEGIN
            THROW 50006, 'La mesa ya tiene una orden activa', 1;
        END;

        -- Crear orden
        SET @orderId = CAST(NEWID() AS NVARCHAR(50));

        -- ✅ NORMALIZADO 3NF: tax y total se calculan automáticamente, no se insertan
        INSERT INTO Orders (id, tableId, status, subtotal, discount, customerName, createdAt, createdBy)
        VALUES (@orderId, @tableId, 'active', 0, 0, @customerName, GETDATE(), @createdBy);

        -- Actualizar mesa
        UPDATE Tables
        SET status = 'occupied', currentOrderId = @orderId, partySize = @partySize
        WHERE id = @tableId;

        COMMIT TRANSACTION;

        SELECT 'Orden creada exitosamente' AS Message, @orderId AS OrderId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT 'Stored Procedure sp_CreateOrder creado';
GO

-- ---------------------------------------------
-- SP: Obtener estadísticas del dashboard
-- ---------------------------------------------
CREATE PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        -- Estadísticas de mesas
        (SELECT COUNT(*) FROM Tables WHERE status = 'occupied') AS TablesOccupied,
        (SELECT COUNT(*) FROM Tables WHERE isActive = 1) AS TotalTables,
        (SELECT COUNT(*) FROM Tables WHERE status = 'available') AS TablesAvailable,

        -- Estadísticas de items en cocina
        (SELECT COUNT(*) FROM OrderItems oi INNER JOIN Orders o ON oi.orderId = o.id WHERE o.status = 'active' AND oi.status = 'pending') AS ItemsPending,
        (SELECT COUNT(*) FROM OrderItems oi INNER JOIN Orders o ON oi.orderId = o.id WHERE o.status = 'active' AND oi.status = 'preparing') AS ItemsPreparing,
        (SELECT COUNT(*) FROM OrderItems oi INNER JOIN Orders o ON oi.orderId = o.id WHERE o.status = 'active' AND oi.status = 'ready') AS ItemsReady,

        -- Estadísticas de órdenes
        (SELECT COUNT(*) FROM Orders WHERE status = 'active') AS ActiveOrders,
        (SELECT ISNULL(SUM(total), 0) FROM Orders WHERE status = 'active') AS ActiveOrdersTotal,

        -- Ingresos del día
        (SELECT ISNULL(SUM(amount + tip), 0) FROM Payments WHERE CAST(processedAt AS DATE) = CAST(GETDATE() AS DATE) AND status = 'completed') AS TodayRevenue,
        (SELECT COUNT(*) FROM Orders WHERE CAST(completedAt AS DATE) = CAST(GETDATE() AS DATE)) AS TodayCompletedOrders;
END;
GO

PRINT 'Stored Procedure sp_GetDashboardStats creado';
GO

-- =============================================
-- 6. CREAR VISTAS
-- =============================================

-- ---------------------------------------------
-- Vista: Resumen de órdenes activas
-- ---------------------------------------------
CREATE VIEW vw_ActiveOrders AS
SELECT
    o.id AS orderId,
    o.tableId,
    t.number AS tableNumber,
    o.total,
    o.createdAt,
    DATEDIFF(MINUTE, o.createdAt, GETDATE()) AS minutesSinceCreated,
    COUNT(oi.id) AS totalItems,
    SUM(CASE WHEN oi.status = 'pending' THEN 1 ELSE 0 END) AS pendingItems,
    SUM(CASE WHEN oi.status = 'preparing' THEN 1 ELSE 0 END) AS preparingItems,
    SUM(CASE WHEN oi.status = 'ready' THEN 1 ELSE 0 END) AS readyItems
FROM Orders o
INNER JOIN Tables t ON o.tableId = t.id
LEFT JOIN OrderItems oi ON o.id = oi.orderId
WHERE o.status = 'active'
GROUP BY o.id, o.tableId, t.number, o.total, o.createdAt;
GO

PRINT 'Vista vw_ActiveOrders creada';
GO

-- ---------------------------------------------
-- Vista: Cola de cocina
-- ---------------------------------------------
CREATE VIEW vw_KitchenQueue AS
SELECT
    oi.id,
    oi.orderId,
    o.tableId,
    t.number AS tableNumber,
    oi.dishId,
    d.name AS dishName,
    d.category AS dishCategory,
    d.prepTime,
    oi.quantity,
    oi.notes,
    oi.status,
    oi.startedAt,
    oi.completedAt,
    oi.createdAt,
    CASE
        WHEN oi.status = 'preparing' AND oi.startedAt IS NOT NULL
        THEN DATEDIFF(MINUTE, oi.startedAt, GETDATE())
        ELSE NULL
    END AS minutesInProgress
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE o.status = 'active';
GO

PRINT 'Vista vw_KitchenQueue creada';
GO

-- ---------------------------------------------
-- Vista: Mesas con detalles de orden
-- ---------------------------------------------
CREATE VIEW vw_TablesWithOrders AS
SELECT
    t.id AS tableId,
    t.number,
    t.capacity,
    t.status,
    t.partySize,
    t.section,
    o.id AS orderId,
    o.total AS orderTotal,
    o.createdAt AS orderCreatedAt,
    DATEDIFF(MINUTE, o.createdAt, GETDATE()) AS orderMinutesActive
FROM Tables t
LEFT JOIN Orders o ON t.currentOrderId = o.id
WHERE t.isActive = 1;
GO

PRINT 'Vista vw_TablesWithOrders creada';
GO

-- ---------------------------------------------
-- Vista: Platos más vendidos
-- ---------------------------------------------
CREATE VIEW vw_TopSellingDishes AS
SELECT
    d.id AS dishId,
    d.name AS dishName,
    d.category,
    d.price,
    COUNT(oi.id) AS totalOrders,
    SUM(oi.quantity) AS totalQuantity,
    SUM(oi.totalPrice) AS totalRevenue
FROM Dishes d
INNER JOIN OrderItems oi ON d.id = oi.dishId
INNER JOIN Orders o ON oi.orderId = o.id
WHERE o.status = 'completed'
GROUP BY d.id, d.name, d.category, d.price;
GO

PRINT 'Vista vw_TopSellingDishes creada';
GO

-- =============================================
-- 7. INSERTAR DATOS INICIALES (SEED DATA)
-- =============================================

PRINT 'Iniciando inserción de datos iniciales...';
GO

-- ---------------------------------------------
-- Usuarios de prueba
-- ---------------------------------------------
-- Nota: Las contraseñas deberían estar hasheadas con bcrypt en producción
-- Contraseña de prueba para todos: "password123"
INSERT INTO Users (id, username, email, passwordHash, fullName, role, isActive, createdAt)
VALUES
    ('user-001', 'admin', 'admin@abocado.com', '$2a$10$XqJy8z8Q5r5xZ7L5K8H5x.5x5x5x5x5x5x5x5x5x5x5x5x5x5x', 'Administrador', 'manager', 1, GETDATE()),
    ('user-002', 'chef1', 'chef@abocado.com', '$2a$10$XqJy8z8Q5r5xZ7L5K8H5x.5x5x5x5x5x5x5x5x5x5x5x5x5x5x', 'Carlos García', 'chef', 1, GETDATE()),
    ('user-003', 'waiter1', 'waiter@abocado.com', '$2a$10$XqJy8z8Q5r5xZ7L5K8H5x.5x5x5x5x5x5x5x5x5x5x5x5x5x5x', 'María López', 'waiter', 1, GETDATE());
GO

PRINT 'Usuarios insertados';
GO

-- ---------------------------------------------
-- Platos del menú (basado en mockData.ts)
-- ---------------------------------------------
INSERT INTO Dishes (id, name, description, price, category, prepTime, image, isActive, createdAt)
VALUES
    -- Principales
    ('dish-001', 'Burger Clásico', 'Burger de carne con queso, lechuga, tomate y salsa especial', 8.99, 'principal', 15, '🍔', 1, GETDATE()),
    ('dish-002', 'Pollo Frito Crujiente', 'Piezas de pollo marinado y frito con especias secretas', 9.99, 'principal', 20, '🍗', 1, GETDATE()),
    ('dish-003', 'Sándwich de Pollo', 'Pechuga de pollo a la parrilla con aguacate y mayonesa', 7.99, 'principal', 12, '🥪', 1, GETDATE()),

    -- Lados
    ('dish-004', 'Papas Fritas', 'Papas cortadas y fritas al punto perfecto', 3.49, 'lado', 8, '🍟', 1, GETDATE()),
    ('dish-005', 'Aros de Cebolla', 'Aros de cebolla empanizados y fritos crujientes', 4.49, 'lado', 10, '🧅', 1, GETDATE()),
    ('dish-006', 'Ensalada Fresca', 'Mix de lechugas, tomate, pepino y aderezo de la casa', 6.99, 'lado', 5, '🥗', 1, GETDATE()),

    -- Bebidas
    ('dish-007', 'Refresco', 'Bebida gaseosa de 500ml', 2.49, 'bebida', 2, '🥤', 1, GETDATE()),
    ('dish-008', 'Jugo Natural', 'Jugo natural de frutas de temporada', 3.99, 'bebida', 3, '🧃', 1, GETDATE()),

    -- Postres
    ('dish-009', 'Helado', 'Helado artesanal de vainilla o chocolate', 3.99, 'postre', 5, '🍨', 1, GETDATE()),
    ('dish-010', 'Tiramisú', 'Postre italiano de café y mascarpone', 5.99, 'postre', 5, '🍰', 1, GETDATE());
GO

PRINT 'Platos insertados';
GO

-- ---------------------------------------------
-- Mesas del restaurante (basado en mockData.ts)
-- ---------------------------------------------
INSERT INTO Tables (id, number, capacity, status, currentOrderId, partySize, section, isActive, createdAt)
VALUES
    ('table-001', 1, 2, 'available', NULL, NULL, 'Principal', 1, GETDATE()),
    ('table-002', 2, 4, 'available', NULL, NULL, 'Principal', 1, GETDATE()),
    ('table-003', 3, 4, 'available', NULL, NULL, 'Principal', 1, GETDATE()),
    ('table-004', 4, 2, 'available', NULL, NULL, 'Terraza', 1, GETDATE()),
    ('table-005', 5, 6, 'available', NULL, NULL, 'Terraza', 1, GETDATE()),
    ('table-006', 6, 4, 'available', NULL, NULL, 'VIP', 1, GETDATE());
GO

PRINT 'Mesas insertadas';
GO

-- ---------------------------------------------
-- Órdenes de ejemplo (opcional - comentado por defecto)
-- ---------------------------------------------
/*
-- Crear orden para mesa 1
DECLARE @order1 NVARCHAR(50);
EXEC sp_CreateOrder
    @tableId = 'table-001',
    @partySize = 2,
    @createdBy = 'user-003',
    @orderId = @order1 OUTPUT;

-- Agregar items a la orden
INSERT INTO OrderItems (id, orderId, dishId, quantity, status, unitPrice, createdAt)
VALUES
    (CAST(NEWID() AS NVARCHAR(50)), @order1, 'dish-001', 2, 'pending', 8.99, GETDATE()),
    (CAST(NEWID() AS NVARCHAR(50)), @order1, 'dish-004', 2, 'pending', 3.49, GETDATE()),
    (CAST(NEWID() AS NVARCHAR(50)), @order1, 'dish-007', 2, 'pending', 2.49, GETDATE());

PRINT 'Orden de ejemplo creada para mesa 1';
GO
*/

-- =============================================
-- 8. INFORMACIÓN FINAL
-- =============================================

PRINT '';
PRINT '=============================================';
PRINT 'BASE DE DATOS CREADA EXITOSAMENTE';
PRINT '=============================================';
PRINT '';
PRINT 'Base de datos: AbocadoRestaurant';
PRINT '';
PRINT 'Tablas creadas:';
PRINT '  - Dishes (10 registros)';
PRINT '  - Tables (6 registros)';
PRINT '  - Users (3 registros)';
PRINT '  - Orders';
PRINT '  - OrderItems';
PRINT '  - Payments';
PRINT '  - Reservations';
PRINT '  - AuditLog';
PRINT '';
PRINT 'Stored Procedures:';
PRINT '  - sp_CompleteOrder';
PRINT '  - sp_CancelOrder';
PRINT '  - sp_CreateOrder';
PRINT '  - sp_GetDashboardStats';
PRINT '';
PRINT 'Vistas:';
PRINT '  - vw_ActiveOrders';
PRINT '  - vw_KitchenQueue';
PRINT '  - vw_TablesWithOrders';
PRINT '  - vw_TopSellingDishes';
PRINT '';
PRINT 'Usuarios de prueba:';
PRINT '  - Username: admin (Manager)';
PRINT '  - Username: chef1 (Chef)';
PRINT '  - Username: waiter1 (Waiter)';
PRINT '  Contraseña para todos: password123';
PRINT '';
PRINT 'NOTA: Recuerda hashear las contraseñas con bcrypt en producción';
PRINT '=============================================';
GO
