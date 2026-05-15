import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from '@/lib/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

export function getAuthUser(req: NextRequest): JwtPayload | null {
  try {
    const token =
      req.cookies.get('taskflow_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(
  handler: (req: NextRequest, user: JwtPayload, context?: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized — please log in' }, { status: 401 });
    }
    return handler(req, user, context);
  };
}

export function requireAdmin(
  handler: (req: NextRequest, user: JwtPayload, context?: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized — please log in' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden — admin access required' }, { status: 403 });
    }
    return handler(req, user, context);
  };
}

export function createSuccessResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function createErrorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}
