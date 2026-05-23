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
    const { action, id, nombre, orden } = body

    switch (action) {
      case 'create': {
        const base = await db.baseDiablito.create({
          data: {
            nombre: nombre || 'Nueva Base',
            orden: typeof orden === 'number' ? orden : 0,
          },
        })
        return NextResponse.json({ success: true, base })
      }
      case 'update': {
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        const data: Record<string, unknown> = {}
        if (nombre !== undefined) data.nombre = nombre
        if (orden !== undefined) data.orden = orden
        const base = await db.baseDiablito.update({ where: { id }, data })
        return NextResponse.json({ success: true, base })
      }
      case 'delete': {
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        await db.baseDiablito.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error with base:', error)
    return NextResponse.json({ error: 'Failed to process base' }, { status: 500 })
  }
}
