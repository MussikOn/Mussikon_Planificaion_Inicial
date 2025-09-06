import express, { Router } from 'express';
import { RequestController } from '../controllers/RequestController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createRequestSchema } from '../middleware/schemas';

const router: Router = express.Router();
const requestController = new RequestController();

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Obtener solicitudes musicales
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Filtrar por instrumento requerido
 *         example: Guitarrista
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *         example: Santo Domingo
 *       - in: query
 *         name: min_budget
 *         schema:
 *           type: number
 *         description: Presupuesto mínimo
 *         example: 1000
 *       - in: query
 *         name: max_budget
 *         schema:
 *           type: number
 *         description: Presupuesto máximo
 *         example: 3000
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *         example: Servicio Dominical
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Request'
 *                       - type: object
 *                         properties:
 *                           leader:
 *                             $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', authMiddleware, requestController.getRequests);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Crear nueva solicitud musical
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_type
 *               - event_date
 *               - location
 *               - budget
 *               - required_instrument
 *             properties:
 *               event_type:
 *                 type: string
 *                 example: Servicio Dominical
 *               event_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:00:00Z
 *               location:
 *                 type: string
 *                 example: Iglesia Central, Santo Domingo
 *               budget:
 *                 type: number
 *                 minimum: 600
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: Necesitamos guitarrista para el servicio dominical
 *               required_instrument:
 *                 type: string
 *                 example: Guitarrista
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
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
 *                   example: Solicitud creada exitosamente
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Request'
 *                     - type: object
 *                       properties:
 *                         leader:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, validateRequest(createRequestSchema), requestController.createRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Request'
 *                     - type: object
 *                       properties:
 *                         leader:
 *                           $ref: '#/components/schemas/User'
 *                         offers:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Offer'
 *                               - type: object
 *                                 properties:
 *                                   musician:
 *                                     $ref: '#/components/schemas/User'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, requestController.getRequestById);

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Actualizar solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_type:
 *                 type: string
 *                 example: Servicio Dominical
 *               event_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:00:00Z
 *               location:
 *                 type: string
 *                 example: Iglesia Central, Santo Domingo
 *               budget:
 *                 type: number
 *                 minimum: 600
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: Necesitamos guitarrista para el servicio dominical
 *               required_instrument:
 *                 type: string
 *                 example: Guitarrista
 *               status:
 *                 type: string
 *                 enum: [active, closed, cancelled]
 *                 example: active
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: No autorizado para actualizar esta solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authMiddleware, requestController.updateRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Eliminar solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: No autorizado para eliminar esta solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authMiddleware, requestController.deleteRequest);

export default router;