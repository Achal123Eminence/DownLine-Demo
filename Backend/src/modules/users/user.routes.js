import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

import { createUserSchema } from './user.validation.js';
import { createUserController, getMyDownlineController, getUserDownlineController } from './user.controller.js';

const router = express.Router();

// create down-line user
router.post(
  '/create-user',
  authenticate,
  validate(createUserSchema),
  createUserController
);

// Get MY down-line users
router.get(
  '/down-line-users',
  authenticate,
  getMyDownlineController
);

// Get USER down-line users
router.get(
  '/:userId/down-line-users',
  authenticate,
  getUserDownlineController
);

export default router;