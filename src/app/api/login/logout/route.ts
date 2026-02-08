import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Borramos la cookie seteando maxAge a 0
  response.cookies.set('noreste_session', '', { maxAge: 0 });
  
  return response;
}
