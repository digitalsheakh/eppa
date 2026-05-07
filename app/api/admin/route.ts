import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_auth', 'true', { httpOnly: true, maxAge: 60 * 60 * 8 });
    return res;
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
