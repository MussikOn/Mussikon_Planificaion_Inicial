ALTER TABLE email_verification_tokens
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE email_verification_tokens
ADD COLUMN email VARCHAR(255);

-- Add a check constraint to ensure either user_id or email is present
ALTER TABLE email_verification_tokens
ADD CONSTRAINT chk_user_id_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL);

-- Add an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_email ON email_verification_tokens(email);