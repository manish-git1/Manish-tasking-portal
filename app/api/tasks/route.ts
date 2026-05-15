import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth-middleware';
import { createTaskSchema } from '@/lib/validators';

// GET /api/tasks — admin gets all, member gets own
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};

    if (user.role === 'member') query.assignedTo = user.userId;
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { tasks, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/tasks — admin only
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, description, assignedTo, priority, deadline, tags } = parsed.data;

    const assignee = await User.findById(assignedTo);
    if (!assignee) return NextResponse.json({ success: false, message: 'Assigned user not found' }, { status: 404 });

    const task = await Task.create({
      title, description, assignedTo, priority,
      deadline: new Date(deadline),
      tags,
      createdBy: user.userId,
    });

    // Create notification for assignee
    await Notification.create({
      recipient: assignedTo,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${title}"`,
      relatedTask: task._id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email avatar department' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return NextResponse.json({ success: true, data: { task: populated } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
