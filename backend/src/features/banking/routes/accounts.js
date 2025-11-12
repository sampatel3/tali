import express from 'express';
import {
  createLinkToken,
  exchangeToken,
  getAccounts,
  syncAccount,
  deleteAccount
} from '../../../controllers/accountController.js';

const router = express.Router();

router.post('/link/token', createLinkToken);
router.post('/link/exchange', exchangeToken);
router.get('/', getAccounts);
router.post('/:id/sync', syncAccount);
router.delete('/:id', deleteAccount);

export default router;
