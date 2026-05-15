import mongoose, { Document, Schema } from 'mongoose';

export interface IRescheduleRequest extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  originalDeadline: Date;
  newDeadline: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RescheduleRequestSchema = new Schema<IRescheduleRequest>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalDeadline: { type: Date, required: true },
    newDeadline: { type: Date, required: true },
    reason: { type: String, required: true, minlength: 10 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

RescheduleRequestSchema.index({ status: 1 });
RescheduleRequestSchema.index({ task: 1 });

export const RescheduleRequest =
  mongoose.models.RescheduleRequest ||
  mongoose.model<IRescheduleRequest>('RescheduleRequest', RescheduleRequestSchema);
