import express from 'express';

import { registerOwnerController, loginController, getMeController } from './auth.controller.js';
import { registerOwnerSchema, loginSchema } from './auth.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// create owner account
router.post(
  '/register-owner',
  validate(registerOwnerSchema),
  registerOwnerController
);

// login user
router.post(
  '/login',
  validate(loginSchema),
  loginController
);

// get current user's information
router.get(
  '/me',
  authenticate,
  getMeController
);

export default router;