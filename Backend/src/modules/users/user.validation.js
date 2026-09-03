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

  // Partnership must always be a whole number
  partnership: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required(),

  // Commission can have maximum 2 decimal places
  commission: Joi.number()
    .precision(2)
    .min(0)
    .max(100)
    .required(),
});