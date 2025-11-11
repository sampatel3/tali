import express from 'express';
import {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  detectSubscriptions
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/', getSubscriptions);
router.get('/:id', getSubscription);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/detect', detectSubscriptions);

export default router;
