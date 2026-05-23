import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'didxsaj-admin-2024-token'
}

function checkAuth(request: Request): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${getAdminToken()}`
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      precioClasico,
      precioGlorias,
      precioDiablito,
      precioBotana,
      precioExtra,
      diablitoDesc,
      gloriasDesc,
    } = body

    const data: Record<string, unknown> = {}
    if (typeof precioClasico === 'number') data.precioClasico = precioClasico
    if (typeof precioGlorias === 'number') data.precioGlorias = precioGlorias
    if (typeof precioDiablito === 'number') data.precioDiablito = precioDiablito
    if (typeof precioBotana === 'number') data.precioBotana = precioBotana
    if (typeof precioExtra === 'number') data.precioExtra = precioExtra
    if (typeof diablitoDesc === 'string') data.diablitoDesc = diablitoDesc
    if (typeof gloriasDesc === 'string') data.gloriasDesc = gloriasDesc

    const config = await db.menuConfig.update({
      where: { id: 'main' },
      data,
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
