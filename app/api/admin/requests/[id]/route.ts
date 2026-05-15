import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { RescheduleRequest } from '@/models/RescheduleRequest';
import { Task } from '@/models/Task';
import { Notification } from '@/models/Notification';
import { getAuthUser } from '@/lib/auth-middleware';
import { reviewRequestSchema } from '@/lib/validators';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = reviewRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });

    const { status, reviewNote } = parsed.data;
    const rr = await RescheduleRequest.findById(id).populate('task', '_id title');
    if (!rr) return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
    if (rr.status !== 'pending') return NextResponse.json({ success: false, message: 'Already reviewed' }, { status: 400 });

    rr.status = status;
    rr.reviewedBy = user.userId as unknown as import('mongoose').Types.ObjectId;
    rr.reviewNote = reviewNote;
    rr.reviewedAt = new Date();
    await rr.save();

    const task = rr.task as { _id: import('mongoose').Types.ObjectId; title: string };
    if (status === 'approved') await Task.findByIdAndUpdate(task._id, { deadline: rr.newDeadline });

    await Notification.create({
      recipient: rr.requestedBy,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: `Reschedule ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved'
        ? `Your reschedule for "${task.title}" was approved.`
        : `Your reschedule for "${task.title}" was rejected. ${reviewNote || ''}`,
      relatedTask: task._id,
    });

    return NextResponse.json({ success: true, data: { request: rr } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
