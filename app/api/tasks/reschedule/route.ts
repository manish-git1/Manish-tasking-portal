import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { RescheduleRequest } from '@/models/RescheduleRequest';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth-middleware';
import { rescheduleSchema } from '@/lib/validators';

// POST /api/tasks/reschedule — member submits request
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const parsed = rescheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { taskId, newDeadline, reason } = parsed.data;
    const task = await Task.findById(taskId);

    if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    if (user.role === 'member' && task.assignedTo.toString() !== user.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const existing = await RescheduleRequest.findOne({ task: taskId, status: 'pending' });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A pending reschedule request already exists for this task' }, { status: 409 });
    }

    const request = await RescheduleRequest.create({
      task: taskId,
      requestedBy: user.userId,
      originalDeadline: task.deadline,
      newDeadline: new Date(newDeadline),
      reason,
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        type: 'request_submitted',
        title: 'Reschedule Request',
        message: `${user.name} requested a deadline extension for "${task.title}".`,
        relatedTask: task._id,
      }))
    );

    return NextResponse.json({ success: true, data: { request } }, { status: 201 });
  } catch (error) {
    console.error('reschedule POST error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
