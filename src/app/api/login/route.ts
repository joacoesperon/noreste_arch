import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (password === correctPassword) {
      const response = NextResponse.json({ authenticated: true }, { status: 200 });
      
      // Seteamos una cookie que dure 7 días
      response.cookies.set('noreste_session', 'active', {
        httpOnly: true, // Por seguridad, no accesible desde JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      });

      return response;
    } else {
      return NextResponse.json({ authenticated: false, error: 'Contraseña incorrecta' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
