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
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const key = formData.get('key') as string | null

    if (!file || !key) {
      return NextResponse.json({ error: 'File and key are required' }, { status: 400 })
    }

    // Convert file to base64 and store in database
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`

    // Upsert the image in the database
    await db.imageUpload.upsert({
      where: { key },
      update: { data: base64Data, mimeType: file.type || 'image/png' },
      create: { key, data: base64Data, mimeType: file.type || 'image/png' },
    })

    // Update the corresponding config/sabor with the image reference
    const imgRef = `db:${key}` // prefix indicates it's stored in DB

    if (key === 'logo') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { logoImg: imgRef } })
    } else if (key === 'diablito') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { diablitoImg: imgRef } })
    } else if (key === 'glorias') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { gloriasImg: imgRef } })
    } else if (key === 'botanas') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { botanasImg: imgRef } })
    } else if (key.startsWith('sabor_')) {
      const saborId = key.replace('sabor_', '')
      await db.sabor.update({ where: { id: saborId }, data: { img: imgRef } })
    }

    return NextResponse.json({ success: true, url: imgRef })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
