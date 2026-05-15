import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { Notification } from '@/models/Notification';
import { getAuthUser } from '@/lib/auth-middleware';
import { updateStatusSchema } from '@/lib/validators';

export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { taskId, status } = parsed.data;
    const task = await Task.findById(taskId).populate('createdBy', '_id');

    if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

    // Members can only update their own tasks
    if (user.role === 'member' && task.assignedTo.toString() !== user.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    task.status = status;
    if (status === 'completed') task.completedAt = new Date();
    else task.completedAt = undefined;

    await task.save();

    // Notify admin / task creator
    const createdByObj = task.createdBy as { _id: { toString: () => string } };
    await Notification.create({
      recipient: createdByObj._id,
      type: 'status_updated',
      title: 'Task Status Updated',
      message: `"${task.title}" status changed to ${status.replace('_', ' ')} by ${user.name}.`,
      relatedTask: task._id,
    });

    return NextResponse.json({ success: true, data: { task } });
  } catch (error) {
    console.error('update-status error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
