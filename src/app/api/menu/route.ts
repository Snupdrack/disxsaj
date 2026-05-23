import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

async function resolveImage(imgRef: string): Promise<string> {
  // If image is stored in the database (prefix "db:"), fetch the base64 data
  if (imgRef && imgRef.startsWith('db:')) {
    const key = imgRef.replace('db:', '')
    try {
      const imageRecord = await db.imageUpload.findUnique({ where: { key } })
      if (imageRecord) {
        return imageRecord.data // base64 data URL
      }
    } catch {
      // ImageUpload table might not exist yet (migration pending)
    }
    return ''
  }
  // Otherwise return as-is (could be a URL or empty string)
  return imgRef
}

export async function GET() {
  try {
    const config = await db.menuConfig.findUnique({ where: { id: 'main' } })
    const sabores = await db.sabor.findMany({ orderBy: { orden: 'asc' } })
    const extrasClasico = await db.extraClasico.findMany({ orderBy: { orden: 'asc' } })
    const extrasDiablito = await db.extraDiablito.findMany({ orderBy: { orden: 'asc' } })
    const extrasGloria = await db.extraGloria.findMany({ orderBy: { orden: 'asc' } })
    const basesDiablito = await db.baseDiablito.findMany({ orderBy: { orden: 'asc' } })
    const botanas = await db.botana.findMany({ orderBy: { orden: 'asc' } })

    // Resolve DB-stored images to base64 data URLs
    const resolvedConfig = config ? {
      ...config,
      logoImg: await resolveImage(config.logoImg),
      diablitoImg: await resolveImage(config.diablitoImg),
      gloriasImg: await resolveImage(config.gloriasImg),
      botanasImg: await resolveImage(config.botanasImg),
    } : null

    const resolvedSabores = await Promise.all(
      sabores.map(async (s) => ({
        ...s,
        img: await resolveImage(s.img),
      }))
    )

    return NextResponse.json({
      config: resolvedConfig,
      sabores: resolvedSabores,
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
