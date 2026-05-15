import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PUBLIC_PATHS = ['/', '/login', '/register', '/reset-password'];
const ADMIN_PATHS = ['/admin'];
const MEMBER_PATHS = ['/member'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow all API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('taskflow_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const user = verifyToken(token);

    // Admin trying to access member routes
    if (pathname.startsWith('/member') && user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // Member trying to access admin routes
    if (pathname.startsWith('/admin') && user.role === 'member') {
      return NextResponse.redirect(new URL('/member/my-tasks', req.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('taskflow_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)'],
};
