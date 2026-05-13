import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Starting Database Migration for MVP Phase 1...");

    // 1. Rename training_centers to institutions (if not already renamed)
    console.log("Renaming training_centers to institutions...");
    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'training_centers') THEN
          ALTER TABLE training_centers RENAME TO institutions;
        END IF;
      END $$;
    `);

    // 1.1 Add new columns to institutions
    console.log("Adding columns to institutions...");
    await client.query(`
      ALTER TABLE institutions 
        ADD COLUMN IF NOT EXISTS province TEXT,
        ADD COLUMN IF NOT EXISTS municipality TEXT,
        ADD COLUMN IF NOT EXISTS head_name TEXT,
        ADD COLUMN IF NOT EXISTS contact_no TEXT,
        ADD COLUMN IF NOT EXISTS fb_account TEXT,
        ADD COLUMN IF NOT EXISTS institution_type TEXT,
        ADD COLUMN IF NOT EXISTS classification TEXT,
        ADD COLUMN IF NOT EXISTS status TEXT,
        ADD COLUMN IF NOT EXISTS sector TEXT;
    `);

    // 2. Expand programs
    console.log("Expanding programs table...");
    await client.query(`
      ALTER TABLE programs 
        ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS registration_no TEXT,
        ADD COLUMN IF NOT EXISTS date_issued DATE,
        ADD COLUMN IF NOT EXISTS expiration_date DATE,
        ADD COLUMN IF NOT EXISTS delivery_mode TEXT,
        ADD COLUMN IF NOT EXISTS program_type TEXT;
    `);

    // 3. Expand trainers
    console.log("Expanding trainers table...");
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'center_id') THEN
          ALTER TABLE trainers RENAME COLUMN center_id TO institution_id;
        END IF;
      END $$;

      ALTER TABLE trainers 
        ADD COLUMN IF NOT EXISTS nttc_no TEXT,
        ADD COLUMN IF NOT EXISTS nttc_validity DATE;
    `);

    // 4. Create compliance_records
    console.log("Creating compliance_records table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_records (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
        ctpr_serial TEXT,
        audit_remarks TEXT,
        date_reported DATE,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Set Permissions for compliance_records
    console.log("Setting permissions for compliance_records...");
    await client.query(`GRANT ALL ON TABLE compliance_records TO anon, authenticated, service_role;`);
    await client.query(`ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;`);
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'compliance_records' AND policyname = 'Enable read access for all users'
        ) THEN
          CREATE POLICY "Enable read access for all users" ON compliance_records FOR SELECT USING (true);
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'compliance_records' AND policyname = 'Enable all access for admins'
        ) THEN
          CREATE POLICY "Enable all access for admins" ON compliance_records FOR ALL TO authenticated USING (
            (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
          ) WITH CHECK (
            (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
          );
        END IF;
      END $$;
    `);

    console.log("Migration complete!");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
