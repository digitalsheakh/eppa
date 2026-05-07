import { NextResponse } from 'next/server';
import { getCategories, saveCategories } from '@/lib/db';

export async function GET() {
  const list = await getCategories();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!Array.isArray(body) || body.some(c => typeof c !== 'string')) {
    return NextResponse.json({ error: 'Invalid categories' }, { status: 400 });
  }
  const cleaned = body.map((c: string) => c.trim()).filter(Boolean);
  await saveCategories(cleaned);
  return NextResponse.json({ ok: true });
}
