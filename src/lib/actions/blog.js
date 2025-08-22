'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all published blog posts with pagination
export async function getBlogPosts(page = 1, limit = 9, categoryId = null, searchTerm = '') {
  try {
    const skip = (page - 1) * limit
    
    const whereClause = {
      status: 'published',
      publishedAt: {
        lte: new Date()
      }
    }

    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId)
    }

    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { excerpt: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: {
                where: { isApproved: true }
              }
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where: whereClause })
    ])

    return {
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return { success: false, error: 'Failed to fetch blog posts' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get featured blog post
export async function getFeaturedPost() {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        status: 'published',
        isFeatured: true,
        publishedAt: {
          lte: new Date()
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: {
              where: { isApproved: true }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    return { success: true, data: post }
  } catch (error) {
    console.error('Error fetching featured post:', error)
    return { success: false, error: 'Failed to fetch featured post' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get blog post by slug
export async function getBlogPostBySlug(slug) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          where: { isApproved: true },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (post) {
      // Increment view count
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      })
    }

    return { success: true, data: post }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return { success: false, error: 'Failed to fetch blog post' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get all blog categories
export async function getBlogCategories() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'published',
                publishedAt: {
                  lte: new Date()
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get related posts
export async function getRelatedPosts(postId, categoryId, limit = 3) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        categoryId: categoryId,
        status: 'published',
        publishedAt: {
          lte: new Date()
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        category: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    })

    return { success: true, data: posts }
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return { success: false, error: 'Failed to fetch related posts' }
  } finally {
    await prisma.$disconnect()
  }
}

// Add blog comment
export async function addBlogComment(postId, content, authorId = null, name = null, email = null) {
  try {
    const comment = await prisma.blogComment.create({
      data: {
        postId: parseInt(postId),
        content,
        authorId: authorId ? parseInt(authorId) : null,
        name,
        email,
        isApproved: false // Comments need approval
      }
    })

    return { success: true, data: comment, message: 'Comment submitted for approval' }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Failed to add comment' }
  } finally {
    await prisma.$disconnect()
  }
}

// Like/Unlike blog post
export async function toggleBlogLike(postId) {
  try {
    const post = await prisma.blogPost.update({
      where: { id: parseInt(postId) },
      data: { likeCount: { increment: 1 } }
    })

    return { success: true, data: { likeCount: post.likeCount } }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, error: 'Failed to update like' }
  } finally {
    await prisma.$disconnect()
  }
}