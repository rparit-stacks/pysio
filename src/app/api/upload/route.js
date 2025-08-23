import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file')
    const fileType = formData.get('fileType')
    const folder = formData.get('folder') || 'general'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = path.extname(file.name)
    const fileName = `${fileType}_${Date.now()}_${uuidv4()}${ext}`
    
    // Create upload directory with folder structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const relativePath = `/uploads/${folder}/${fileName}`

    return NextResponse.json({
      success: true,
      url: relativePath,
      filePath: relativePath,
      fileName: fileName,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'File upload endpoint. Use POST to upload files.' },
    { status: 200 }
  )
}