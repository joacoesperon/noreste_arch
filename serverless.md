# Plan de Migración a Arquitectura Serverless

Este documento detalla la estrategia y los pasos necesarios para migrar **norestearch** de su arquitectura actual basada en VPS (Filesystem) a una arquitectura Serverless de costo $0.

## 🎯 Objetivo
Eliminar el costo mensual de hosting (~$72 USD/año) y mejorar la escalabilidad y velocidad del sitio utilizando servicios en la nube con niveles gratuitos generosos.

---

## 🛠️ Stack Tecnológico Propuesto (Costo $0)

| Componente | Servicio Recomenado | Función |
|------------|---------------------|---------|
| **Hosting** | **Vercel** (Hobby Plan) | Servir la aplicación Next.js. |
| **Imágenes/Video** | **Cloudinary** | Almacenamiento y optimización de media (reemplaza `public/projects/`). |
| **Base de Datos** | **MongoDB Atlas** o **Supabase** | Almacenamiento de metadatos de proyectos (reemplaza `projects.json`). |
| **Autenticación** | **NextAuth.js** o **Clerk** | Gestión segura de acceso al panel /admin. |

---

## 🚀 Pasos para la Migración

### 1. Preparación de Datos
- Crear una cuenta en **MongoDB Atlas** y configurar un cluster gratuito.
- Migrar el contenido actual de `content/projects.json` a una colección en la base de datos.
- Crear una cuenta en **Cloudinary** y obtener las credenciales de API.

### 2. Refactorización del Admin (`src/app/admin`)
- **Subida de Archivos:** Modificar el endpoint de subida para que envíe los archivos a la API de Cloudinary en lugar de escribirlos en `public/`.
- **Gestión de Proyectos:** Cambiar las peticiones `POST`, `PUT` y `DELETE` para que interactúen con MongoDB a través de un ORM como **Mongoose** o **Prisma**.

### 3. Refactorización del Frontend
- **Fetching de Datos:** Actualizar `src/lib/projects.ts` para que las funciones `getProjects()`, `getProjectBySlug()`, etc., consulten la base de datos.
- **Visualización de Imágenes:** Ajustar los componentes para que utilicen las URLs devueltas por Cloudinary (ej: `https://res.cloudinary.com/...`).

### 4. Configuración de Seguridad
- Implementar un sistema de autenticación real (como **NextAuth**) para proteger la ruta `/admin`, ya que el sistema actual basado en archivos de sesión no funcionará en entornos Serverless.

### 5. Deployment
- Conectar el repositorio de GitHub a **Vercel**.
- Configurar las **Environment Variables** en Vercel:
  - `MONGODB_URI`
  - `CLOUDINARY_URL`
  - `ADMIN_PASSWORD` (o secret de NextAuth)

---

## ⚠️ Consideraciones Importantes
- **Persistencia:** En Vercel, el sistema de archivos es de "solo lectura" durante la ejecución. No se pueden guardar fotos localmente.
- **Límites Gratuitos:** Cloudinary ofrece ~25 "créditos" gratuitos mensuales (aprox. 25,000 imágenes o 25GB de banda). Es ideal para un portafolio de arquitectura.
- **SEO:** Al usar Vercel y Next.js con Server-Side Rendering (SSR), el SEO seguirá siendo excelente.

---

**Estado Actual:** La aplicación utiliza almacenamiento local en disco, optimizada para despliegue en VPS (DigitalOcean).
