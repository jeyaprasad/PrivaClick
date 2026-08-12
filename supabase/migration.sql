-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    masked_id TEXT,
    verified_on TEXT,
    known_domains TEXT,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    weekly_notifications BOOLEAN DEFAULT TRUE
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    added_on TEXT NOT NULL,
    name TEXT
);

-- Create detections table
CREATE TABLE IF NOT EXISTS detections (
    id TEXT PRIMARY KEY,
    photo_id TEXT REFERENCES photos(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    found_on TEXT NOT NULL,
    status TEXT NOT NULL
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    detection_id TEXT REFERENCES detections(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL,
    filed_on TEXT NOT NULL,
    description TEXT,
    reference_id TEXT
);

-- Enable Row Level Security (RLS) on tables if needed, but since we connect via service role or want it simple for demo:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Insert seed user
INSERT INTO users (id, name, email, phone, masked_id, verified_on, known_domains, email_notifications, sms_notifications, weekly_notifications)
VALUES ('u1', 'Ananya Sharma', 'ananya@example.com', '+91 98765 43210', 'XXXX XXXX 4821', '12 Jun 2026', 'ananyaphotography.com,example.com', TRUE, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert seed photos
INSERT INTO photos (id, user_id, storage_url, added_on, name)
VALUES 
('p1', 'u1', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', '12 Jun 2026', 'Profile portrait'),
('p2', 'u1', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', '12 Jun 2026', 'Park afternoon'),
('p3', 'u1', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', '18 Jun 2026', 'Cafe candid')
ON CONFLICT (id) DO NOTHING;

-- Insert seed detections
INSERT INTO detections (id, photo_id, platform, source_url, confidence, found_on, status)
VALUES
('d1', 'p1', 'Instagram', 'https://instagram.com/p/9fJk21_ad/', 97, '04 Aug 2026', 'Needs Review'),
('d2', 'p2', 'Pinterest', 'https://pinterest.com/pin/71829301/', 88, '31 Jul 2026', 'Needs Review'),
('d3', 'p3', 'X (Twitter)', 'https://x.com/unknown_acct/status/17281', 76, '24 Jul 2026', 'Confirmed Unauthorized'),
('d4', 'p1', 'Facebook', 'https://facebook.com/groups/2381/posts/9912', 93, '19 Jul 2026', 'Complaint Filed')
ON CONFLICT (id) DO NOTHING;

-- Insert seed complaints
INSERT INTO complaints (id, detection_id, platform, status, filed_on, description, reference_id)
VALUES
('PVC-2026-004192', 'd4', 'Facebook', 'Under Review', '20 Jul 2026', 'My photo was reposted without permission on a public group page.', 'PVC-2026-004192')
ON CONFLICT (id) DO NOTHING;

-- Create email_otps table
CREATE TABLE IF NOT EXISTS email_otps (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create scan_history table
CREATE TABLE IF NOT EXISTS scan_history (
    id SERIAL PRIMARY KEY,
    photo_id TEXT REFERENCES photos(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    new_detections_count INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    log_message TEXT
);

-- Insert seed scan history (3 hours ago)
INSERT INTO scan_history (photo_id, scanned_at, new_detections_count, status, log_message)
VALUES ('p1', NOW() - INTERVAL '3 hours', 0, 'Success', 'Scan completed successfully.');

-- Create known_safe_urls table
CREATE TABLE IF NOT EXISTS known_safe_urls (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    url TEXT UNIQUE NOT NULL
);

-- Create demo_seed_matches table
CREATE TABLE IF NOT EXISTS demo_seed_matches (
    id SERIAL PRIMARY KEY,
    photo_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    confidence INT NOT NULL,
    found_on TEXT NOT NULL
);

-- Insert seed demo matches
INSERT INTO demo_seed_matches (id, photo_id, platform, source_url, confidence, found_on)
VALUES
(1, 'p4', 'Other', 'https://en.wikipedia.org/wiki/Ada_Lovelace', 98, '12 Aug 2026'),
(2, 'p4', 'Other', 'https://www.britannica.com/biography/Ada-Lovelace', 95, '12 Aug 2026'),
(3, 'p4', 'Other', 'https://www.computerhistory.org/profile/ada-lovelace/', 91, '12 Aug 2026'),
(4, 'p4', 'Instagram', 'https://www.instagram.com/p/ada_lovelace_tribute/', 88, '12 Aug 2026'),
(5, 'p4', 'Pinterest', 'https://www.pinterest.com/pin/ada_lovelace_historical_prints/', 85, '12 Aug 2026')
ON CONFLICT (id) DO NOTHING;


