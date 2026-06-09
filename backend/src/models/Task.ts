import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskStatus } from '../types';

type TaskDocument = ITask & Document;

const taskSchema = new Schema<TaskDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed'] satisfies TaskStatus[],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient user-specific queries with filtering
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Text index for search
taskSchema.index({ title: 'text', description: 'text' });

const Task = mongoose.model<TaskDocument>('Task', taskSchema);

export default Task;
