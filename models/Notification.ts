import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type:
    | 'task_assigned'
    | 'task_updated'
    | 'status_updated'
    | 'request_submitted'
    | 'request_approved'
    | 'request_rejected'
    | 'deadline_reminder'
    | 'comment_added';
  title: string;
  message: string;
  relatedTask?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'status_updated',
        'request_submitted',
        'request_approved',
        'request_rejected',
        'deadline_reminder',
        'comment_added',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
