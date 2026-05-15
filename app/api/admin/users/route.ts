import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth-middleware';

// GET /api/admin/users — list all members
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const query: Record<string, unknown> = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role && role !== 'all') query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { users } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/users — admin creates new user
export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const { name, email, password, role, department } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });

    const newUser = await User.create({ name, email, password, role: role || 'member', department });

    return NextResponse.json(
      { success: true, data: { user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
