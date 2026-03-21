# 🛒 Lista de compras

Una aplicación web moderna para la gestión de compras, diseñada con un enfoque en la experiencia de usuario (UX) y persistencia de datos local.

🚀 **Link del Proyecto:** [https://lista-de-compras-app-five.vercel.app](https://lista-de-compras-app-five.vercel.app)

---

## ✨ Características Principales

- **Gestión Inteligente:** Crea, edita y organiza múltiples listas de compras con iconos personalizados.
- **Cálculo en Tiempo Real:** Presupuesto general automatizado basado en la suma de todas tus listas activas.
- **Sistema de "Soft Delete":** Desactivación lógica de listas y productos para mantener un historial limpio sin pérdida de datos.
- **Análisis Visual:** Gráficas de barras que muestran la distribución de gastos por lista.
- **Perfil Personalizable:** Gestión de identidad del usuario con avatares dinámicos y estadísticas de uso.
- **Navegación Fluida:** SPA (Single Page Application) con rutas protegidas y transiciones suaves.

## 🛠️ Stack Tecnológico

El proyecto fue construido utilizando las mejores herramientas del ecosistema React:

* **Core:** [React.js](https://reactjs.org/) (Vite)
* **Enrutamiento:** [React Router DOM](https://reactrouter.com/)
* **Base de Datos Local:** [Dexie.js](https://dexie.org/) (IndexedDB)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Iconografía:** [Heroicons](https://heroicons.com/)
* **Gráficas:** [Recharts](https://recharts.org/)
* **Alertas:** [SweetAlert2](https://sweetalert2.github.io/)

## 📊 Estructura de Datos (Dexie)

La aplicación utiliza un esquema relacional ligero en el navegador:
- `userProfile`: Almacena identidad y preferencias.
- `lists`: Cabeceras de las listas (nombre, icono, estado).
- `list_product`: Tabla intermedia que vincula productos con sus respectivas listas, cantidades y precios.
- `products`: Tabla de todos los productos predeterminados y crados por el usuario

## 📸 Capturas de Pantalla

| Dashboard Principal | Estadísticas de Perfil | Detalle de Lista |
| :---: | :---: | :---: |
| ![Home](https://nada) | ![Profile](https://nada) | ![Items](https://nada) |

## 🚀 Instalación Local

1.  **Clonar repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/lista-de-compras-app.git](https://github.com/tu-usuario/lista-de-compras-app.git)
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```

## 📝 Notas de Desarrollo

Esta aplicación fue desarrollada enfocándose en la **persistencia offline**. Gracias a IndexedDB, el usuario puede cerrar el navegador o perder la conexión y sus datos permanecerán intactos al regresar, eliminando la necesidad de un backend tradicional para una herramienta de uso personal.

---
Desarrollado con pasión por **Sebastian** 💡