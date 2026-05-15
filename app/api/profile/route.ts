import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const { name, department, currentPassword, newPassword } = body;

    const user = await User.findById(authUser.userId).select('+password');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    if (name) user.name = name;
    if (department !== undefined) user.department = department;

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ success: false, message: 'Current password required' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });
      user.password = newPassword;
    }

    await user.save();
    return NextResponse.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, department: user.department } } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
