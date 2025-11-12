import multer from 'multer';
import path from 'path';
import { prisma } from '../../../server.js';
import { addJob } from '../../../services/jobs/queueService.js';
import fs from 'fs';

// Ensure upload directory exists (configurable for production/local)
const uploadDir = process.env.UPLOAD_DIR || process.env.NODE_ENV === 'production' 
  ? '/app/uploads/statements' 
  : 'uploads/statements';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and CSV allowed.'));
    }
  }
});

export const uploadMiddleware = upload.single('statement');

export async function uploadStatement(req, res) {
  try {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create database record
    const statement = await prisma.bankStatement.create({
      data: {
        userId,
        filename: file.originalname,
        filepath: file.path,
        filesize: file.size,
        mimeType: file.mimetype,
        status: 'pending',
      },
    });

    // Trigger processing job
    await addJob('process-statement', {
      statementId: statement.id,
      userId,
      filepath: file.path,
      mimeType: file.mimetype,
    });

    res.json({
      success: true,
      statement: {
        id: statement.id,
        filename: statement.filename,
        status: statement.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getStatementStatus(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const statement = await prisma.bankStatement.findFirst({
      where: { id, userId },
    });

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }

    res.json({
      id: statement.id,
      filename: statement.filename,
      status: statement.status,
      transactionCount: statement.transactionCount,
      processedAt: statement.processedAt,
      errorMessage: statement.errorMessage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getStatements(req, res) {
  try {
    const userId = req.user.userId;

    const statements = await prisma.bankStatement.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        filename: true,
        filesize: true,
        status: true,
        transactionCount: true,
        uploadedAt: true,
        processedAt: true
      }
    });

    res.json(statements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
