import express from 'express';
import { checkAvailability } from '../controllers/AvailabilityController';

const router = express.Router();

router.post('/check', checkAvailability);

export default router;