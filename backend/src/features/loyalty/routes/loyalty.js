import express from 'express';
import {
  getLoyaltyPrograms,
  getUserLoyaltyCards,
  getLoyaltyCard,
  addLoyaltyCard,
  updateLoyaltyCard,
  deleteLoyaltyCard,
  getLoyaltyTransactions,
  syncLoyaltyCard,
  getSuggestions
} from '../../../controllers/loyaltyController.js';

const router = express.Router();

router.get('/programs', getLoyaltyPrograms);
router.get('/cards', getUserLoyaltyCards);
router.get('/cards/:id', getLoyaltyCard);
router.post('/cards', addLoyaltyCard);
router.put('/cards/:id', updateLoyaltyCard);
router.delete('/cards/:id', deleteLoyaltyCard);
router.get('/transactions', getLoyaltyTransactions);
router.post('/cards/:id/sync', syncLoyaltyCard);
router.get('/suggestions', getSuggestions);

export default router;
