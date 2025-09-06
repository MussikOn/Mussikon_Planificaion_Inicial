import { Router } from 'express';
import { pricingController } from '../controllers/PricingController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PricingConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         base_hourly_rate:
 *           type: number
 *           description: Tarifa base por hora en DOP
 *         minimum_hours:
 *           type: number
 *           description: Horas mínimas de servicio
 *         maximum_hours:
 *           type: number
 *           description: Horas máximas de servicio
 *         platform_commission:
 *           type: number
 *           description: Comisión de la plataforma (0-1)
 *         service_fee:
 *           type: number
 *           description: Tarifa de servicio fija en DOP
 *         tax_rate:
 *           type: number
 *           description: Tasa de impuesto (0-1)
 *         currency:
 *           type: string
 *           description: Moneda
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *     
 *     PriceCalculation:
 *       type: object
 *       properties:
 *         base_hourly_rate:
 *           type: number
 *         hours:
 *           type: number
 *         subtotal:
 *           type: number
 *         platform_commission:
 *           type: number
 *         service_fee:
 *           type: number
 *         tax:
 *           type: number
 *         total:
 *           type: number
 *         musician_earnings:
 *           type: number
 */

/**
 * @swagger
 * /api/pricing/config:
 *   get:
 *     summary: Get current pricing configuration
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pricing configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PricingConfig'
 *       500:
 *         description: Internal server error
 */
router.get('/config', authMiddleware, pricingController.getPricingConfig);

/**
 * @swagger
 * /api/pricing/config:
 *   put:
 *     summary: Update pricing configuration
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base_hourly_rate:
 *                 type: number
 *               minimum_hours:
 *                 type: number
 *               maximum_hours:
 *                 type: number
 *               platform_commission:
 *                 type: number
 *               service_fee:
 *                 type: number
 *               tax_rate:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pricing configuration updated successfully
 *       403:
 *         description: Admin access required
 *       400:
 *         description: Invalid pricing data
 *       500:
 *         description: Internal server error
 */
router.put('/config', authMiddleware, adminMiddleware, pricingController.updatePricingConfig);

/**
 * @swagger
 * /api/pricing/calculate:
 *   get:
 *     summary: Calculate price for a request
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_time
 *         required: true
 *         schema:
 *           type: string
 *           format: time
 *         description: Start time (HH:MM)
 *       - in: query
 *         name: end_time
 *         required: true
 *         schema:
 *           type: string
 *           format: time
 *         description: End time (HH:MM)
 *       - in: query
 *         name: custom_rate
 *         schema:
 *           type: number
 *         description: Custom hourly rate (optional)
 *     responses:
 *       200:
 *         description: Price calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PriceCalculation'
 *       400:
 *         description: Invalid time parameters
 *       500:
 *         description: Internal server error
 */
// Public endpoint for price calculation (no auth required)
router.get('/calculate', pricingController.calculatePrice);

/**
 * @swagger
 * /api/pricing/history:
 *   get:
 *     summary: Get pricing configuration history
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pricing history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PricingConfig'
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/history', authMiddleware, adminMiddleware, pricingController.getPricingHistory);

/**
 * @swagger
 * /api/pricing/initialize:
 *   post:
 *     summary: Initialize default pricing configuration
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default pricing initialized successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/initialize', authMiddleware, adminMiddleware, pricingController.initializeDefaultPricing);

export default router;
