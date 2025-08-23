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

// Get blog post by ID (for admin)
export async function getBlogPostById(postId) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(postId) },
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
        }
      }
    })

    return { success: true, data: post }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return { success: false, error: 'Failed to fetch blog post' }
  } finally {
    await prisma.$disconnect()
  }
}

// Update blog post
export async function updateBlogPost(postId, postData) {
  try {
    const updateData = {
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt,
      content: postData.content,
      categoryId: parseInt(postData.categoryId),
      status: postData.status,
      isFeatured: postData.isFeatured,
      featuredImage: postData.featuredImage || null,
      metaTitle: postData.metaTitle || postData.title,
      metaDescription: postData.metaDescription || postData.excerpt,
      readTime: postData.readTime ? parseInt(postData.readTime) : null,
      updatedAt: new Date()
    }

    // Set publishedAt if status is published and it wasn't published before
    if (postData.status === 'published') {
      const existingPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(postId) },
        select: { publishedAt: true }
      })
      
      if (!existingPost?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: parseInt(postId) },
      data: updateData
    })

    return { success: true, data: post, message: 'Blog post updated successfully' }
  } catch (error) {
    console.error('Error updating blog post:', error)
    return { success: false, error: 'Failed to update blog post' }
  } finally {
    await prisma.$disconnect()
  }
}

// Get all blog posts (for admin - includes all statuses)
export async function getAllBlogPosts(page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit
    
    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
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
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count()
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

// Create blog post
export async function createBlogPost(postData) {
  try {
    // Get the first admin user or create one if none exists
    let adminUser = await prisma.user.findFirst({
      where: {
        roleId: 1 // Assuming 1 is admin role
      }
    });

    if (!adminUser) {
      // If no admin user exists, get the first user
      adminUser = await prisma.user.findFirst();
    }

    if (!adminUser) {
      return { success: false, error: 'No users found in database. Please create a user first.' }
    }

    const post = await prisma.blogPost.create({
      data: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        authorId: adminUser.id, // Use actual admin user ID
        categoryId: parseInt(postData.categoryId),
        status: postData.status,
        isFeatured: postData.isFeatured,
        featuredImage: postData.featuredImage || null,
        metaTitle: postData.metaTitle || postData.title,
        metaDescription: postData.metaDescription || postData.excerpt,
        readTime: postData.readTime ? parseInt(postData.readTime) : null,
        publishedAt: postData.status === 'published' ? new Date() : null
      }
    })

    return { success: true, data: post, message: 'Blog post created successfully' }
  } catch (error) {
    console.error('Error creating blog post:', error)
    return { success: false, error: 'Failed to create blog post: ' + error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Delete blog post
export async function deleteBlogPost(postId) {
  try {
    await prisma.blogPost.delete({
      where: { id: parseInt(postId) }
    })

    return { success: true, message: 'Blog post deleted successfully' }
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return { success: false, error: 'Failed to delete blog post' }
  } finally {
    await prisma.$disconnect()
  }
}