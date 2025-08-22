import { NextRequest, NextResponse } from 'next/server'
import { getFile, deleteFile } from '@/lib/actions/fileUpload'
import { readFile } from 'fs/promises'
import path from 'path'

// Get file by ID
export async function GET(request, { params }) {
  try {
    const { fileId } = params
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    const result = await getFile(fileId)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 404 })
    }
  } catch (error) {
    console.error('Get file API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete file by ID
export async function DELETE(request, { params }) {
  try {
    const { fileId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!fileId || !userId) {
      return NextResponse.json(
        { success: false, error: 'File ID and User ID are required' },
        { status: 400 }
      )
    }

    const result = await deleteFile(fileId, userId)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Delete file API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}