import Joi from 'joi';

export const registerOwnerSchema = Joi.object({
  username: Joi.string().trim().lowercase().min(3).max(30).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});