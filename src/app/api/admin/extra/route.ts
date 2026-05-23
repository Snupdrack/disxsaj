import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ADMIN_TOKEN = 'didxsaj-admin-2024-token'

function checkAuth(request: Request) {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${ADMIN_TOKEN}`
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { section, action, id, nombre, orden } = body

    const modelMap: Record<string, typeof db.extraClasico> = {
      clasico: db.extraClasico,
      diablito: db.extraDiablito,
      gloria: db.extraGloria,
    }

    const model = modelMap[section]
    if (!model) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    switch (action) {
      case 'create': {
        const item = await model.create({
          data: {
            nombre: nombre || 'Nuevo Extra',
            orden: typeof orden === 'number' ? orden : 0,
          },
        })
        return NextResponse.json({ success: true, item })
      }
      case 'update': {
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        const data: Record<string, unknown> = {}
        if (nombre !== undefined) data.nombre = nombre
        if (orden !== undefined) data.orden = orden
        const item = await model.update({ where: { id }, data })
        return NextResponse.json({ success: true, item })
      }
      case 'delete': {
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        await model.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error with extra:', error)
    return NextResponse.json({ error: 'Failed to process extra' }, { status: 500 })
  }
}
