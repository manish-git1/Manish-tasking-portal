import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth-middleware';

// PATCH /api/admin/users/[id] — toggle active, update role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { isActive, role, department, name } = body;

    const update: Record<string, unknown> = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (role) update.role = role;
    if (department !== undefined) update.department = department;
    if (name) update.name = name;

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: { user } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { id } = await params;

    if (id === authUser.userId) {
      return NextResponse.json({ success: false, message: 'Cannot delete your own account' }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
