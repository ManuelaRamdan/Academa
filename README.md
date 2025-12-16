# Academa Frontend - Sistema de Gestión Escolar

Proyecto Fronted para la aplicacion Academa, diseñado para facilitar la gestión de notas y asistencias. Está construido utilizando React y Vite, consumiendo la API desarrollada en el stack MERN.

## ⚙️ Configuración del entorno
### 1. Software necesario
Para correr el proyecto se necesita tener instalado:

* Node.js (recomendado v18 o superior)
* npm (gestor de paquetes)
* Git (opcional, para clonar el repositorio)

### 2. Instalación del proyecto
- Clonar el repositorio:
```text
git clone https://github.com/ManuelaRamdan/Academa.git
```
- Acceder a la carpeta del proyecto:
```text
cd academa
```
- Instalar las dependencias:
```text
npm install
```
### 3. Variables de entorno
```text
VITE_API_URL=http://localhost:3000
```
### 4. Modos de ejecución

- Modo desarrollo :
```text
npm run dev
```

## Estructura del proyecto
```text
📦 academa
├── 📁 public             # Archivos estáticos (Logo, iconos)
├── 📁 src
│   ├── 📁 components     # Componentes reutilizables (Admin, AlumnoAcordeon, etc.)
│   ├── 📁 context        # Gestión del estado global (Autenticación)
│   ├── 📁 pages          # Vistas principales divididas por roles (Admin, Padre, Profesor)
│   ├── 📁 router         # Configuración de rutas con React Router
│   ├── 📁 services       # Llamadas a la API mediante Axios
│   ├── 📁 styles         # Archivos de estilos CSS
│   ├── App.jsx           # Componente raíz
│   └── main.jsx          # Punto de entrada de la aplicación
├── .env                  # Variables de entorno
├── eslint.config.js      # Configuración de linter
├── index.html            # Plantilla HTML principal
├── package.json          # Scripts y dependencias
└── vite.config.js        # Configuración de Vite


```

## Librerías Utilizadas

| Librería               | Propósito                                                                 |
|------------------------|---------------------------------------------------------------------------|
| **React 19**           | Biblioteca principal para construir la interfaz de usuario basada en componentes. |
| **Vite**               | Herramienta de construcción (build tool) ultra rápida para el desarrollo frontend. |
| **Axios**              | Cliente HTTP para realizar peticiones a la API del backend.               |
| **React Router Dom**   | Gestión de la navegación y rutas dinámicas de la aplicación.              |
| **React Icons**        | Set de iconos vectoriales para mejorar la experiencia visual.             |
| **React Loader Spinner** | Componentes de carga (spinners) para mejorar el feedback visual durante procesos asíncronos. |
