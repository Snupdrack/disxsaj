import { NextResponse } from 'next/server'

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'didxsaj2024'
}

function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'didxsaj-admin-2024-token'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === getAdminPassword()) {
      return NextResponse.json({ success: true, token: getAdminToken() })
    }

    return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
