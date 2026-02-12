# Guía de Despliegue y Publicación - Noreste Arch

Este documento detalla los pasos técnicos para poner la web en producción y las opciones de infraestructura.

## 1. Infraestructura Necesaria

Para una web profesional de arquitectura, necesitas dos cosas:

### A. Dominio (La dirección)
- **Recomendación**: Comprar un dominio `.com` o `.uy` (ej: `norestearch.com`).
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
