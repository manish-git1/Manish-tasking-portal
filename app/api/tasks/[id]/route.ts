import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { Notification } from '@/models/Notification';
import { getAuthUser } from '@/lib/auth-middleware';
import { updateTaskSchema } from '@/lib/validators';
import mongoose from 'mongoose';

// GET /api/tasks/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email')
      .lean();

    if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

    const taskObj = task as typeof task & { assignedTo: { _id: mongoose.Types.ObjectId } };
    if (user.role === 'member' && taskObj.assignedTo._id.toString() !== user.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { task } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] — admin only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.deadline) update.deadline = new Date(parsed.data.deadline);

    const task = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email');

    if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

    // Notify assignee of update
    await Notification.create({
      recipient: task.assignedTo,
      type: 'task_updated',
      title: 'Task Updated',
      message: `Your task "${task.title}" has been updated by an admin.`,
      relatedTask: task._id,
    });

    return NextResponse.json({ success: true, data: { task } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { id } = await params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] — add comment (member or admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'add_comment') {
      const { text } = body;
      if (!text?.trim()) return NextResponse.json({ success: false, message: 'Comment cannot be empty' }, { status: 400 });

      const task = await Task.findByIdAndUpdate(
        id,
        { $push: { comments: { author: user.userId, authorName: user.name, text, createdAt: new Date() } } },
        { new: true }
      ).populate('assignedTo', 'name email avatar');

      if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

      return NextResponse.json({ success: true, data: { task } });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
