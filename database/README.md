# Base de Datos - Abocado Restaurant

Este directorio contiene el script SQL Server para la base de datos del sistema de gestión de restaurante.

## Contenido

- `create_database.sql` - Script completo para crear la base de datos, tablas, relaciones, índices, triggers, stored procedures y vistas.

## Requisitos

- SQL Server 2019 o superior
- Permisos para crear bases de datos
- SQL Server Management Studio (SSMS) o Azure Data Studio

## Instalación

### Opción 1: Usando SQL Server Management Studio (SSMS)

1. Abre SQL Server Management Studio
2. Conéctate a tu servidor SQL Server
3. Abre el archivo `create_database.sql` (File → Open → File)
4. Presiona F5 o haz clic en "Execute"
5. Espera a que termine la ejecución (verás mensajes de confirmación)

### Opción 2: Usando sqlcmd (Línea de comandos)

```bash
sqlcmd -S localhost -U sa -P tu_password -i create_database.sql
```

### Opción 3: Usando Azure Data Studio

1. Abre Azure Data Studio
2. Conéctate a tu servidor
3. Abre el archivo `create_database.sql`
4. Presiona Ctrl+Shift+E o haz clic en "Run"

## Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción | Registros Iniciales |
|-------|-------------|---------------------|
| **Users** | Usuarios del sistema (chef, waiter, manager) | 3 |
| **Dishes** | Platos del menú | 10 |
| **Tables** | Mesas del restaurante | 6 |
| **Orders** | Órdenes/pedidos | 0 |
| **OrderItems** | Items de cada orden | 0 |
| **Payments** | Pagos procesados | 0 |
| **Reservations** | Reservas de mesas | 0 |
| **AuditLog** | Registro de auditoría | 0 |

### Stored Procedures

- `sp_CreateOrder` - Crear nueva orden
- `sp_CompleteOrder` - Completar orden y procesar pago
- `sp_CancelOrder` - Cancelar orden
- `sp_GetDashboardStats` - Obtener estadísticas del dashboard

### Vistas

- `vw_ActiveOrders` - Resumen de órdenes activas
- `vw_KitchenQueue` - Cola de cocina con items pendientes
- `vw_TablesWithOrders` - Mesas con detalles de orden
- `vw_TopSellingDishes` - Platos más vendidos

### Triggers

- `TR_UpdateOrderTotal` - Actualiza automáticamente el total de la orden
- `TR_Dishes_UpdatedAt` - Actualiza fecha de modificación
- `TR_Tables_UpdatedAt` - Actualiza fecha de modificación
- `TR_Users_UpdatedAt` - Actualiza fecha de modificación

## Datos Iniciales

### Usuarios de Prueba

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | password123 | manager | admin@abocado.com |
| chef1 | password123 | chef | chef@abocado.com |
| waiter1 | password123 | waiter | waiter@abocado.com |

> IMPORTANTE: Estas contraseñas son solo para desarrollo. En producción, debes hashearlas con bcrypt.

### Platos del Menú

**Principales:**
- Burger Clásico - $8.99
- Pollo Frito Crujiente - $9.99
- Sándwich de Pollo - $7.99

**Lados:**
- Papas Fritas - $3.49
- Aros de Cebolla - $4.49
- Ensalada Fresca - $6.99

**Bebidas:**
- Refresco - $2.49
- Jugo Natural - $3.99

**Postres:**
- Helado - $3.99
- Tiramisú - $5.99

### Mesas

- 6 mesas con capacidades de 2, 4 y 6 personas
- Secciones: Principal, Terraza, VIP

## Ejemplos de Uso

### Crear una nueva orden

```sql
DECLARE @orderId NVARCHAR(50);

EXEC sp_CreateOrder
    @tableId = 'table-001',
    @partySize = 2,
    @customerName = 'Juan Pérez',
    @createdBy = 'user-003',
    @orderId = @orderId OUTPUT;

SELECT @orderId AS 'Nueva Orden ID';
```

### Agregar items a una orden

```sql
INSERT INTO OrderItems (id, orderId, dishId, quantity, status, unitPrice, notes)
VALUES
    (CAST(NEWID() AS NVARCHAR(50)), 'orden-id', 'dish-001', 2, 'pending', 8.99, 'Sin cebolla'),
    (CAST(NEWID() AS NVARCHAR(50)), 'orden-id', 'dish-004', 2, 'pending', 3.49, NULL);
```

### Cambiar estado de item en cocina

```sql
UPDATE OrderItems
SET status = 'preparing', startedAt = GETDATE(), preparedBy = 'user-002'
WHERE id = 'item-id';
```

### Completar orden y procesar pago

```sql
EXEC sp_CompleteOrder
    @orderId = 'orden-id',
    @paymentMethod = 'card',
    @tip = 5.00,
    @processedBy = 'user-003';
```

### Obtener estadísticas del dashboard

```sql
EXEC sp_GetDashboardStats;
```

### Consultar cola de cocina

```sql
SELECT * FROM vw_KitchenQueue
ORDER BY
    CASE status
        WHEN 'pending' THEN 1
        WHEN 'preparing' THEN 2
        WHEN 'ready' THEN 3
    END,
    createdAt;
```

### Ver órdenes activas

```sql
SELECT * FROM vw_ActiveOrders;
```

### Platos más vendidos

```sql
SELECT TOP 10 * FROM vw_TopSellingDishes
ORDER BY totalRevenue DESC;
```

## Conexión desde Node.js

### Instalación de dependencias

```bash
npm install mssql
```

### Configuración

```javascript
const sql = require('mssql');

const config = {
    user: 'tu_usuario',
    password: 'tu_password',
    server: 'localhost',
    database: 'AbocadoRestaurant',
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: true // Para desarrollo local
    }
};

// Conectar
const pool = await sql.connect(config);
```

### Ejemplo: Obtener platos

```javascript
const result = await pool.request()
    .query('SELECT * FROM Dishes WHERE isActive = 1');

console.log(result.recordset);
```

### Ejemplo: Crear orden

```javascript
const result = await pool.request()
    .input('tableId', sql.NVarChar(50), 'table-001')
    .input('partySize', sql.Int, 2)
    .input('createdBy', sql.NVarChar(50), 'user-003')
    .output('orderId', sql.NVarChar(50))
    .execute('sp_CreateOrder');

console.log('Nueva orden:', result.output.orderId);
```

## Mantenimiento

### Backup de la base de datos

```sql
BACKUP DATABASE AbocadoRestaurant
TO DISK = 'C:\Backups\AbocadoRestaurant.bak'
WITH FORMAT;
```

### Restaurar backup

```sql
RESTORE DATABASE AbocadoRestaurant
FROM DISK = 'C:\Backups\AbocadoRestaurant.bak'
WITH REPLACE;
```

### Limpiar datos de prueba

```sql
-- Eliminar órdenes antiguas (más de 30 días)
DELETE FROM Orders WHERE completedAt < DATEADD(DAY, -30, GETDATE());

-- Limpiar logs de auditoría (más de 90 días)
DELETE FROM AuditLog WHERE timestamp < DATEADD(DAY, -90, GETDATE());
```

## Diagrama de Relaciones (Texto)

```
┌─────────┐         ┌────────────┐
│  Users  │─────┐   │   Dishes   │
└─────────┘     │   └────────────┘
                │          │
                │          │ (N) dishId
                │          ▼
                │   ┌──────────────┐
                │   │  OrderItems  │
                │   └──────────────┘
                │          │
                │          │ (N) orderId
                │          ▼
┌─────────┐   (1)┌────────────┐(1)┌─────────┐
│ Tables  │◄─────│   Orders   │──►│  Users  │
└─────────┘      └────────────┘   └─────────┘
   (1)               │
    │                │ currentOrderId
    └────────────────┘
```

## Solución de Problemas

### Error: Base de datos ya existe

Si obtienes un error de que la base de datos ya existe, el script la eliminará automáticamente. Si no tienes permisos, comenta las líneas 12-16 del script.

### Error: No se puede eliminar la base de datos (en uso)

Ejecuta:

```sql
ALTER DATABASE AbocadoRestaurant SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE AbocadoRestaurant;
```

### Error de permisos

Asegúrate de conectarte con un usuario que tenga permisos de `CREATE DATABASE` o usa la cuenta `sa`.

## Recursos Adicionales

- [Documentación SQL Server](https://docs.microsoft.com/en-us/sql/sql-server/)
- [Node.js mssql driver](https://www.npmjs.com/package/mssql)
- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

## Licencia

Este proyecto es de código abierto. Siéntete libre de usar y modificar según tus necesidades.
