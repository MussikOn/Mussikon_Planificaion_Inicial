import express, { Router } from 'express';
import { OfferController } from '../controllers/OfferController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createOfferSchema } from '../middleware/schemas';

const router: Router = express.Router();
const offerController = new OfferController();

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Obtener ofertas musicales
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: request_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de solicitud
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, selected, rejected]
 *         description: Filtrar por estado de la oferta
 *     responses:
 *       200:
 *         description: Lista de ofertas obtenida exitosamente
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
 *                       - $ref: '#/components/schemas/Offer'
 *                       - type: object
 *                         properties:
 *                           request:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Request'
 *                               - type: object
 *                                 properties:
 *                                   leader:
 *                                     $ref: '#/components/schemas/User'
 *                           musician:
 *                             $ref: '#/components/schemas/User'
 */
router.get('/', authMiddleware, offerController.getOffers);

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Crear nueva oferta musical
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - proposed_price
 *               - availability_confirmed
 *             properties:
 *               request_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               proposed_price:
 *                 type: number
 *                 minimum: 600
 *                 example: 1200
 *               availability_confirmed:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: Estoy disponible para el servicio dominical
 *     responses:
 *       201:
 *         description: Oferta creada exitosamente
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
 *                   example: Oferta creada exitosamente
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Offer'
 *                     - type: object
 *                       properties:
 *                         request:
 *                           allOf:
 *                             - $ref: '#/components/schemas/Request'
 *                             - type: object
 *                               properties:
 *                                 leader:
 *                                   $ref: '#/components/schemas/User'
 *                         musician:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo músicos pueden crear ofertas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, validateRequest(createOfferSchema), offerController.createOffer);

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Obtener oferta por ID
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Oferta obtenida exitosamente
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
 *                     - $ref: '#/components/schemas/Offer'
 *                     - type: object
 *                       properties:
 *                         request:
 *                           allOf:
 *                             - $ref: '#/components/schemas/Request'
 *                             - type: object
 *                               properties:
 *                                 leader:
 *                                   $ref: '#/components/schemas/User'
 *                         musician:
 *                           $ref: '#/components/schemas/User'
 *       404:
 *         description: Oferta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, offerController.getOfferById);

/**
 * @swagger
 * /api/offers/{id}/select:
 *   put:
 *     summary: Seleccionar oferta
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Oferta seleccionada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: No autorizado para seleccionar esta oferta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oferta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/select', authMiddleware, offerController.selectOffer);

/**
 * @swagger
 * /api/offers/{id}/reject:
 *   put:
 *     summary: Rechazar oferta
 *     tags: [Ofertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Oferta rechazada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: No autorizado para rechazar esta oferta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oferta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/reject', authMiddleware, offerController.rejectOffer);

export default router;