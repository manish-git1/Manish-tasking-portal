import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { getAuthUser } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const notifications = await Notification.find({ recipient: user.userId })
      .populate('relatedTask', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: user.userId, isRead: false });
    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    if (body.markAllRead) {
      await Notification.updateMany({ recipient: user.userId, isRead: false }, { isRead: true });
    } else if (body.id) {
      await Notification.findByIdAndUpdate(body.id, { isRead: true });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
