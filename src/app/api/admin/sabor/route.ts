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
    const { action, id, nombre, emoji, color, bg, desc, orden, img } = body

    switch (action) {
      case 'create': {
        const sabor = await db.sabor.create({
          data: {
            nombre: nombre || 'Nuevo Sabor',
            emoji: emoji || '🍧',
            color: color || '#e74c3c',
            bg: bg || 'linear-gradient(135deg,#ffeaea,#fff8e1)',
            desc: desc || '',
            img: img || '',
            orden: typeof orden === 'number' ? orden : 0,
          },
        })
        return NextResponse.json({ success: true, sabor })
      }
      case 'update': {
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        const data: Record<string, unknown> = {}
        if (nombre !== undefined) data.nombre = nombre
        if (emoji !== undefined) data.emoji = emoji
        if (color !== undefined) data.color = color
        if (bg !== undefined) data.bg = bg
        if (desc !== undefined) data.desc = desc
        if (orden !== undefined) data.orden = orden
        if (img !== undefined) data.img = img
        const sabor = await db.sabor.update({ where: { id }, data })
        return NextResponse.json({ success: true, sabor })
      }
      case 'delete': {
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        await db.sabor.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error with sabor:', error)
    return NextResponse.json({ error: 'Failed to process sabor' }, { status: 500 })
  }
}
