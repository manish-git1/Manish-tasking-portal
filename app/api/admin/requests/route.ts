import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { RescheduleRequest } from '@/models/RescheduleRequest';
import { getAuthUser } from '@/lib/auth-middleware';

// GET /api/admin/requests
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const query: Record<string, unknown> = {};
    if (status !== 'all') query.status = status;

    const requests = await RescheduleRequest.find(query)
      .populate('task', 'title deadline status')
      .populate('requestedBy', 'name email avatar department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { requests } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
