import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStripeSettings, saveStripeSettings } from '@/lib/stripeConfig';

async function checkAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_auth')?.value === 'true';
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings = await getStripeSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await saveStripeSettings(body);
  return NextResponse.json({ ok: true });
}
