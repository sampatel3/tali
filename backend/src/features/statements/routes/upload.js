import express from 'express';
import {
  uploadMiddleware,
  uploadStatement,
  getStatementStatus,
  getStatements
} from '../controllers/uploadController.js';

const router = express.Router();

router.post('/statement', uploadMiddleware, uploadStatement);
router.get('/statements', getStatements);
router.get('/statements/:id', getStatementStatus);

export default router;
