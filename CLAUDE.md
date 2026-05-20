@AGENTS.md

# Proyecto: Control de Robot Unitree desde App Móvil

App React Native para controlar un robot Unitree (Go2 cuadrúpedo o G1 humanoide) via API REST provista por la cátedra (servidor en red del laboratorio).

## Stack técnico
- React Native con Expo v55
- React Navigation (native stack)
- Axios para consumo de APIs
- Archivos de componentes con extensión `.jsx`

## Estructura de directorios
```
components/   # UI pura sin lógica (botones, tarjetas)
screens/      # Una pantalla por archivo
navigation/   # Stack, Tab y Drawer navigators
services/     # Clientes HTTP y comunicación con APIs
hooks/        # Hooks reutilizables
context/      # React Contexts (auth, tema global)
utils/        # Helpers: formateo, validaciones
config/       # Constantes, colores, temas
```

## Pantallas requeridas

### 1. Pantalla de Conexión
- Selector tipo de robot: `go2` (cuadrúpedo) o `g1` (humanoide)
- Diferenciación visual por robot (UI o íconos distintos)
- Campo de texto para interfaz de red (valor por defecto: `eth0`)
- Botón Conectar → `POST /connect`
- Botón Desconectar → `POST /disconnect`
- Indicador visual: conectado / desconectado / error
- Diagnóstico: JSON completo de `GET /status`
- Reconexión automática al detectar pérdida de estado

### 2. Pantalla de Control de Movimiento
- Habilitada solo si el robot está conectado
- Direccionales: adelante, atrás, izquierda, derecha → `POST /move` (vx, vy, vyaw)
- Botón Detener → `POST /stop`
- Botón Pararse → `POST /standup`
- Botón Sentarse → `POST /sitdown`
- Joystick virtual con vx, vy, vyaw variables
- Feedback visual por acción (éxito / error)

### 3. Pantalla de Acciones
- Al conectar: cargar lista → `GET /actions`
- Mostrar acciones como lista o grilla de botones
- Al presionar → `POST /action/{nombre}`
- Feedback visual del resultado
- Historial de comandos con timestamp

### 4. Estado Global de Conexión
- Consultar `GET /status` al iniciar la app
- Mostrar estado en todas las pantallas (header)

### 5. Login
- Campos: email y contraseña
- Sesión persistente (no pedir login al reabrir la app)
- Enlace a pantalla de Registro
- Botón "Cerrar sesión" accesible desde cualquier pantalla
- Las pantallas de control son accesibles únicamente con sesión activa

### 6. Registro
- Campos: nombre de usuario, email, contraseña, confirmar contraseña
- `POST` al servidor con los datos
- Si exitoso: redirige a Login
- Si email/usuario ya existe: mostrar error claro

### 7. Historial de Comandos
- Cada comando enviado se guarda en el servidor asociado al usuario
- Muestra: acción ejecutada, éxito/fallo, timestamp
- Historial personal: cada usuario ve solo sus propios comandos

## Entrega
- Repositorio público en GitHub con el código fuente
- Demo en vivo durante la clase de entrega
- Swagger de la API: adjunto al repositorio del laboratorio
- Repositorio Unitree: https://github.com/unitreerobotics
