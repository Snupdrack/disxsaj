import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = await db.menuConfig.findUnique({ where: { id: 'main' } })
    const sabores = await db.sabor.findMany({ orderBy: { orden: 'asc' } })
    const extrasClasico = await db.extraClasico.findMany({ orderBy: { orden: 'asc' } })
    const extrasDiablito = await db.extraDiablito.findMany({ orderBy: { orden: 'asc' } })
    const extrasGloria = await db.extraGloria.findMany({ orderBy: { orden: 'asc' } })
    const basesDiablito = await db.baseDiablito.findMany({ orderBy: { orden: 'asc' } })
    const botanas = await db.botana.findMany({ orderBy: { orden: 'asc' } })

    return NextResponse.json({
      config,
      sabores,
      extrasClasico,
      extrasDiablito,
      extrasGloria,
      basesDiablito,
      botanas,
    })
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}
