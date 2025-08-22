-- Add user_files table for file storage
CREATE TABLE user_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'profileImage', 'kycDocument', 'certificate'
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_type ON user_files(file_type);
CREATE INDEX idx_user_files_uploaded_at ON user_files(uploaded_at);

-- Add file reference columns to physiotherapist_profiles table
ALTER TABLE physiotherapist_profiles 
ADD COLUMN profile_image_file_id INTEGER REFERENCES user_files(id),
ADD COLUMN kyc_document_file_id INTEGER REFERENCES user_files(id);