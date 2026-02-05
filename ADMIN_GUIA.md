# Guía de Administración - Noreste Arch

Esta guía explica el funcionamiento del panel de administración para mantener el catálogo de proyectos actualizado.

## 1. Acceso
- **URL**: `/admin`
- **Contraseña**: `norestearq2024`

## 2. Gestión de Proyectos

### Crear un Nuevo Proyecto
1. Completa la **Información General**:
   - **Título**: Nombre del proyecto.
   - **Slug**: Se genera automáticamente (es la dirección web del proyecto).
   - **Estado**: Selecciona entre *Proyecto*, *Construido* o *En obra*.
   - **Ubicación**: Sigue el formato `Localidad, Departamento, País`.
2. Completa los **Créditos**: Rellena los campos correspondientes (Proyecto, Equipo, Obra, etc.). Si un campo no aplica, déjalo vacío.
3. **Visibilidad**: Asegúrate de que el checkbox "Visible en web" esté marcado para que aparezca en el índice y home.
4. **Guardar**: Haz clic en "Crear Proyecto".

### Editar o Eliminar
- En la parte inferior verás la lista de **Proyectos Actuales**.
- **Editar**: Carga los datos del proyecto en el formulario superior para modificarlos.
- **Eliminar**: Borra el proyecto y sus imágenes permanentemente.

## 3. Manejo de Imágenes

El sistema organiza las imágenes en dos categorías para crear un recorrido narrativo:

1. **Exteriores**: Son las primeras que ve el usuario. Se usan para mostrar el contexto y la volumetría.
2. **Interiores**: Se muestran después de los exteriores para enseñar la espacialidad y materialidad.

### Cómo subir imágenes:
- Puedes seleccionar varios archivos a la vez para cada categoría.
- **Nombres**: Puedes usar cualquier nombre (ej: `fachada casa.jpg`, `cocina-01.png`). El sistema limpia automáticamente espacios y caracteres especiales para evitar errores.
- Al guardar, el sistema crea automáticamente las carpetas necesarias en el servidor.
- **Imagen de Portada**: El sistema utiliza automáticamente la **primera imagen de la lista de Exteriores** como imagen principal para el Feed de la Home y para el hover en el Índice.

## 4. Consejos Importantes
- **Tamaño de Imágenes**: Intenta que las imágenes no pesen más de 1MB para asegurar que la web cargue rápido. Formatos recomendados: `.jpg` o `.webp`.