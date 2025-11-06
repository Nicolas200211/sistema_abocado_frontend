# Esquema de Base de Datos - Abocado Restaurant

## Diagrama de Entidad-Relación

```
                                    ┌──────────────────────────┐
                                    │        Users             │
                                    ├──────────────────────────┤
                                    │ PK  id                   │
                                    │     username (unique)    │
                                    │     email (unique)       │
                                    │     passwordHash         │
                                    │     fullName             │
                                    │     role (enum)          │
                                    │     isActive             │
                                    │     createdAt            │
                                    │     updatedAt            │
                                    │     lastLogin            │
                                    └──────────────────────────┘
                                         │           │
                      ┌──────────────────┘           └──────────────────┐
                      │                                                  │
                      │ FK createdBy                          FK preparedBy
                      │                                                  │
        ┌─────────────▼────────────┐                    ┌───────────────▼──────────────┐
        │       Orders             │                    │      OrderItems              │
        ├──────────────────────────┤                    ├──────────────────────────────┤
        │ PK  id                   │◄───────────────────│ PK  id                       │
        │ FK  tableId              │                    │ FK  orderId                  │
        │     status (enum)        │                    │ FK  dishId                   │
        │     subtotal             │                    │     quantity                 │
        │     tax                  │                    │     notes                    │
        │     discount             │                    │     status (enum)            │
        │     total                │                    │     unitPrice                │
        │     customerName         │                    │     totalPrice (computed)    │
        │     customerPhone        │                    │     startedAt                │
        │     createdAt            │                    │     completedAt              │
        │     completedAt          │                    │     createdAt                │
        │     cancelledAt          │                    │ FK  preparedBy               │
        │ FK  createdBy            │                    └──────────────┬───────────────┘
        └──────┬───────────────────┘                                   │
               │                                                        │
               │                                             ┌──────────▼─────────────────┐
               │                                             │       Dishes               │
               │ FK orderId                                  ├────────────────────────────┤
               │                                             │ PK  id                     │
               │                                             │     name                   │
               │                                             │     description            │
               │                                             │     price                  │
               │                                             │     category (enum)        │
        ┌──────▼───────────────┐                            │     prepTime               │
        │     Payments         │                            │     image                  │
        ├──────────────────────┤                            │     isActive               │
        │ PK  id               │                            │     createdAt              │
        │ FK  orderId          │                            │     updatedAt              │
        │     amount           │                            └────────────────────────────┘
        │     method (enum)    │
        │     status (enum)    │
        │     transactionId    │
        │     tip              │
        │     processedAt      │
        │     createdAt        │
        │ FK  processedBy      │
        └──────────────────────┘


┌──────────────────────────┐
│        Tables            │◄───────────────────┐
├──────────────────────────┤                    │
│ PK  id                   │                    │
│     number (unique)      │                    │
│     capacity             │                    │
│     status (enum)        │                    │
│ FK  currentOrderId       │────────────────────┘
│     partySize            │
│     section              │
│     isActive             │
│     createdAt            │
│     updatedAt            │
└──────────┬───────────────┘
           │
           │ FK tableId
           │
┌──────────▼───────────────┐
│     Reservations         │
├──────────────────────────┤
│ PK  id                   │
│ FK  tableId              │
│     customerName         │
│     customerPhone        │
│     customerEmail        │
│     partySize            │
│     reservationDate      │
│     status (enum)        │
│     notes                │
│     createdAt            │
│ FK  createdBy            │
└──────────────────────────┘


┌──────────────────────────┐
│       AuditLog           │
├──────────────────────────┤
│ PK  id (IDENTITY)        │
│ FK  userId               │
│     tableName            │
│     recordId             │
│     action (enum)        │
│     oldValue (JSON)      │
│     newValue (JSON)      │
│     timestamp            │
└──────────────────────────┘
```

## Enums y Valores Permitidos

### Users.role
- `chef` - Chef de cocina
- `waiter` - Mesero/camarero
- `manager` - Gerente/administrador

### Dishes.category
- `principal` - Plato principal
- `lado` - Guarnición/acompañamiento
- `bebida` - Bebida
- `postre` - Postre

### Tables.status
- `available` - Disponible
- `occupied` - Ocupada
- `reserved` - Reservada

### Orders.status
- `active` - Activa
- `completed` - Completada
- `cancelled` - Cancelada

### OrderItems.status
- `pending` - Pendiente (en cola)
- `preparing` - En preparación
- `ready` - Lista para servir

### Payments.method
- `cash` - Efectivo
- `card` - Tarjeta
- `transfer` - Transferencia

### Payments.status
- `pending` - Pendiente
- `completed` - Completado
- `failed` - Fallido

### Reservations.status
- `pending` - Pendiente
- `confirmed` - Confirmada
- `cancelled` - Cancelada
- `completed` - Completada

### AuditLog.action
- `INSERT` - Inserción
- `UPDATE` - Actualización
- `DELETE` - Eliminación

## Relaciones Detalladas

### Orders ↔ Tables (Many-to-One)
- Una orden pertenece a **una** mesa
- Una mesa puede tener **muchas** órdenes (histórico)
- Una mesa tiene máximo **una** orden activa (currentOrderId)

### OrderItems ↔ Orders (Many-to-One)
- Un item pertenece a **una** orden
- Una orden puede tener **muchos** items
- **CASCADE DELETE**: Al eliminar una orden, se eliminan sus items

### OrderItems ↔ Dishes (Many-to-One)
- Un item referencia **un** plato
- Un plato puede estar en **muchos** items

### Payments ↔ Orders (Many-to-One)
- Un pago pertenece a **una** orden
- Una orden puede tener **muchos** pagos (propinas adicionales, dividir cuenta)

### Reservations ↔ Tables (Many-to-One)
- Una reserva es para **una** mesa
- Una mesa puede tener **muchas** reservas

### Relaciones con Users (Auditoría)
- Orders.createdBy → Usuario que creó la orden (mesero)
- OrderItems.preparedBy → Usuario que preparó el item (chef)
- Payments.processedBy → Usuario que procesó el pago (mesero/manager)
- Reservations.createdBy → Usuario que creó la reserva

## Campos Calculados y Automáticos

### OrderItems.totalPrice (COMPUTED)
```sql
totalPrice = quantity * unitPrice
```
Campo calculado que se actualiza automáticamente.

### Orders.subtotal, tax, total (TRIGGER)
Actualizados automáticamente por el trigger `TR_UpdateOrderTotal`:
```sql
subtotal = SUM(OrderItems.totalPrice)
tax = subtotal * 0.10
total = subtotal * 1.10
```

### *.updatedAt (TRIGGER)
Campos `updatedAt` en Dishes, Tables y Users se actualizan automáticamente al modificar el registro.

## Índices Importantes

### Índices de Rendimiento

```sql
-- Búsquedas frecuentes
IX_OrderItems_OrderId_Status (orderId, status)
IX_Orders_TableId_Status (tableId, status)
IX_Orders_Status_CreatedAt (status, createdAt DESC)

-- Reportes
IX_Orders_CompletedAt (completedAt) WHERE completedAt IS NOT NULL
IX_OrderItems_DishId_CreatedAt (dishId, createdAt)

-- Búsqueda de usuarios
IX_Users_Username (username)
IX_Users_Email (email)

-- Auditoría
IX_AuditLog_Timestamp (timestamp DESC)
IX_AuditLog_RecordId (recordId)
```

### Índices Únicos

```sql
-- Constraints de unicidad
UQ_Users_Username (username)
UQ_Users_Email (email)
UQ_Tables_Number (number)
```

## Reglas de Negocio (CHECK Constraints)

### Dishes
- `price > 0`
- `prepTime > 0 AND prepTime <= 240` (máx 4 horas)
- `category IN ('principal', 'lado', 'bebida', 'postre')`

### Tables
- `capacity > 0 AND capacity <= 20`
- `partySize >= 0`
- `status IN ('available', 'occupied', 'reserved')`

### Orders
- `subtotal >= 0`
- `tax >= 0`
- `discount >= 0`
- `total >= 0`
- `status IN ('active', 'completed', 'cancelled')`

### OrderItems
- `quantity > 0`
- `unitPrice > 0`
- `status IN ('pending', 'preparing', 'ready')`

### Payments
- `amount > 0`
- `tip >= 0`
- `method IN ('cash', 'card', 'transfer')`
- `status IN ('pending', 'completed', 'failed')`

### Reservations
- `partySize > 0`
- `status IN ('pending', 'confirmed', 'cancelled', 'completed')`

## Stored Procedures

### sp_CreateOrder
Crea una nueva orden y marca la mesa como ocupada.

**Parámetros:**
- `@tableId` NVARCHAR(50) - ID de la mesa
- `@partySize` INT - Cantidad de comensales
- `@customerName` NVARCHAR(200) - Nombre del cliente (opcional)
- `@createdBy` NVARCHAR(50) - ID del usuario (opcional)
- `@orderId` NVARCHAR(50) OUTPUT - ID de la orden creada

**Validaciones:**
- La mesa debe existir
- La mesa no debe tener una orden activa

### sp_CompleteOrder
Completa una orden, procesa el pago y libera la mesa.

**Parámetros:**
- `@orderId` NVARCHAR(50) - ID de la orden
- `@paymentMethod` NVARCHAR(50) - Método de pago
- `@tip` DECIMAL(10,2) - Propina (opcional, default: 0)
- `@processedBy` NVARCHAR(50) - ID del usuario (opcional)

**Validaciones:**
- La orden debe existir y estar activa
- Todos los items deben estar en estado 'ready'

### sp_CancelOrder
Cancela una orden y libera la mesa.

**Parámetros:**
- `@orderId` NVARCHAR(50) - ID de la orden
- `@reason` NVARCHAR(500) - Motivo de cancelación (opcional)

**Validaciones:**
- La orden debe existir
- No se puede cancelar una orden completada

### sp_GetDashboardStats
Obtiene estadísticas para el dashboard.

**Retorna:**
- `TablesOccupied` - Mesas ocupadas
- `TotalTables` - Total de mesas activas
- `TablesAvailable` - Mesas disponibles
- `ItemsPending` - Items pendientes en cocina
- `ItemsPreparing` - Items en preparación
- `ItemsReady` - Items listos
- `ActiveOrders` - Órdenes activas
- `ActiveOrdersTotal` - Total de órdenes activas
- `TodayRevenue` - Ingresos del día
- `TodayCompletedOrders` - Órdenes completadas hoy

## Vistas

### vw_ActiveOrders
Vista consolidada de todas las órdenes activas con conteo de items por estado.

**Campos:**
- orderId, tableId, tableNumber
- total, createdAt, minutesSinceCreated
- totalItems, pendingItems, preparingItems, readyItems

### vw_KitchenQueue
Vista de la cola de cocina con detalles de cada item.

**Campos:**
- Item info: id, orderId, tableNumber, quantity, notes, status
- Dish info: dishId, dishName, dishCategory, prepTime
- Timing: startedAt, completedAt, createdAt, minutesInProgress

### vw_TablesWithOrders
Vista de mesas con información de su orden actual.

**Campos:**
- Table info: tableId, number, capacity, status, partySize, section
- Order info: orderId, orderTotal, orderCreatedAt, orderMinutesActive

### vw_TopSellingDishes
Vista de platos más vendidos (solo órdenes completadas).

**Campos:**
- dishId, dishName, category, price
- totalOrders, totalQuantity, totalRevenue

## Flujo de Datos Típico

### 1. Crear Orden
```
[Mesa disponible] → sp_CreateOrder → [Mesa ocupada] + [Orden activa]
```

### 2. Agregar Items
```
[Orden activa] → INSERT OrderItems → [Items en 'pending']
                                   → Trigger actualiza Order.total
```

### 3. Preparar en Cocina
```
[Item 'pending'] → UPDATE status='preparing' + startedAt
                → [Item 'preparing']
```

### 4. Marcar Listo
```
[Item 'preparing'] → UPDATE status='ready' + completedAt
                   → [Item 'ready']
```

### 5. Completar Orden
```
[Todos items 'ready'] → sp_CompleteOrder → [Orden completada]
                                         → [Pago registrado]
                                         → [Mesa disponible]
```

## Consideraciones de Seguridad

1. **Contraseñas**: Los passwordHash deben generarse con bcrypt (rounds=10 mínimo)
2. **SQL Injection**: Usar siempre parámetros en las consultas
3. **Roles**: Implementar control de acceso basado en Users.role
4. **Auditoría**: AuditLog registra todas las modificaciones importantes
5. **Backups**: Hacer backups regulares de la base de datos

## Optimizaciones Futuras

1. **Particionado**: Particionar Orders por fecha para mejorar queries históricos
2. **Archivado**: Mover órdenes antiguas a tabla de archivo
3. **Caché**: Cachear Dishes y Tables en Redis
4. **Full-Text Search**: Agregar búsqueda full-text en Dishes.name/description
5. **Normalización**: Considerar tabla Categories separada para categorías
