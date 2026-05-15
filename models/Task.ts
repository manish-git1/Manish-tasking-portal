import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  text: string;
  createdAt: Date;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date;
  tags: string[];
  comments: IComment[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    deadline: { type: Date, required: true },
    tags: [{ type: String, trim: true }],
    comments: [CommentSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ deadline: 1 });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
