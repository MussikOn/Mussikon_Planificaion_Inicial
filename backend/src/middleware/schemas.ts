import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('leader', 'musician').required(),
  church_name: Joi.string().min(2).max(100).when('role', {
    is: 'leader',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  location: Joi.string().min(2).max(200).optional(),
  instruments: Joi.array().items(
    Joi.object({
      instrument: Joi.string().required(),
      years_experience: Joi.number().min(0).max(50).required()
    })
  ).when('role', {
    is: 'musician',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  verificationCode: Joi.string().length(6).pattern(/^[0-9]+$/).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const createRequestSchema = Joi.object({
  event_type: Joi.string().min(2).max(100).required(),
  event_date: Joi.date().iso().required(),
  start_time: Joi.string().required(),
  end_time: Joi.string().required(),
  location: Joi.string().min(2).max(200).required(),
  extra_amount: Joi.number().min(0).optional(),
  description: Joi.string().max(1000).optional(),
  required_instrument: Joi.string().required()
});

export const createOfferSchema = Joi.object({
  request_id: Joi.string().uuid().required(),
  proposed_price: Joi.number().min(600).required(),
  availability_confirmed: Joi.boolean().required(),
  message: Joi.string().max(500).optional()
});

export const validationSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  action: Joi.string().valid('approve', 'reject', 'pending').required(),
  reason: Joi.string().max(500).optional()
});

export const sendVerificationEmailSchema = Joi.object({
  email: Joi.string().email().required()
});
