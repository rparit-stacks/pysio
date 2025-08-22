'use server'

import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// File validation constants
const MAX_FILE_SIZE = {
  profileImage: 5 * 1024 * 1024, // 5MB
  kycDocument: 10 * 1024 * 1024, // 10MB
  certificate: 10 * 1024 * 1024, // 10MB
  additionalDocument: 10 * 1024 * 1024, // 10MB
}

const ALLOWED_TYPES = {
  profileImage: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  kycDocument: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  certificate: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  additionalDocument: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
}

const UPLOAD_FOLDERS = {
  profileImage: 'profiles',
  kycDocument: 'kyc-documents',
  certificate: 'certificates',
  additionalDocument: 'additional-documents',
}

// Validate file
function validateFile(file, fileType) {
  const maxSize = MAX_FILE_SIZE[fileType]
  const allowedTypes = ALLOWED_TYPES[fileType]

  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    }
  }

  return { valid: true }
}

// Generate unique filename
function generateFileName(originalName, fileType) {
  const ext = path.extname(originalName)
  const uuid = uuidv4()
  const timestamp = Date.now()
  return `${fileType}_${timestamp}_${uuid}${ext}`
}

// Ensure upload directory exists
async function ensureUploadDir(uploadPath) {
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true })
  }
}

// Upload file to file system and store reference in database
export async function uploadFile(formData) {
  try {
    const file = formData.get('file')
    const fileType = formData.get('fileType') // 'profileImage', 'kycDocument', 'certificate', 'additionalDocument'
    const userId = formData.get('userId')
    const description = formData.get('description') || ''

    console.log('uploadFile called with:', { 
      fileName: file?.name, 
      fileType, 
      userId, 
      fileSize: file?.size 
    })

    // Validate inputs
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    if (!fileType) {
      return { success: false, error: 'File type is required' }
    }

    if (!userId) {
      return { success: false, error: 'User ID is required' }
    }

    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      console.log('File validation failed:', validation.error)
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name, fileType)
    
    // Create upload path
    const uploadFolder = UPLOAD_FOLDERS[fileType]
    if (!uploadFolder) {
      return { success: false, error: `Unsupported file type: ${fileType}` }
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadFolder)
    const filePath = path.join(uploadDir, fileName)
    const relativePath = `/uploads/${uploadFolder}/${fileName}`

    console.log('Upload paths:', { uploadDir, filePath, relativePath })

    // Ensure directory exists
    await ensureUploadDir(uploadDir)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log('File written to filesystem successfully')

    // Store file reference in database
    const uploadedFile = await prisma.userFile.create({
      data: {
        userId: parseInt(userId),
        fileName: file.name,
        storedFileName: fileName,
        fileType: fileType,
        mimeType: file.type,
        fileSize: file.size,
        filePath: relativePath,
        description: description,
        uploadedAt: new Date()
      }
    })

    console.log('File record created in database:', uploadedFile.id)

    return { 
      success: true, 
      fileId: uploadedFile.id,
      filePath: relativePath,
      message: 'File uploaded successfully' 
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: `Failed to upload file: ${error.message}` }
  } finally {
    await prisma.$disconnect()
  }
}

// Get file by ID
export async function getFile(fileId) {
  try {
    const file = await prisma.userFile.findUnique({
      where: { id: parseInt(fileId) }
    })

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    return { 
      success: true, 
      file: {
        id: file.id,
        fileName: file.fileName,
        storedFileName: file.storedFileName,
        fileType: file.fileType,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        filePath: file.filePath,
        description: file.description,
        uploadedAt: file.uploadedAt
      }
    }
  } catch (error) {
    console.error('Error retrieving file:', error)
    return { success: false, error: 'Failed to retrieve file' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get user files by type
export async function getUserFiles(userId, fileType = null) {
  try {
    const whereClause = { userId: parseInt(userId) }
    if (fileType) {
      whereClause.fileType = fileType
    }

    const files = await prisma.userFile.findMany({
      where: whereClause,
      select: {
        id: true,
        fileName: true,
        storedFileName: true,
        fileType: true,
        mimeType: true,
        fileSize: true,
        filePath: true,
        description: true,
        uploadedAt: true
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return { success: true, files }
  } catch (error) {
    console.error('Error retrieving user files:', error)
    return { success: false, error: 'Failed to retrieve files' }
  } finally {
    await prisma.$disconnect()
  }
}

// Delete file (both from filesystem and database)
export async function deleteFile(fileId, userId) {
  try {
    // Verify file belongs to user
    const file = await prisma.userFile.findFirst({
      where: {
        id: parseInt(fileId),
        userId: parseInt(userId)
      }
    })

    if (!file) {
      return { success: false, error: 'File not found or access denied' }
    }

    // Delete from filesystem
    const fullPath = path.join(process.cwd(), 'public', file.filePath)
    try {
      const { unlink } = await import('fs/promises')
      await unlink(fullPath)
    } catch (fsError) {
      console.warn('File not found on filesystem:', fullPath)
    }

    // Delete from database
    await prisma.userFile.delete({
      where: { id: parseInt(fileId) }
    })

    return { success: true, message: 'File deleted successfully' }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: 'Failed to delete file' }
  } finally {
    await prisma.$disconnect()
  }
}

// Update therapist profile with file references
export async function updateTherapistFiles(userId, profileImageId = null, kycDocumentId = null) {
  try {
    const updateData = {}
    
    if (profileImageId) {
      const profileImage = await prisma.userFile.findUnique({
        where: { id: parseInt(profileImageId) }
      })
      if (profileImage) {
        updateData.profileImageUrl = profileImage.filePath
      }
    }
    
    if (kycDocumentId) {
      const kycDocument = await prisma.userFile.findUnique({
        where: { id: parseInt(kycDocumentId) }
      })
      if (kycDocument) {
        updateData.kycDocumentUrl = kycDocument.filePath
      }
    }

    await prisma.physiotherapistProfile.update({
      where: { userId: parseInt(userId) },
      data: updateData
    })

    return { success: true, message: 'Profile updated with file references' }
  } catch (error) {
    console.error('Error updating therapist files:', error)
    return { success: false, error: 'Failed to update profile' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get therapist files for KYC verification
export async function getTherapistKYCFiles(userId) {
  try {
    const files = await prisma.userFile.findMany({
      where: {
        userId: parseInt(userId),
        fileType: {
          in: ['profileImage', 'kycDocument', 'certificate', 'additionalDocument']
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    const categorizedFiles = {
      profileImage: files.filter(f => f.fileType === 'profileImage'),
      kycDocuments: files.filter(f => f.fileType === 'kycDocument'),
      certificates: files.filter(f => f.fileType === 'certificate'),
      additionalDocuments: files.filter(f => f.fileType === 'additionalDocument')
    }

    return { success: true, files: categorizedFiles }
  } catch (error) {
    console.error('Error retrieving KYC files:', error)
    return { success: false, error: 'Failed to retrieve KYC files' }
  } finally {
    await prisma.$disconnect()
  }
}