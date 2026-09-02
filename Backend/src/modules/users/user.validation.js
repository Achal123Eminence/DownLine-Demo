import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(30)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .max(72)
    .required(),

  partnership: Joi.number()
    .min(0)
    .max(100)
    .required(),

  commission: Joi.number()
    .min(0)
    .max(100)
    .required(),
});