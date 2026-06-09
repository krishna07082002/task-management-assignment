import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validators';

const router = Router();

// All task routes are protected
router.use(authenticate);

// GET /api/tasks/stats — must be before /:id
router.get('/stats', getTaskStats);

// GET /api/tasks
router.get('/', getTasks);

// GET /api/tasks/:id
router.get('/:id', getTaskById);

// POST /api/tasks
router.post('/', validate(createTaskSchema), createTask);

// PATCH /api/tasks/:id
router.patch('/:id', validate(updateTaskSchema), updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

export default router;
