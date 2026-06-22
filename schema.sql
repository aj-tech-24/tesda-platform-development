-- 1. CLEANUP (Optional - only if starting fresh on a populated db)
DROP VIEW IF EXISTS registry_view CASCADE;
DROP TABLE IF EXISTS assessor_accreditations CASCADE;
DROP TABLE IF EXISTS assessors CASCADE;
DROP TABLE IF EXISTS assessment_accreditations CASCADE;
DROP TABLE IF EXISTS assessment_centers CASCADE;
DROP TABLE IF EXISTS trainer_history CASCADE;
DROP TABLE IF EXISTS trainer_programs CASCADE;
DROP TABLE IF EXISTS compliance_records CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- 2. CREATE TABLES

-- Institutions (formerly training_centers)
CREATE TABLE institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT,
    municipality TEXT,
    address TEXT,
    head_name TEXT,
    contact_no TEXT,
    contact_email TEXT,
    fb_account TEXT,
    institution_type TEXT,
    classification TEXT,
    status TEXT DEFAULT 'Active',
    sector TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs
CREATE TABLE programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    qualification_level TEXT,
    duration_hours INT DEFAULT 0,
    registration_no TEXT,
    date_issued DATE,
    expiration_date DATE,
    delivery_mode TEXT,
    program_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainers
CREATE TABLE trainers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nttc_no TEXT,
    nttc_validity DATE,
    specialization TEXT,
    employment_type TEXT DEFAULT 'Regular',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Records
CREATE TABLE compliance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    ctpr_serial TEXT,
    audit_remarks TEXT,
    date_reported DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainer Programs (Junction table)
CREATE TABLE trainer_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trainer_id, program_id)
);

-- Trainer History
CREATE TABLE trainer_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    status TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessors
CREATE TABLE assessors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT,
    province TEXT,
    address TEXT,
    sector TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessor Accreditations
CREATE TABLE assessor_accreditations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessor_id UUID REFERENCES assessors(id) ON DELETE CASCADE,
    qualification_title TEXT,
    date_accredited DATE,
    valid_until DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Centers
CREATE TABLE assessment_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT,
    province TEXT,
    address TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    center_manager TEXT,
    contact_no TEXT,
    sector TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Accreditations
CREATE TABLE assessment_accreditations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_center_id UUID REFERENCES assessment_centers(id) ON DELETE CASCADE,
    qualification_title TEXT,
    accreditation_number TEXT,
    date_accredited DATE,
    valid_until DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE REGISTRY VIEW
CREATE OR REPLACE VIEW registry_view AS
SELECT 
    p.id as id,
    p.id as program_id,
    p.title as program_name,
    p.qualification_level,
    p.duration_hours,
    p.registration_no,
    p.date_issued,
    p.expiration_date,
    p.delivery_mode,
    p.program_type,
    i.id as institution_id,
    i.name as institution_name,
    i.province,
    i.municipality,
    i.address,
    i.head_name,
    i.contact_no,
    i.contact_email,
    i.fb_account,
    i.institution_type,
    i.classification,
    i.status as institution_status,
    i.sector,
    (
        SELECT string_agg(t.full_name, ', ')
        FROM trainers t
        WHERE t.institution_id = i.id
    ) as trainers_list
FROM programs p
LEFT JOIN institutions i ON p.institution_id = i.id;

-- 4. GRANT TABLE/VIEW PERMISSIONS
GRANT ALL ON TABLE institutions TO anon, authenticated, service_role;
GRANT ALL ON TABLE programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE trainers TO anon, authenticated, service_role;
GRANT ALL ON TABLE compliance_records TO anon, authenticated, service_role;
GRANT ALL ON TABLE trainer_programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE trainer_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE assessors TO anon, authenticated, service_role;
GRANT ALL ON TABLE assessor_accreditations TO anon, authenticated, service_role;
GRANT ALL ON TABLE assessment_centers TO anon, authenticated, service_role;
GRANT ALL ON TABLE assessment_accreditations TO anon, authenticated, service_role;
GRANT SELECT ON registry_view TO anon, authenticated, service_role;

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessors ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessor_accreditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_accreditations ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Read Access Policies (Allow all users, anonymous or logged-in, to view)
CREATE POLICY "Enable read access for all users" ON institutions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON programs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON trainers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON compliance_records FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON trainer_programs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON trainer_history FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON assessors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON assessor_accreditations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON assessment_centers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON assessment_accreditations FOR SELECT USING (true);

-- Write Access Policies (Allow users with is_admin metadata to manage)
CREATE POLICY "Enable all access for admins" ON institutions FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON programs FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON trainers FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON compliance_records FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON trainer_programs FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON trainer_history FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON assessors FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON assessor_accreditations FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON assessment_centers FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Enable all access for admins" ON assessment_accreditations FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) 
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
