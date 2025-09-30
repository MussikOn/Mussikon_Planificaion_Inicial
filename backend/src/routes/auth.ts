import express, { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema, sendVerificationEmailSchema } from '../middleware/schemas';

const router: Router = express.Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: |
 *       Este endpoint permite a un nuevo usuario registrarse en la aplicación.
 *       El flujo de trabajo incluye la validación de los datos de entrada,
 *       la creación de un nuevo usuario en la base de datos, el hashing de la contraseña,
 *       y el envío de un email de verificación de registro. Depende de los esquemas de validación
 *       (`registerSchema`) y del controlador de autenticación (`AuthController.register`).
 *       Después de un registro exitoso, el usuario debe verificar su email para activar la cuenta.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [leader, musician]
 *                 example: leader
 *               church_name:
 *                 type: string
 *                 example: Iglesia Central
 *               location:
 *                 type: string
 *                 example: Santo Domingo, RD
 *               instruments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     instrument:
 *                       type: string
 *                       example: Guitarrista
 *                     years_experience:
 *                       type: integer
 *                       example: 5
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: |
 *       Este endpoint permite a los usuarios autenticarse en la aplicación.
 *       El flujo incluye la validación de credenciales (email y contraseña),
 *       verificación del hash de contraseña en la base de datos,
 *       y generación de un token JWT para sesiones autenticadas.
 *       Depende del esquema de validación (`loginSchema`) y del controlador (`AuthController.login`).
 *       Tras un login exitoso, el token JWT debe incluirse en el header Authorization
 *       de las solicitudes subsiguientes.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateRequest(loginSchema), authController.login);

router.post('/send-verification-email', validateRequest(sendVerificationEmailSchema), authController.sendRegistrationVerificationCode);

/**
 * @swagger
 * /api/auth/send-verification-email:
 *   post:
 *     summary: Enviar email de verificación
 *     description: |
 *       Este endpoint permite solicitar el envío de un email de verificación
 *       para activar la cuenta de un usuario recién registrado. El flujo implica
 *       la validación del email, la generación de un código de verificación
 *       numérico, el almacenamiento de este código en la base de datos
 *       asociado al usuario, y el envío del email. Depende del esquema de validación
 *       (`sendVerificationEmailSchema`) y del controlador (`AuthController.sendRegistrationVerificationCode`).
 *       Este endpoint es crucial para el proceso de activación de cuenta.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *     responses:
 *       200:
 *         description: Email de verificación enviado (si el usuario existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Si el email existe en nuestro sistema, recibirás un enlace de verificación.
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar email con código numérico
 *     description: |
 *       Este endpoint se utiliza para verificar el email de un usuario
 *       mediante un código numérico de 6 dígitos que fue enviado previamente.
 *       El flujo de trabajo implica la validación del código y el email,
 *       la búsqueda del token de verificación en la base de datos,
 *       la verificación de su validez y expiración, y la actualización del estado
 *       del usuario a 'verificado' si el código es correcto. Depende del controlador
 *       (`AuthController.verifyEmail`).
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - email
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *                 description: Código de verificación de 6 dígitos
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *                 description: Email del usuario a verificar
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verificado exitosamente. Tu cuenta ha sido activada.
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/auth/validate-verification-token/{token}:
 *   get:
 *     summary: Validar token de verificación de email
 *     description: |
 *       Este endpoint se utiliza para validar un token de verificación de email
 *       enviado por URL (por ejemplo, desde un enlace en un email). El flujo
 *       implica la extracción del token de la URL, la búsqueda en la base de datos,
 *       y la verificación de su validez y expiración. Depende del controlador
 *       (`AuthController.validateVerificationToken`). Este endpoint es útil
 *       para activar cuentas directamente desde un enlace.
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación de email
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token de verificación válido
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/verify-email', authController.verifyEmail);
router.get('/validate-verification-token/:token', authController.validateVerificationToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: |
 *       Este endpoint permite a un usuario autenticado cerrar su sesión.
 *       El flujo de trabajo implica la invalidación del token de autenticación
 *       (si aplica, por ejemplo, eliminándolo de una lista negra o expirándolo
 *       en el lado del servidor) y la eliminación de la sesión del lado del cliente.
 *       Depende del controlador (`AuthController.logout`). Requiere que el usuario
 *       esté autenticado para acceder a este endpoint.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: |
 *       Envía un email con un código de verificación de 6 dígitos al usuario
 *       para permitir el restablecimiento de contraseña. El código tiene una
 *       validez de 1 hora.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *                 description: Email registrado en la aplicación
 *     responses:
 *       200:
 *         description: Email de recuperación enviado (si el usuario existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con código de verificación
 *     description: |
 *       Permite establecer una nueva contraseña usando el código de verificación
 *       enviado al email del usuario. Requiere código válido, email y nueva contraseña.
 *       La nueva contraseña debe tener al menos 8 caracteres.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - email
 *               - new_password
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *                 description: Código de verificación de 6 dígitos recibido por email
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *                 description: Email asociado al código de verificación
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *                 example: nuevaContraseña123
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: Token de autenticación para iniciar sesión automáticamente
 *       400:
 *         description: Código inválido, expirado o contraseña no cumple requisitos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/validate-reset-code:
 *   post:
 *     summary: Validar código de recuperación de contraseña
 *     description: |
 *       Verifica si el código de recuperación es válido y no ha expirado
 *       (1 hora de validez). Se usa antes de permitir el cambio de contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - email
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *                 description: Código de verificación de 6 dígitos recibido por email
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *                 description: Email asociado al código de verificación
 *     responses:
 *       200:
 *         description: Código válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Código de verificación válido
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T12:00:00Z"
 *                   description: Fecha y hora de expiración del código
 *       400:
 *         description: Código inválido, expirado o email incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/validate-reset-code', authController.validateResetCode);

/**
 * @swagger
 * /api/auth/request-registration-verification-code:
 *   post:
 *     summary: Solicitar un nuevo código de verificación para el registro
 *     description: |
 *       Este endpoint permite a un usuario que ya se ha registrado pero no ha
 *       verificado su email, solicitar un nuevo código de verificación.
 *       El flujo implica la validación del email, la invalidación de cualquier
 *       código de verificación anterior para ese usuario, la generación de un
 *       nuevo código numérico, su almacenamiento en la base de datos y el envío
 *       del email con el nuevo código. Depende del controlador
 *       (`AuthController.requestRegistrationVerificationCode`).
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *     responses:
 *       200:
 *         description: Nuevo código de verificación enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Nuevo código de verificación enviado exitosamente.
 *       400:
 *         description: Error de validación o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


export default router;