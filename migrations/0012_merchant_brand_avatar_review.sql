ALTER TABLE merchant_brand_decorations ADD COLUMN logo_image TEXT NOT NULL DEFAULT '';
ALTER TABLE merchant_brand_decorations ADD COLUMN pending_logo_image TEXT NOT NULL DEFAULT '';
ALTER TABLE merchant_brand_decorations ADD COLUMN logo_review_status TEXT NOT NULL DEFAULT 'approved';
