import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'didxsaj2024'
const ADMIN_TOKEN = 'didxsaj-admin-2024-token'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: ADMIN_TOKEN })
    }

    return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
