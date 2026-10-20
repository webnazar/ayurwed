import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Handle Admin Login page specifically
    if (path === '/admin/login') {
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Role-based authorization rules for Admin routes
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (!token) {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${encodeURIComponent(path)}`, req.url));
      }

      if (token.role !== 'ADMIN') {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    if (path.startsWith('/consultant') || path.startsWith('/api/consultant')) {
      if (token?.role !== 'CONSULTANT' && token?.role !== 'ADMIN') {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Consultant access required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Redirect legacy /consumer page routes to /user counterparts
    if (path.startsWith('/consumer') && !path.startsWith('/api/consumer')) {
      const newPath = path.replace(/^\/consumer/, '/user');
      return NextResponse.redirect(new URL(newPath, req.url));
    }

    // Auth check for /user and /api/user (both Doctors and Users can access)
    if (path.startsWith('/user') || path.startsWith('/api/user') || path.startsWith('/api/consumer')) {
      if (!token) {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized: Login required' }, { status: 401 });
        }
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url));
      }
    }

    if (path.startsWith('/api/clean-database')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (
          path.startsWith('/admin') ||
          path.startsWith('/api/admin') ||
          path.startsWith('/consultant') ||
          path.startsWith('/api/consultant') ||
          path.startsWith('/user') ||
          path.startsWith('/api/user') ||
          path.startsWith('/consumer') ||
          path.startsWith('/api/consumer') ||
          path.startsWith('/api/clean-database')
        ) {
          return true; // Handled inside middleware function for custom JSON or redirects
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/consultant/:path*',
    '/consumer/:path*',
    '/user/:path*',
    '/api/admin/:path*',
    '/api/consultant/:path*',
    '/api/consumer/:path*',
    '/api/user/:path*',
    '/api/clean-database',
  ],
};
