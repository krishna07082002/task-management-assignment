import { Response } from 'express';
import Task from '../models/Task';
import { AuthRequest, TaskQuery } from '../types';
import { sendSuccess, sendError } from '../utils';
import { CreateTaskInput, UpdateTaskInput } from '../validators';
import mongoose from 'mongoose';

// GET /api/tasks
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, search, page = '1', limit = '10' } = req.query as TaskQuery;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: Record<string, unknown> = { userId };

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Tasks fetched', {
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch tasks', error);
  }
};

// GET /api/tasks/stats
export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);

    const stats = await Task.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const completed = stats.find((s) => s._id === 'completed')?.count || 0;
    const pending = stats.find((s) => s._id === 'pending')?.count || 0;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    sendSuccess(res, 200, 'Stats fetched', {
      total,
      completed,
      pending,
      completionPercentage,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch stats', error);
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 400, 'Invalid task ID');
      return;
    }

    const task = await Task.findOne({ _id: id, userId: req.user?.id });
    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }

    sendSuccess(res, 200, 'Task fetched', task);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch task', error);
  }
};

// POST /api/tasks
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, status } = req.body as CreateTaskInput;

    const task = await Task.create({
      userId: req.user?.id,
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      status,
    });

    sendSuccess(res, 201, 'Task created', task);
  } catch (error) {
    sendError(res, 500, 'Failed to create task', error);
  }
};

// PATCH /api/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 400, 'Invalid task ID');
      return;
    }

    const updates = req.body as UpdateTaskInput;

    // Convert dueDate string to Date if provided
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.dueDate) {
      updateData.dueDate = new Date(updates.dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }

    sendSuccess(res, 200, 'Task updated', task);
  } catch (error) {
    sendError(res, 500, 'Failed to update task', error);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 400, 'Invalid task ID');
      return;
    }

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user?.id });

    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }

    sendSuccess(res, 200, 'Task deleted');
  } catch (error) {
    sendError(res, 500, 'Failed to delete task', error);
  }
};
