# GP7 React Native

Aplicacion mobile en React Native con Expo para controlar robots Unitree (`Go2` y `G1`) a traves del backend [`unitree_robot_api`](https://github.com/Horix89/unitree_robot_api).

Este repositorio contiene el cliente mobile del trabajo practico. La API REST expone autenticacion JWT, conexion al robot, movimiento, acciones predefinidas y consulta de estado.

## Objetivo

La app debe permitir:

- iniciar sesion y mantener la sesion persistida;
- conectar y desconectar un robot `go2` o `g1`;
- consultar el estado general del robot;
- enviar comandos de movimiento;
- listar y ejecutar acciones disponibles;
- mostrar feedback de exito o error para cada comando.

## Stack

- Expo `~55.0.24`
- React `19`
- React Native `0.83`
- React Navigation
- Axios
- Componentes en archivos `.jsx`

## Estado actual del repo

El proyecto hoy incluye una base minima con navegacion stack y pantallas iniciales:

- `App.js`
- `navigation/AppNavigator.jsx`
- `screens/LoginScreen.jsx`
- `screens/HomeScreen.jsx`

Todavia no esta implementada la integracion completa con la API de Unitree. Este `README` documenta el contrato esperado del backend para guiar esa implementacion.

## Backend de referencia

Backend objetivo: [`Horix89/unitree_robot_api`](https://github.com/Horix89/unitree_robot_api)

Documentacion y artefactos relevantes del backend:

- [`README.md`](https://github.com/Horix89/unitree_robot_api/blob/main/README.md)
- [`openapi.json`](https://github.com/Horix89/unitree_robot_api/blob/main/openapi.json)
- [`swagger.html`](https://github.com/Horix89/unitree_robot_api/blob/main/swagger.html)

El backend funciona como una capa REST sobre el SDK de Unitree y soporta:

- autenticacion con JWT;
- adaptadores para `Go2`, `G1` y un modo `mock`;
- endpoints protegidos para conexion, movimiento, acciones y estado;
- documentacion Swagger en `/docs` y ReDoc en `/redoc`.

## Flujo de integracion esperado

### 1. Autenticacion

La app debe trabajar con el siguiente flujo:

1. `POST /auth/register` para crear usuario.
2. `POST /auth/token` para obtener un `access_token`.
3. Enviar `Authorization: Bearer <token>` en todos los endpoints protegidos.

El campo `identifier` del login puede ser `username` o `email`.

### 2. Conexion al robot

Una vez autenticado, el usuario puede conectarse a un robot:

- `POST /connect`
- `POST /disconnect`
- `GET /status`

Body esperado para la conexion:

```json
{
  "robot_type": "go2",
  "network_interface": "eth0"
}
```

`network_interface` es opcional. Si no se envia, el backend usa su configuracion por defecto.

### 3. Movimiento

La pantalla de control debe consumir:

- `POST /move`
- `POST /stop`
- `POST /standup`
- `POST /sitdown`

Body esperado para movimiento continuo:

```json
{
  "vx": 0.3,
  "vy": 0.0,
  "vyaw": 0.5
}
```

Rangos documentados por la API:

- `vx` y `vy`: `[-1.0, 1.0]`
- `vyaw`: `[-pi, pi]`

La API tambien soporta comandos avanzados que pueden agregarse en una version posterior de la app:

- `POST /damp`
- `POST /handstand`
- `POST /freebound`
- `POST /freeavoid`
- `POST /walkupright`
- `POST /crossstep`
- `POST /freejump`

### 4. Acciones

La pantalla de acciones debe usar:

- `GET /actions`
- `POST /action/{action_name}`

Acciones listadas por el backend de referencia:

- `Go2`: `hello`, `stretch`, `dance1`, `dance2`, `heart`, `flips`, `balance_stand`, `recovery_stand`
- `G1`: `wave_hand`, `wave_hand_turn`, `shake_hand`, `high_stand`, `low_stand`
- `G1 arms`: `release_arm`, `shake_hand_arm`, `high_five`, `hug`, `clap` y otras variantes indexadas

La app no deberia hardcodear la lista de acciones como unica fuente de verdad: el flujo correcto es consultar `GET /actions` despues de conectar.

## Mapeo recomendado de pantallas

### Login

Responsabilidades:

- capturar `identifier` (email o username) y `password`;
- llamar a `POST /auth/token`;
- persistir el JWT localmente;
- redirigir a la app autenticada.

### Registro

Responsabilidades:

- capturar `username`, `email` y `password`;
- llamar a `POST /auth/register`;
- mostrar errores claros si el usuario o email ya existen;
- volver a Login despues del alta exitosa.

### Conexion

Responsabilidades:

- selector de tipo de robot: `go2` o `g1`;
- ingreso opcional de `network_interface`;
- boton conectar con `POST /connect`;
- boton desconectar con `POST /disconnect`;
- diagnostico visual usando `GET /status`.

### Control

Responsabilidades:

- habilitar controles solo con sesion activa y robot conectado;
- enviar `POST /move` desde botones o joystick virtual;
- exponer `POST /stop`, `POST /standup` y `POST /sitdown`;
- mostrar feedback de exito o error.

### Acciones

Responsabilidades:

- cargar `GET /actions` al conectar;
- renderizar botones dinamicos por accion;
- ejecutar `POST /action/{action_name}`;
- mostrar resultado de cada accion.

## Endpoints relevantes para la app

| Metodo | Ruta | Protegido | Uso en mobile |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Registro de usuario |
| POST | `/auth/token` | No | Login y obtencion de JWT |
| POST | `/connect` | Si | Conexion al robot |
| POST | `/disconnect` | Si | Desconexion |
| GET | `/status` | Si | Estado global y diagnostico |
| POST | `/move` | Si | Movimiento continuo |
| POST | `/stop` | Si | Frenado inmediato |
| POST | `/standup` | Si | Pararse |
| POST | `/sitdown` | Si | Sentarse |
| GET | `/actions` | Si | Acciones disponibles |
| POST | `/action/{action_name}` | Si | Ejecutar accion |

## Manejo de errores esperado

Segun la documentacion del backend, la app deberia contemplar al menos estos casos:

- `401`: token faltante, invalido o expirado; credenciales incorrectas;
- `404`: accion no soportada por el robot conectado;
- `409`: robot ya conectado, robot no conectado, o datos de usuario duplicados;
- `503`: error devuelto por el SDK o por la capa de control del robot.

Recomendacion para UX:

- redirigir a Login ante `401` por token expirado;
- mostrar mensajes accionables en errores `409`;
- conservar el ultimo estado conocido del robot cuando falle un comando;
- diferenciar errores de autenticacion, conectividad y comando.

## Estructura del proyecto

La estructura prevista del cliente sigue esta organizacion:

```text
components/   UI reutilizable y sin logica compleja
screens/      una pantalla por archivo
navigation/   navegacion principal
services/     cliente HTTP y wrappers de la API
hooks/        hooks reutilizables
context/      estado global de autenticacion y conexion
utils/        helpers y validaciones
config/       constantes, colores y configuracion
```

## Propuesta de servicios para la integracion

Para consumir la API de forma ordenada, conviene separar la capa HTTP en modulos como:

- `services/httpClient.js`: instancia de Axios, base URL e interceptor de token;
- `services/authService.js`: `register`, `login`, `logout`;
- `services/robotService.js`: `connect`, `disconnect`, `status`;
- `services/motionService.js`: `move`, `stop`, `standup`, `sitdown`;
- `services/actionsService.js`: `getActions`, `runAction`.

## Pruebas manuales recomendadas

1. Registrar un usuario nuevo.
2. Iniciar sesion con username.
3. Iniciar sesion con email.
4. Consultar estado inicial con `GET /status`.
5. Conectar un `go2`.
6. Listar acciones disponibles.
7. Ejecutar una accion.
8. Enviar movimiento, detener y desconectar.
9. Repetir el flujo con `g1`.
10. Validar comportamiento con token expirado o ausente.

## Referencias

- Backend de referencia: [Horix89/unitree_robot_api](https://github.com/Horix89/unitree_robot_api)
- README del backend: [README](https://github.com/Horix89/unitree_robot_api/blob/main/README.md)
- OpenAPI exportado: [openapi.json](https://github.com/Horix89/unitree_robot_api/blob/main/openapi.json)
- Swagger standalone: [swagger.html](https://github.com/Horix89/unitree_robot_api/blob/main/swagger.html)
