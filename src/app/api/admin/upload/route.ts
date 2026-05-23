import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const key = formData.get('key') as string | null

    if (!file || !key) {
      return NextResponse.json({ error: 'File and key are required' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = path.extname(file.name) || '.png'
    const uniqueName = `${key}_${randomUUID().slice(0, 8)}${ext}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true })

    const filePath = path.join(uploadsDir, uniqueName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${uniqueName}`

    // Update the database based on the key
    if (key === 'logo') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { logoImg: url } })
    } else if (key === 'diablito') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { diablitoImg: url } })
    } else if (key === 'glorias') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { gloriasImg: url } })
    } else if (key === 'botanas') {
      await db.menuConfig.update({ where: { id: 'main' }, data: { botanasImg: url } })
    } else if (key.startsWith('sabor_')) {
      const saborId = key.replace('sabor_', '')
      await db.sabor.update({ where: { id: saborId }, data: { img: url } })
    }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
