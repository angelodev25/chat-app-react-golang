# Chat App

## Descripción del Proyecto

Aplicación de chat que permite a los usuarios registrarse e inmediatamente comenzar a chatear con cualquier otro usuario mediante mensajes instantáneos. La aplicación consta de un backend desarrollado en Go utilizando el framework Fiber y un frontend desarrollado en React con Vite. Comunicación en tiempo real a través de WebSockets, autenticación JWT, y almacenamiento de datos en PostgreSQL y SQLite.

El principal obetivo es hacer la aplicación lo más segura y privada poible para los usuarios.

Las funcionalidades integradas hasta ahora son: Creación y eliminación de chats, actualización de información de perfil, eliminación de mensanjes.

Los mensajes son almacenado en una base de datos SQlite en un directorio específico para cada usuario, al igual su foto de perfil.

### Funcionalidades faltantes

- Se debe implementar métodos de seguridad de comunicación entre cliente y servidor (https, encriptación...)

## Capturas de pantalla

![imagen 1](./images/Screenshots/Captura%20de%20pantalla_2026-04-12_17-19-54.png)

![imagen 2](./images/Screenshots/Captura%20de%20pantalla_2026-04-12_17-20-23.png)

![imagen 3](./images/Screenshots/Captura%20de%20pantalla_2026-04-12_17-29-50.png)

![imagen 4](./images/Screenshots/Captura%20de%20pantalla_2026-04-12_17-30-39.png)

![imagen 5](./images/Screenshots/Captura%20de%20pantalla_2026-04-12_17-35-22.png)

![imagen 6](./images/Screenshots/Captura%20de%20pantalla_2026-04-12_17-38-18.png)

## Tecnologías Utilizadas

### Backend
- **Lenguaje**: Go 1.25.7
- **Framework Web**: Fiber v2 (para manejo de HTTP y WebSockets)
- **Base de Datos**: PostgreSQL (con driver lib/pq) y SQLite (con modernc.org/sqlite)
- **Autenticación**: JWT (JSON Web Tokens) con github.com/golang-jwt/jwt/v5
- **WebSockets**: Para comunicación en tiempo real
- **CORS**: Middleware para manejo de cross-origin requests
- **UUID**: Generación de identificadores únicos con github.com/google/uuid

### Frontend
- **Lenguaje**: TypeScript
- **Framework**: React 19.2.0 con Vite
- **UI Library**: Material-UI (MUI) con Emotion para estilos
- **Estilos**: TailwindCSS para utilidades CSS
- **Routing**: React Router DOM
- **Formularios**: React Hook Form con Zod para validación
- **HTTP Client**: Axios para llamadas a la API
- **WebSockets**: WebSocket nativo del navegador
- **Notificaciones**: Sonner para toasts
- **Iconos**: Material-UI Icons y Lucide React

### Herramientas de Desarrollo
- **Backend**: Makefile para automatización de tareas
- **Frontend**: ESLint para linting, Vite para desarrollo y build
- **Control de Versiones**: Git

## Arquitectura

La aplicación sigue una arquitectura cliente-servidor con separación clara entre frontend y backend.

### Backend (Go/Fiber)
- **Estructura de Carpetas**:
  - `cmd/`: Punto de entrada (main.go)
  - `controllers/`: Controladores para manejar requests HTTP
  - `models/`: Definición de estructuras de datos (User, Chat, Message)
  - `routes/`: Definición de rutas públicas y privadas
  - `services/`: Lógica de negocio, incluyendo hubs para WebSockets
  - `middleware/`: Middleware JWT para autenticación
  - `database/`: Configuración e inicialización de la base de datos
  - `utils/`: Utilidades auxiliares
  - `users_storage/`: Almacenamiento de archivos de usuario (uploads)

- **WebSockets**: Utiliza dos hubs principales:
  - `ChatsHub`: Maneja conexiones WebSocket para chats específicos
  - `UsersHub`: Maneja conexiones para estado online de usuarios

- **Autenticación**: Las rutas privadas requieren un token JWT válido.

### Frontend (React/Vite)
- **Estructura de Carpetas**:
  - `src/`: Código fuente
    - `components/`: Componentes reutilizables (UI, Chat, Sidebar)
    - `pages/`: Páginas principales (Main, Login)
    - `contexts/`: Contextos de React para estado global (auth, chat)
    - `auth/`: Componentes de autenticación (ProtectedRoute)
    - `types/`: Definiciones de tipos TypeScript
    - `utils/`: Utilidades (tema MUI, etc.)

- **Estado Global**: Utiliza React Context para manejar autenticación de usuario, estado de chats y manejo de selección del tema.

- **WebSockets**: Conecta a los endpoints del backend para recibir actualizaciones en tiempo real.

## Instalación

### Prerrequisitos
- Go 1.25.7 o superior
- Node.js y npm
- PostgreSQL y SQLite (opcional para visualizar DB de mensajes) 

### Inicialización
- En el directorio raíz ejecutar `make run`, se instalarán todas las dependencias e iniciará el programa

   La aplicación estará disponible en `http://localhost:5174`.

## Uso

1. **Registro/Login**: Los usuarios pueden registrarse o iniciar sesión desde la página de login.

2. **Chats**: Una vez autenticados, los usuarios ven una lista de chats en la sidebar.

3. **Mensajes**: Al seleccionar un chat, se cargan los mensajes y se puede enviar nuevos mensajes en tiempo real.

4. **Funcionalidades Adicionales**:
   - Actualizar perfil de usuario
   - Selección de tres temas de colores para la UI
   - Eliminar mensajes y chats
   - Estado online de usuarios

## API Endpoints

### Rutas Públicas (sin autenticación)
- `POST /api/user/register`: Registrar un nuevo usuario
- `POST /api/user/login`: Iniciar sesión

### Rutas Privadas (requieren JWT)
- `GET /api/user/verify`: Verificar token y obtener información del usuario
- `GET /api/chats`: Obtener lista de chats del usuario
- `GET /api/chat/:chatId`: Obtener mensajes de un chat específico
- `POST /api/chats`: Crear un nuevo chat
- `PUT /api/user/update`: Actualizar información del usuario
- `DELETE /api/chat/:chatId/msg/:messageId`: Eliminar un mensaje
- `DELETE /api/chat/:chatId`: Eliminar un chat

### WebSocket Endpoints
- `GET /api/ws/:chatId`: Conectar a un chat específico para mensajes en tiempo real
- `GET /api/ws/connect/chat`: Conectar para actualizaciones de estado de chats

## Eventos WebSocket

### UsersHub (Estado de Chats)
- **Nuevo Chat**: Recibe un objeto `Chat` cuando se crea un nuevo chat.
- **Mensaje Nuevo**: Recibe un objeto con `code: "message"` y el mensaje actualizado.
- **Mensaje Eliminado**: Recibe un objeto con `code: "delete-single`o `code: "delete-all"` (eliminar solo para él o para ambos) y con el ID del mensaje en `content`.
- **Chat Eliminado**: Recibe un objeto con `code: "delete"` y el ID del chat eliminado.

### ChatsHub (Mensajes en Chat)
- Maneja envío y recepción de mensajes en tiempo real dentro de un chat específico.

## Estructura del Proyecto

```
chat_app/
├── Backend/
│   ├── cmd/
│   │   └── main.go
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── users_storage/
│   └── utils/
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── auth/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── Makefile
└── README.md
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request