import express from 'express';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueStats,
} from '../controllers/issueController.js';
import {
  createIssueValidation,
  updateIssueValidation,
  mongoIdValidation,
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics
router.get('/stats', getIssueStats);

// CRUD operations
router.route('/')
  .get(getIssues)
  .post(createIssueValidation, createIssue);

router.route('/:id')
  .get(mongoIdValidation, getIssue)
  .put(updateIssueValidation, updateIssue)
  .delete(mongoIdValidation, deleteIssue);

export default router;
