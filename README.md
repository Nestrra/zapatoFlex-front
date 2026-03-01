# ZapatoFlex Frontend

Frontend de la tienda de calzado **ZapatoFlex S.A.S.** Es la aplicación web que ven los usuarios: catálogo, carrito, login, pedidos y, para administradores, el panel de gestión.

---

## Cómo correr el proyecto

### 1. Requisitos

- **Node.js 18 o superior** (recomendado tenerlo instalado con nvm o desde [nodejs.org](https://nodejs.org)).

### 2. Instalar dependencias

En la carpeta del proyecto (`zapatosFlex-front`):

```bash
npm install
```

### 3. Configurar la URL del backend (opcional)

Por defecto, en desarrollo la app usa `http://localhost:4000` como API. Para producción usa `https://zapato-flex-back.vercel.app`.

Si quieres cambiar la URL, crea un archivo `.env` en la raíz del proyecto y define:

```env
# Local
VITE_API_BASE_URL=http://localhost:4000

# O producción
# VITE_API_BASE_URL=https://zapato-flex-back.vercel.app
```

Puedes basarte en el archivo `.env.example` que está en el proyecto.

### 4. Arrancar en modo desarrollo

```bash
npm run dev
```

Se abre la app en el navegador (normalmente `http://localhost:5173`). Los cambios en el código se reflejan al instante (hot reload).

### 5. Generar build para producción

```bash
npm run build
```

Los archivos listos para subir quedan en la carpeta `dist/`.

### 6. Probar el build en local

```bash
npm run preview
```

Sirve la versión de producción en local para comprobar que todo funciona antes de desplegar.

---

## Qué hace este proyecto (funcionalidad)

Es la **interfaz de usuario** de la tienda de zapatos. Se encarga de:

- **Público (sin login):**
  - Ver el catálogo de productos en la página principal.
  - Filtrar por categoría (Deportivos, Casuales, Formales) desde el menú.
  - Ver el detalle de cada producto.
  - Navegar por términos y condiciones, etc.

- **Usuarios registrados:**
  - Iniciar sesión y cerrar sesión.
  - Agregar productos al carrito, cambiar cantidades y quitar ítems.
  - Completar datos de envío (dirección, teléfono) si hace falta antes de pagar.
  - Ir a checkout, confirmar el pedido y ver el resumen.
  - Ver la lista de sus pedidos y el detalle de cada uno.

- **Administradores (rol ADMIN):**
  - Al iniciar sesión, se redirige al panel de administración.
  - Ver todos los pedidos de la tienda, con paginación.
  - Entrar al detalle de cualquier pedido y cambiar su estado (pendiente, confirmado, enviado, entregado, cancelado, etc.).
  - Ver el catálogo de productos con opción “Editar” en cada uno.
  - Crear nuevos productos (nombre, descripción, precio, categoría, imagen, inventario por talla).
  - Editar productos existentes (incluyendo activar/desactivar).

La app muestra notificaciones tipo toast (éxito, error, etc.) y un badge en el icono del carrito con la cantidad de ítems.

---

## Tecnologías y servicios usados

- **React** – Interfaz y componentes.
- **TypeScript** – Tipado para menos errores y mejor autocompletado.
- **Vite** – Herramienta de desarrollo y empaquetado (rápido y moderno).
- **React Router** – Navegación entre páginas (rutas definidas en `src/routes.tsx`).
- **Tailwind CSS** – Estilos con clases utilitarias.
- **Sonner** – Toasts o notificaciones en pantalla.
- **Context API** – Estado global para autenticación (`AuthContext`) y contador del carrito (`CartContext`).
- **Fetch** – Llamadas al backend (servicios en `src/services/`).

La URL del API se configura con la variable de entorno `VITE_API_BASE_URL` o, si no está definida, se usa local en desarrollo y la URL de Vercel en build.

---

## Estructura del proyecto

```
zapatosFlex-front/
├── public/                 # Archivos estáticos
├── src/
│   ├── config/
│   │   └── env.ts          # URL base del API (local / producción)
│   ├── contexts/
│   │   ├── AuthContext.tsx # Usuario logueado, login, logout
│   │   └── CartContext.tsx # Cantidad de ítems en el carrito
│   ├── layouts/
│   │   └── MainLayout.tsx  # Nav principal, barra promo, footer
│   ├── pages/              # Páginas de la app
│   │   ├── HomePage, ProductsPage, ProductDetailPage
│   │   ├── CartPage, CheckoutPage, ShippingDataPage
│   │   ├── LoginPage, RegisterPage
│   │   ├── OrdersPage, OrderDetailPage
│   │   ├── DashboardPage (admin)
│   │   ├── AdminOrdersPage, AdminOrderDetailPage
│   │   ├── AdminCreateProductPage, AdminEditProductPage
│   │   ├── TermsPage, NotFoundPage, HomeOrRedirect
│   │   └── ...
│   ├── routes.tsx          # Definición de todas las rutas
│   ├── services/           # Llamadas al backend (auth, catalog, cart, orders)
│   ├── types/              # Tipos TypeScript (auth, cart, order, product)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           # Estilos globales (Tailwind)
├── .env.example            # Ejemplo de variables de entorno
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (catálogo) o redirección al dashboard si eres admin |
| `/productos` | Productos, con filtro por categoría (query `?category=`) |
| `/productos/:id` | Detalle de un producto y agregar al carrito |
| `/carrito` | Carrito del usuario (requiere sesión) |
| `/datos-envio` | Completar dirección y teléfono para envío |
| `/checkout` | Confirmar pedido |
| `/pedidos` | Lista de mis pedidos |
| `/pedidos/:id` | Detalle de un pedido |
| `/iniciar-sesion` | Login |
| `/registro` | Registro de usuario |
| `/terminos` | Términos y condiciones |
| `/dashboard` | Panel admin (solo ADMIN) |
| `/admin/pedidos` | Lista de todos los pedidos |
| `/admin/pedidos/:id` | Detalle y cambio de estado de un pedido |
| `/admin/productos/nuevo` | Crear producto |
| `/admin/productos/:id/editar` | Editar producto |

---

## Comandos útiles

| Comando | Uso |
|--------|-----|
| `npm run dev` | Desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Servir el build en local |
| `npm run lint` | Revisar código con ESLint |
