-- Create blog tables
CREATE TABLE blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    author_id INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES blog_categories(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    read_time INTEGER,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_post_tags (
    post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    email VARCHAR(255),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_blog_post_slug ON blog_posts(slug);
CREATE INDEX idx_blog_post_published ON blog_posts(status, published_at);
CREATE INDEX idx_blog_post_category ON blog_posts(category_id);
CREATE INDEX idx_blog_post_author ON blog_posts(author_id);
CREATE INDEX idx_blog_comment_post ON blog_comments(post_id);
CREATE INDEX idx_blog_comment_author ON blog_comments(author_id);

-- Insert sample categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Physiotherapy', 'physiotherapy', 'Articles about physiotherapy techniques and treatments', '#10b981'),
('Exercises', 'exercises', 'Exercise routines and rehabilitation guides', '#3b82f6'),
('Recovery', 'recovery', 'Recovery tips and post-treatment care', '#8b5cf6'),
('Wellness', 'wellness', 'General health and wellness advice', '#f59e0b'),
('Sports Medicine', 'sports-medicine', 'Sports injury prevention and treatment', '#ef4444');

-- Insert sample tags
INSERT INTO blog_tags (name, slug, color) VALUES
('Back Pain', 'back-pain', '#10b981'),
('Rehabilitation', 'rehabilitation', '#3b82f6'),
('Prevention', 'prevention', '#8b5cf6'),
('Exercise', 'exercise', '#f59e0b'),
('Recovery', 'recovery', '#ef4444'),
('Sports', 'sports', '#06b6d4'),
('Therapy', 'therapy', '#84cc16');

-- Insert sample blog posts (using existing user IDs)
INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id, 
    status, is_featured, view_count, like_count, read_time, published_at
) VALUES
(
    'Revolutionary Physiotherapy Techniques for Faster Recovery',
    'revolutionary-physiotherapy-techniques-faster-recovery',
    'Discover the latest breakthrough methods in physiotherapy that are helping patients recover 40% faster than traditional approaches.',
    'Modern physiotherapy has evolved dramatically with new techniques and technologies that are revolutionizing patient care. In this comprehensive guide, we explore the cutting-edge methods that are helping patients achieve faster, more effective recovery outcomes...',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    1, 1, 'published', true, 1520, 234, 8, CURRENT_TIMESTAMP
),
(
    '10 Essential Exercises for Lower Back Pain Relief',
    '10-essential-exercises-lower-back-pain-relief',
    'Simple yet effective exercises that can be done at home to alleviate chronic lower back pain and improve mobility.',
    'Lower back pain affects millions of people worldwide. These carefully selected exercises have been proven to provide significant relief when performed correctly and consistently...',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    1, 2, 'published', false, 892, 189, 6, CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
    'Post-Surgery Recovery: Complete Rehabilitation Guide',
    'post-surgery-recovery-complete-rehabilitation-guide',
    'A comprehensive guide to post-surgical rehabilitation covering timeline, exercises, and what to expect during recovery.',
    'Recovering from surgery requires a structured approach to rehabilitation. This guide provides everything you need to know about the recovery process...',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
    1, 3, 'published', false, 743, 156, 12, CURRENT_TIMESTAMP - INTERVAL '5 days'
),
(
    'Sports Injury Prevention: Expert Tips and Strategies',
    'sports-injury-prevention-expert-tips-strategies',
    'Learn from professional physiotherapists about preventing common sports injuries and maintaining peak performance.',
    'Prevention is always better than cure, especially when it comes to sports injuries. Our expert physiotherapists share their top strategies...',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    1, 5, 'published', false, 1024, 203, 7, CURRENT_TIMESTAMP - INTERVAL '7 days'
),
(
    'Mental Health and Physical Recovery Connection',
    'mental-health-physical-recovery-connection',
    'Understanding the crucial link between mental wellness and physical rehabilitation for optimal healing outcomes.',
    'The mind-body connection plays a crucial role in physical recovery. Research shows that mental health significantly impacts healing times...',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    1, 4, 'published', false, 654, 178, 9, CURRENT_TIMESTAMP - INTERVAL '10 days'
);

-- Link posts with tags
INSERT INTO blog_post_tags (post_id, tag_id) VALUES
(1, 2), (1, 7), (1, 5),  -- Revolutionary techniques: Rehabilitation, Therapy, Recovery
(2, 1), (2, 4), (2, 3),  -- Back pain exercises: Back Pain, Exercise, Prevention
(3, 2), (3, 5), (3, 7),  -- Surgery recovery: Rehabilitation, Recovery, Therapy
(4, 6), (4, 3), (4, 4),  -- Sports injury: Sports, Prevention, Exercise
(5, 5), (5, 7), (5, 2);  -- Mental health: Recovery, Therapy, Rehabilitation