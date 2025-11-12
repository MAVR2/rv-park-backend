# Sistema de Gestión de RV Parks - Backend

Backend API REST para gestión de RV Parks con Node.js, Express, Sequelize y MySQL.

## 🚀 Características

- ✅ Autenticación JWT con roles (Administrador, Supervisor, Operador)
- ✅ CRUD completo para todas las entidades
- ✅ Lógica automática de cálculo de pagos proporcionales
- ✅ Registro automático de primer pago al crear renta
- ✅ Actualización automática del estado de spots
- ✅ Sistema de auditoría para todas las acciones críticas
- ✅ Transacciones en operaciones complejas
- ✅ Seguridad con Helmet y CORS
- ✅ Validación y manejo de errores

## 📋 Requisitos

- Node.js >= 14.x
- MySQL >= 8.0
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio o copiar los archivos**

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=rv_park_system
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRE=7d

MONTHLY_RATE=1200
```

4. **Crear la base de datos**

Ejecutar el script SQL proporcionado para crear las tablas:

```sql
CREATE DATABASE rv_park_system;
USE rv_park_system;

-- [Ejecutar el resto del script SQL proporcionado]
```

5. **Iniciar el servidor**

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 📚 Endpoints de la API

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (Admin)
- `GET /api/auth/me` - Obtener usuario actual

### RV Parks

- `GET /api/rv-parks` - Listar todos los RV parks
- `GET /api/rv-parks/:id` - Obtener RV park por ID
- `POST /api/rv-parks` - Crear RV park (Admin)
- `PUT /api/rv-parks/:id` - Actualizar RV park (Admin)
- `DELETE /api/rv-parks/:id` - Eliminar RV park (Admin)

### Spots

- `GET /api/spots` - Listar spots (filtros: `id_rv_park`, `estado`)
- `GET /api/spots/:id` - Obtener spot por ID
- `POST /api/spots` - Crear spot (Admin)
- `PUT /api/spots/:id` - Actualizar spot
- `DELETE /api/spots/:id` - Eliminar spot (Admin)

### Clientes

- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente (Admin)

### Rentas

- `GET /api/rentas` - Listar rentas (filtros: `estatus_pago`, `id_cliente`, `id_spot`)
- `GET /api/rentas/:id` - Obtener renta por ID
- `POST /api/rentas` - Crear renta (calcula y registra pago automáticamente)
- `PUT /api/rentas/:id` - Actualizar renta
- `DELETE /api/rentas/:id` - Eliminar renta (Admin)

### Pagos

- `GET /api/pagos` - Listar pagos (filtros: `id_renta`, `periodo`)
- `GET /api/pagos/:id` - Obtener pago por ID
- `POST /api/pagos` - Registrar pago mensual
- `PUT /api/pagos/:id` - Actualizar pago (Admin)
- `DELETE /api/pagos/:id` - Eliminar pago (Admin)

## 💡 Lógica de Pagos

### Crear Renta

Al crear una renta (`POST /api/rentas`), el sistema:

1. Valida que el spot esté disponible
2. Calcula el monto proporcional según la fecha de inicio:
   - Si entra el día 1: cobra el mes completo ($1,200)
   - Si entra a mitad de mes: calcula proporcional `(tarifa/días_del_mes) * días_restantes`
   - Ejemplo: entrada el 16 de nov (30 días) = `(1200/30) * 15 = $600`
3. Crea automáticamente el registro en `pagos` con el periodo (formato `YYYY-MM`)
4. Marca la renta como `Pagado`
5. Actualiza el estado del spot a `Pagado`

**Ejemplo de petición:**

```json
POST /api/rentas
{
  "id_cliente": 1,
  "id_spot": 5,
  "fecha_inicio": "2025-11-16",
  "metodo_pago": "Efectivo"
}
```

### Registrar Pago Mensual

Para registrar pagos mensuales posteriores (`POST /api/pagos`):

```json
POST /api/pagos
{
  "id_renta": 1,
  "fecha_pago": "2025-12-01",
  "monto": 1200,
  "metodo_pago": "Transferencia",
  "referencia": "TRX123456"
}
```

El sistema:
- Calcula el periodo automáticamente (`2025-12`)
- Valida que no exista pago duplicado para ese periodo
- Actualiza el estatus de la renta a `Pagado`
- Mantiene el estado del spot como `Pagado`

## 🔐 Autenticación

Todas las rutas (excepto login) requieren token JWT en el header:

```
Authorization: Bearer <token>
```

### Roles y Permisos

- **Administrador**: Acceso completo
- **Supervisor**: CRUD de clientes, rentas, spots (lectura)
- **Operador**: Registro de pagos, consultas

## 🗂️ Estructura del Proyecto

```
rv-park-backend/
├── config/
│   └── database.js          # Configuración Sequelize
├── controllers/
│   ├── authController.js    # Login, registro
│   ├── rvParkController.js  # CRUD RV Parks
│   ├── spotController.js    # CRUD Spots
│   ├── clienteController.js # CRUD Clientes
│   ├── rentaController.js   # CRUD Rentas + lógica pagos
│   └── pagoController.js    # CRUD Pagos
├── middleware/
│   ├── auth.js              # JWT y autorización
│   └── auditoria.js         # Registro de acciones
├── models/
│   ├── RvPark.js
│   ├── Spot.js
│   ├── Cliente.js
│   ├── Renta.js
│   ├── Pago.js
│   ├── Usuario.js
│   ├── Auditoria.js
│   └── index.js             # Relaciones
├── routes/
│   ├── authRoutes.js
│   ├── rvParkRoutes.js
│   ├── spotRoutes.js
│   ├── clienteRoutes.js
│   ├── rentaRoutes.js
│   └── pagoRoutes.js
├── utils/
│   └── paymentCalculator.js # Cálculos de pago
├── app.js                   # Configuración Express
├── server.js                # Punto de entrada
├── package.json
├── .env.example
└── README.md
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- JWT con expiración configurable
- Helmet para headers de seguridad
- CORS configurable
- Validación de entrada
- Transacciones para integridad de datos

## 📝 Estados de Spot

- **Disponible**: Sin renta activa
- **Pagado**: Con renta activa y pago al día
- **Trabajador**: Asignado manualmente (Admin)
- **Caliche**: Asignado manualmente (Admin)

## 🔄 Auditoría

Todas las acciones críticas se registran en la tabla `auditoria`:
- Crear/actualizar/eliminar rentas
- Registrar pagos
- Cambios en spots
- Acciones administrativas

## 🚨 Manejo de Errores

Respuestas consistentes:

```json
{
  "success": false,
  "message": "Descripción del error"
}

```

## 📞 Soporte

Para dudas o problemas, revisar:
1. Variables de entorno correctamente configuradas
2. Base de datos creada y accesible
3. Logs del servidor

---

**Desarrollado para Sistema de Gestión de RV Parks** 🏕️
