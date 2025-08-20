-- Add KYC document URL columns to users and physiotherapist_profiles tables

-- Add kyc_document_url column to users table
ALTER TABLE "users" ADD COLUMN "kyc_document_url" VARCHAR(500);

-- Add kyc_document_url column to physiotherapist_profiles table  
ALTER TABLE "physiotherapist_profiles" ADD COLUMN "kyc_document_url" VARCHAR(500);
