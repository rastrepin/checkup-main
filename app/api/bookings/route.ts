import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await db()
      .from('leads')
      .insert({
        city: body.city ?? 'kharkiv',
        source_page: body.source ?? 'onclinic-kharkiv',
        name: body.name,
        phone: body.phone,
        program_name: body.programName,
        price: body.price,
        selected_branch_id: body.branchId ?? null,
        branch_address: body.branchAddress ?? null,
        selected_date_label: body.dateLabel ?? null,
        consent_given: true,
        consent_given_at: new Date().toISOString(),
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ token: data.id }, { status: 201 });
  } catch (err) {
    console.error('Booking API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
