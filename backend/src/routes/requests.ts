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
 * /api/requests/my-requests:
 *   get:
 *     summary: Obtener solicitudes del líder autenticado
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Filtrar por instrumento requerido
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *       - in: query
 *         name: min_budget
 *         schema:
 *           type: number
 *         description: Presupuesto mínimo
 *       - in: query
 *         name: max_budget
 *         schema:
 *           type: number
 *         description: Presupuesto máximo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed, cancelled, accepted]
 *         description: Filtrar por estado
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
 *         description: Lista de solicitudes del líder obtenida exitosamente
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
 *                     pages:
 *                       type: integer
 */
router.get('/my-requests', authMiddleware, requestController.getLeaderRequests);

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

/**
 * @swagger
 * /api/requests/{id}/cancel:
 *   post:
 *     summary: Cancelar solicitud
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
 *         description: Solicitud cancelada exitosamente
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
 *                   example: Solicitud cancelada exitosamente
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/cancel', authMiddleware, requestController.cancelRequest);

/**
 * @swagger
 * /api/requests/{id}/complete:
 *   post:
 *     summary: Completar solicitud
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
 *         description: Solicitud completada exitosamente
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
 *                   example: Solicitud completada exitosamente
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/complete', authMiddleware, requestController.completeRequest);

/**
 * @swagger
 * /api/requests/my-requests:
 *   get:
 *     summary: Obtener solicitudes del usuario autenticado
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de solicitudes del usuario obtenida exitosamente
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
 *                           offers_count:
 *                             type: integer
 *                             description: Número de ofertas recibidas
 *                           selected_offer:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               proposed_price:
 *                                 type: number
 *                               musician:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
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
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-requests', authMiddleware, requestController.getUserRequests);

/**
 * @swagger
 * /api/requests/{requestId}/start:
 *   post:
 *     summary: Iniciar evento (solo músicos)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Evento iniciado exitosamente
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
 *                   example: Evento iniciado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     event_status:
 *                       type: string
 *                       example: started
 *                     started_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: El evento no puede ser iniciado en este momento
 *       403:
 *         description: Solo los músicos pueden iniciar eventos
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:requestId/start', authMiddleware, requestController.startEvent);

/**
 * @swagger
 * /api/requests/{requestId}/complete:
 *   post:
 *     summary: Completar evento (solo líderes)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Evento completado exitosamente
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
 *                   example: Evento completado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     event_status:
 *                       type: string
 *                       example: completed
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: El evento no puede ser completado en este momento
 *       403:
 *         description: Solo los líderes pueden completar eventos
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:requestId/complete', authMiddleware, requestController.completeEvent);

/**
 * @swagger
 * /api/requests/{requestId}/status:
 *   get:
 *     summary: Obtener estado del evento y controles de tiempo
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Estado del evento obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     event_status:
 *                       type: string
 *                       enum: [scheduled, started, completed, cancelled]
 *                     event_date:
 *                       type: string
 *                       format: date
 *                     start_time:
 *                       type: string
 *                       format: time
 *                     end_time:
 *                       type: string
 *                       format: time
 *                     event_started_at:
 *                       type: string
 *                       format: date-time
 *                     event_completed_at:
 *                       type: string
 *                       format: date-time
 *                     started_by_musician_id:
 *                       type: string
 *                     can_start:
 *                       type: boolean
 *                     can_complete:
 *                       type: boolean
 *                     current_time:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: No tienes permisos para ver este evento
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:requestId/status', authMiddleware, requestController.getEventStatus);

/**
 * @swagger
 * /api/requests/{requestId}/accept:
 *   post:
 *     summary: Aceptar solicitud (solo músicos)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud aceptada exitosamente
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
 *                   example: Solicitud aceptada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     musician_status:
 *                       type: string
 *                       example: accepted
 *                     accepted_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: No puedes aceptar esta solicitud en este momento
 *       403:
 *         description: Solo los músicos pueden aceptar solicitudes
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:requestId/accept', authMiddleware, requestController.acceptRequest);

/**
 * @swagger
 * /api/requests/{requestId}/reject:
 *   post:
 *     summary: Rechazar solicitud (solo músicos)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud rechazada exitosamente
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
 *                   example: Solicitud rechazada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     musician_status:
 *                       type: string
 *                       example: rejected
 *                     rejected_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: No puedes rechazar esta solicitud en este momento
 *       403:
 *         description: Solo los músicos pueden rechazar solicitudes
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:requestId/reject', authMiddleware, requestController.rejectRequest);

/**
 * @swagger
 * /api/requests/{requestId}/musician-status:
 *   get:
 *     summary: Obtener estado de la solicitud para músicos
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Estado de la solicitud obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     musician_status:
 *                       type: string
 *                       enum: [pending, accepted, rejected]
 *                     accepted_by_musician_id:
 *                       type: string
 *                     musician_response_at:
 *                       type: string
 *                       format: date-time
 *                     can_accept:
 *                       type: boolean
 *                     can_reject:
 *                       type: boolean
 *                     current_time:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:requestId/musician-status', authMiddleware, requestController.getMusicianRequestStatus);

/**
 * @swagger
 * /api/requests/{requestId}/cancel:
 *   post:
 *     summary: Cancelar solicitud (solo líderes)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón de la cancelación
 *     responses:
 *       200:
 *         description: Solicitud cancelada exitosamente
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
 *                   example: Solicitud cancelada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: cancelled
 *                     penalty_percentage:
 *                       type: number
 *                       example: 25
 *                     penalty_reason:
 *                       type: string
 *                       example: Cancelación con menos de 48 horas de anticipación
 *                     cancelled_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: No se puede cancelar la solicitud
 *       403:
 *         description: Solo los líderes pueden cancelar solicitudes
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:requestId/cancel', authMiddleware, requestController.cancelRequest);

export default router;