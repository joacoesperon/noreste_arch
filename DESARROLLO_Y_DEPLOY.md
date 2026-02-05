# Guía de Despliegue y Publicación - Noreste Arch

Este documento detalla los pasos técnicos para poner la web en producción y las opciones de infraestructura.

## 1. Infraestructura Necesaria

Para una web profesional de arquitectura, necesitas dos cosas:

### A. Dominio (La dirección)
- **Recomendación**: Comprar un dominio `.com` o `.uy` (ej: `norestearq.com`).
- **Dónde**: [Namecheap](https://www.namecheap.com/) o [GoDaddy] para `.com`. Para `.uy`, usa [NIC.uy](https://www.nic.uy/).
- **Costo**: Aprox. $10 - $15 USD al año.

### B. Hosting (Dónde vive el código)
Aquí tienes dos caminos según el presupuesto y necesidad:

#### Opción 1: Vercel (Gratis/Fácil) - *La que usaremos para mostrar el progreso*
- **Pros**: Increíblemente rápido, SSL (https) gratis, despliegue automático desde GitHub.
- **Contras**: **No permite el panel de administración actual**. Vercel es "Serverless", lo que significa que no tiene un disco duro permanente. Si subes una foto por el `/admin`, se borrará al poco tiempo.
- **Uso ideal**: Webs estáticas o que usan bases de datos externas.

#### Opción 2: VPS (Servidor Privado Virtual) - *Recomendado para el Admin actual*
- **Pros**: Tienes tu propio "disco duro" virtual. El panel de administración funcionará perfecto y las fotos se quedarán ahí para siempre.
- **Dónde**: [DigitalOcean](https://www.digitalocean.com/) o [Hetzner].
- **Costo**: Aprox. $5 - $10 USD al mes.

---

## 2. Cómo publicar en Vercel (Para mostrar a los arquitectos)

Para que los arquitectos vean cómo va quedando la web:

1.  **Sube tu código a GitHub** (como venimos haciendo).
2.  Entra en [Vercel.com](https://vercel.com/) y crea una cuenta con tu GitHub.
3.  Haz clic en **"Add New" > "Project"**.
4.  Importa el repositorio `noreste_arq`.
5.  Vercel detectará que es un proyecto de Next.js. Dale a **"Deploy"**.
6.  **¡Listo!** Te dará una URL tipo `noreste-arq.vercel.app`.

**Nota importante para Vercel**: Para que los arquitectos vean proyectos nuevos en Vercel, deberás crearlos tú en tu computadora localmente, y luego hacer un `git push`. Las fotos que ellos suban directamente a la web de Vercel no se guardarán permanentemente.

---

## 3. Workflow de Actualización
1. Realizas cambios en tu PC.
2. `git add .`
3. `git commit -m "mejoras"`
4. `git push origin main`
5. El servidor (Vercel o VPS) se actualizará automáticamente.
