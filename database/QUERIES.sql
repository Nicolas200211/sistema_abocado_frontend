-- =============================================
-- CONSULTAS ÚTILES - Abocado Restaurant
-- =============================================

USE AbocadoRestaurant;
GO

-- =============================================
-- CONSULTAS BÁSICAS
-- =============================================

-- Ver todos los platos activos
SELECT * FROM Dishes WHERE isActive = 1;

-- Ver todas las mesas
SELECT * FROM Tables WHERE isActive = 1;

-- Ver usuarios del sistema
SELECT id, username, fullName, role, isActive FROM Users;

-- =============================================
-- DASHBOARD - ESTADÍSTICAS
-- =============================================

-- Obtener estadísticas completas del dashboard
EXEC sp_GetDashboardStats;

-- Mesas ocupadas vs disponibles
SELECT
    status,
    COUNT(*) AS cantidad,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Tables WHERE isActive = 1) AS DECIMAL(5,2)) AS porcentaje
FROM Tables
WHERE isActive = 1
GROUP BY status;

-- Órdenes activas con detalles
SELECT * FROM vw_ActiveOrders
ORDER BY createdAt DESC;

-- Items en cocina por estado
SELECT
    status,
    COUNT(*) AS cantidad
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
WHERE o.status = 'active'
GROUP BY status;

-- =============================================
-- GESTIÓN DE MESAS
-- =============================================

-- Ver estado actual de todas las mesas
SELECT * FROM vw_TablesWithOrders
ORDER BY number;

-- Mesas disponibles
SELECT * FROM Tables
WHERE status = 'available' AND isActive = 1
ORDER BY number;

-- Mesas ocupadas con tiempo de ocupación
SELECT
    t.number,
    t.capacity,
    t.partySize,
    o.id AS orderId,
    o.total,
    DATEDIFF(MINUTE, o.createdAt, GETDATE()) AS minutesOccupied
FROM Tables t
INNER JOIN Orders o ON t.currentOrderId = o.id
WHERE t.status = 'occupied'
ORDER BY minutesOccupied DESC;

-- Liberar mesa manualmente (emergencia)
UPDATE Tables
SET status = 'available', currentOrderId = NULL, partySize = NULL
WHERE id = 'table-001';

-- =============================================
-- GESTIÓN DE ÓRDENES
-- =============================================

-- Ver orden completa con todos sus items
SELECT
    o.id AS orderId,
    t.number AS mesa,
    o.createdAt,
    o.status AS orderStatus,
    oi.id AS itemId,
    d.name AS dishName,
    oi.quantity,
    oi.unitPrice,
    oi.totalPrice,
    oi.status AS itemStatus,
    oi.notes
FROM Orders o
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN OrderItems oi ON o.id = oi.orderId
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE o.id = 'orden-id'
ORDER BY oi.createdAt;

-- Crear nueva orden (ejemplo completo)
DECLARE @nuevaOrden NVARCHAR(50);

-- 1. Crear la orden
EXEC sp_CreateOrder
    @tableId = 'table-001',
    @partySize = 4,
    @customerName = 'María García',
    @createdBy = 'user-003',
    @orderId = @nuevaOrden OUTPUT;

-- 2. Agregar items
INSERT INTO OrderItems (id, orderId, dishId, quantity, status, unitPrice, notes)
VALUES
    (CAST(NEWID() AS NVARCHAR(50)), @nuevaOrden, 'dish-001', 2, 'pending', 8.99, 'Sin cebolla'),
    (CAST(NEWID() AS NVARCHAR(50)), @nuevaOrden, 'dish-002', 1, 'pending', 9.99, NULL),
    (CAST(NEWID() AS NVARCHAR(50)), @nuevaOrden, 'dish-004', 3, 'pending', 3.49, 'Extra crujientes'),
    (CAST(NEWID() AS NVARCHAR(50)), @nuevaOrden, 'dish-007', 4, 'pending', 2.49, NULL);

SELECT @nuevaOrden AS 'Nueva Orden Creada';

-- Agregar items a una orden existente
INSERT INTO OrderItems (id, orderId, dishId, quantity, status, unitPrice, notes)
VALUES (CAST(NEWID() AS NVARCHAR(50)), 'orden-id', 'dish-003', 1, 'pending', 7.99, 'Sin mayonesa');

-- Cancelar orden
EXEC sp_CancelOrder @orderId = 'orden-id', @reason = 'Cliente solicitó cancelación';

-- =============================================
-- COCINA - GESTIÓN DE ITEMS
-- =============================================

-- Ver cola completa de cocina
SELECT * FROM vw_KitchenQueue
ORDER BY
    CASE status
        WHEN 'pending' THEN 1
        WHEN 'preparing' THEN 2
        WHEN 'ready' THEN 3
    END,
    createdAt;

-- Items pendientes (sin empezar)
SELECT
    t.number AS mesa,
    d.name AS plato,
    oi.quantity,
    d.prepTime AS tiempoEstimado,
    oi.notes,
    DATEDIFF(MINUTE, oi.createdAt, GETDATE()) AS minutosEsperando
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE o.status = 'active' AND oi.status = 'pending'
ORDER BY oi.createdAt;

-- Items en preparación
SELECT
    t.number AS mesa,
    d.name AS plato,
    oi.quantity,
    d.prepTime AS tiempoEstimado,
    DATEDIFF(MINUTE, oi.startedAt, GETDATE()) AS minutosEnPreparacion,
    u.fullName AS chef
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN Dishes d ON oi.dishId = d.id
LEFT JOIN Users u ON oi.preparedBy = u.id
WHERE o.status = 'active' AND oi.status = 'preparing'
ORDER BY oi.startedAt;

-- Items listos para servir
SELECT
    t.number AS mesa,
    d.name AS plato,
    oi.quantity,
    DATEDIFF(MINUTE, oi.completedAt, GETDATE()) AS minutosListo
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE o.status = 'active' AND oi.status = 'ready'
ORDER BY oi.completedAt;

-- Cambiar item de pending a preparing
UPDATE OrderItems
SET
    status = 'preparing',
    startedAt = GETDATE(),
    preparedBy = 'user-002' -- ID del chef
WHERE id = 'item-id';

-- Cambiar item de preparing a ready
UPDATE OrderItems
SET
    status = 'ready',
    completedAt = GETDATE()
WHERE id = 'item-id';

-- Items que están tomando más tiempo del estimado
SELECT
    t.number AS mesa,
    d.name AS plato,
    d.prepTime AS tiempoEstimado,
    DATEDIFF(MINUTE, oi.startedAt, GETDATE()) AS tiempoActual,
    DATEDIFF(MINUTE, oi.startedAt, GETDATE()) - d.prepTime AS retrasoMinutos
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE o.status = 'active'
  AND oi.status = 'preparing'
  AND DATEDIFF(MINUTE, oi.startedAt, GETDATE()) > d.prepTime
ORDER BY retrasoMinutos DESC;

-- =============================================
-- SERVICIO - GESTIÓN DE PAGOS
-- =============================================

-- Ver órdenes listas para pagar (todos los items ready)
SELECT
    o.id AS orderId,
    t.number AS mesa,
    o.total,
    COUNT(oi.id) AS totalItems,
    SUM(CASE WHEN oi.status = 'ready' THEN 1 ELSE 0 END) AS itemsListos
FROM Orders o
INNER JOIN Tables t ON o.tableId = t.id
INNER JOIN OrderItems oi ON o.id = oi.orderId
WHERE o.status = 'active'
GROUP BY o.id, t.number, o.total
HAVING COUNT(oi.id) = SUM(CASE WHEN oi.status = 'ready' THEN 1 ELSE 0 END);

-- Completar orden y procesar pago
EXEC sp_CompleteOrder
    @orderId = 'orden-id',
    @paymentMethod = 'card',
    @tip = 5.00,
    @processedBy = 'user-003';

-- Ver historial de pagos del día
SELECT
    p.id,
    o.id AS orderId,
    t.number AS mesa,
    p.amount,
    p.tip,
    p.amount + p.tip AS total,
    p.method,
    p.processedAt,
    u.fullName AS procesadoPor
FROM Payments p
INNER JOIN Orders o ON p.orderId = o.id
INNER JOIN Tables t ON o.tableId = t.id
LEFT JOIN Users u ON p.processedBy = u.id
WHERE CAST(p.processedAt AS DATE) = CAST(GETDATE() AS DATE)
  AND p.status = 'completed'
ORDER BY p.processedAt DESC;

-- =============================================
-- REPORTES Y ANÁLISIS
-- =============================================

-- Ingresos totales del día
SELECT
    COUNT(*) AS ordenesCompletadas,
    SUM(amount) AS totalVentas,
    SUM(tip) AS totalPropinas,
    SUM(amount + tip) AS totalIngresos,
    AVG(amount) AS promedioVenta
FROM Payments
WHERE CAST(processedAt AS DATE) = CAST(GETDATE() AS DATE)
  AND status = 'completed';

-- Ingresos por método de pago
SELECT
    method,
    COUNT(*) AS cantidad,
    SUM(amount + tip) AS total
FROM Payments
WHERE CAST(processedAt AS DATE) = CAST(GETDATE() AS DATE)
  AND status = 'completed'
GROUP BY method;

-- Platos más vendidos (hoy)
SELECT
    d.name,
    d.category,
    COUNT(oi.id) AS ordenesVendidas,
    SUM(oi.quantity) AS unidadesVendidas,
    SUM(oi.totalPrice) AS ingresoTotal
FROM OrderItems oi
INNER JOIN Orders o ON oi.orderId = o.id
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE CAST(o.createdAt AS DATE) = CAST(GETDATE() AS DATE)
  AND o.status = 'completed'
GROUP BY d.name, d.category
ORDER BY ingresoTotal DESC;

-- Platos más vendidos (histórico)
SELECT TOP 10 * FROM vw_TopSellingDishes
ORDER BY totalRevenue DESC;

-- Rendimiento de la cocina (tiempo promedio por plato)
SELECT
    d.name,
    d.prepTime AS tiempoEstimado,
    AVG(DATEDIFF(MINUTE, oi.startedAt, oi.completedAt)) AS tiempoPromedioReal,
    COUNT(*) AS vecesPreparado
FROM OrderItems oi
INNER JOIN Dishes d ON oi.dishId = d.id
WHERE oi.startedAt IS NOT NULL
  AND oi.completedAt IS NOT NULL
GROUP BY d.name, d.prepTime
ORDER BY vecesPreparado DESC;

-- Órdenes por hora del día
SELECT
    DATEPART(HOUR, createdAt) AS hora,
    COUNT(*) AS ordenesCreadas,
    AVG(total) AS promedioVenta
FROM Orders
WHERE CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY DATEPART(HOUR, createdAt)
ORDER BY hora;

-- Rotación de mesas
SELECT
    t.number,
    COUNT(o.id) AS ordenesAtendidas,
    AVG(DATEDIFF(MINUTE, o.createdAt, o.completedAt)) AS tiempoPromedioOcupacion
FROM Tables t
INNER JOIN Orders o ON t.id = o.tableId
WHERE CAST(o.createdAt AS DATE) = CAST(GETDATE() AS DATE)
  AND o.status = 'completed'
GROUP BY t.number
ORDER BY ordenesAtendidas DESC;

-- Meseros más productivos
SELECT
    u.fullName,
    COUNT(o.id) AS ordenesCreadas,
    SUM(o.total) AS totalVentas,
    AVG(o.total) AS promedioVenta
FROM Users u
INNER JOIN Orders o ON u.id = o.createdBy
WHERE u.role = 'waiter'
  AND CAST(o.createdAt AS DATE) = CAST(GETDATE() AS DATE)
  AND o.status = 'completed'
GROUP BY u.fullName
ORDER BY totalVentas DESC;

-- =============================================
-- RESERVAS
-- =============================================

-- Ver reservas del día
SELECT
    r.id,
    t.number AS mesa,
    r.customerName,
    r.customerPhone,
    r.partySize,
    r.reservationDate,
    r.status,
    u.fullName AS creadaPor
FROM Reservations r
INNER JOIN Tables t ON r.tableId = t.id
LEFT JOIN Users u ON r.createdBy = u.id
WHERE CAST(r.reservationDate AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY r.reservationDate;

-- Crear reserva
INSERT INTO Reservations (id, tableId, customerName, customerPhone, customerEmail, partySize, reservationDate, status, notes, createdBy)
VALUES (
    CAST(NEWID() AS NVARCHAR(50)),
    'table-006',
    'Roberto Martínez',
    '+34-123-456-789',
    'roberto@email.com',
    4,
    '2024-01-15 20:00:00',
    'confirmed',
    'Cumpleaños - necesita velas',
    'user-003'
);

-- Confirmar reserva
UPDATE Reservations
SET status = 'confirmed'
WHERE id = 'reserva-id';

-- Cancelar reserva
UPDATE Reservations
SET status = 'cancelled'
WHERE id = 'reserva-id';

-- Completar reserva (cuando llegó el cliente)
UPDATE Reservations
SET status = 'completed'
WHERE id = 'reserva-id';

-- =============================================
-- MANTENIMIENTO
-- =============================================

-- Ver tamaño de las tablas
SELECT
    t.NAME AS TableName,
    p.rows AS RowCounts,
    SUM(a.total_pages) * 8 AS TotalSpaceKB,
    SUM(a.used_pages) * 8 AS UsedSpaceKB,
    (SUM(a.total_pages) - SUM(a.used_pages)) * 8 AS UnusedSpaceKB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.is_ms_shipped = 0
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceKB DESC;

-- Limpiar órdenes completadas antiguas (más de 90 días)
DELETE FROM Orders
WHERE status = 'completed'
  AND completedAt < DATEADD(DAY, -90, GETDATE());

-- Limpiar logs de auditoría antiguos (más de 180 días)
DELETE FROM AuditLog
WHERE timestamp < DATEADD(DAY, -180, GETDATE());

-- Reconstruir índices fragmentados
DECLARE @TableName VARCHAR(255);
DECLARE @sql NVARCHAR(500);
DECLARE TableCursor CURSOR FOR
SELECT OBJECT_NAME(OBJECT_ID)
FROM sys.dm_db_index_physical_stats (DB_ID(), NULL, NULL, NULL, NULL)
WHERE avg_fragmentation_in_percent > 30;

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'ALTER INDEX ALL ON ' + @TableName + N' REBUILD';
    EXEC sp_executesql @sql;
    FETCH NEXT FROM TableCursor INTO @TableName;
END

CLOSE TableCursor;
DEALLOCATE TableCursor;

-- Actualizar estadísticas
EXEC sp_updatestats;

-- =============================================
-- BACKUP Y RESTORE
-- =============================================

-- Crear backup completo
BACKUP DATABASE AbocadoRestaurant
TO DISK = 'C:\Backups\AbocadoRestaurant_Full.bak'
WITH FORMAT,
     NAME = 'AbocadoRestaurant Full Backup',
     COMPRESSION;

-- Crear backup diferencial
BACKUP DATABASE AbocadoRestaurant
TO DISK = 'C:\Backups\AbocadoRestaurant_Diff.bak'
WITH DIFFERENTIAL,
     NAME = 'AbocadoRestaurant Differential Backup',
     COMPRESSION;

-- Restaurar desde backup
RESTORE DATABASE AbocadoRestaurant
FROM DISK = 'C:\Backups\AbocadoRestaurant_Full.bak'
WITH REPLACE,
     RECOVERY;

-- =============================================
-- DEBUGGING Y TROUBLESHOOTING
-- =============================================

-- Ver órdenes con problemas (items en estados inconsistentes)
SELECT
    o.id AS orderId,
    t.number AS mesa,
    o.status AS orderStatus,
    COUNT(oi.id) AS totalItems,
    SUM(CASE WHEN oi.status = 'pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN oi.status = 'preparing' THEN 1 ELSE 0 END) AS preparing,
    SUM(CASE WHEN oi.status = 'ready' THEN 1 ELSE 0 END) AS ready
FROM Orders o
INNER JOIN Tables t ON o.tableId = t.id
LEFT JOIN OrderItems oi ON o.id = oi.orderId
WHERE o.status = 'active'
GROUP BY o.id, t.number, o.status;

-- Ver mesas con estado inconsistente
SELECT *
FROM Tables t
WHERE (t.status = 'occupied' AND t.currentOrderId IS NULL)
   OR (t.status = 'available' AND t.currentOrderId IS NOT NULL);

-- Corregir estados inconsistentes de mesas
UPDATE Tables
SET status = 'available', currentOrderId = NULL, partySize = NULL
WHERE status = 'occupied' AND currentOrderId IS NULL;

UPDATE Tables
SET status = 'occupied'
WHERE currentOrderId IS NOT NULL AND status = 'available';

-- Ver órdenes huérfanas (sin mesa o con mesa incorrecta)
SELECT o.*
FROM Orders o
LEFT JOIN Tables t ON o.tableId = t.id
WHERE t.id IS NULL;

-- Ver últimas 10 modificaciones del log de auditoría
SELECT TOP 10
    timestamp,
    ISNULL(u.username, 'SYSTEM') AS usuario,
    tableName,
    recordId,
    action
FROM AuditLog al
LEFT JOIN Users u ON al.userId = u.id
ORDER BY timestamp DESC;
