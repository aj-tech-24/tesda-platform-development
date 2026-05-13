import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Starting DB Migration for Phase 2 (Major Revision)...");

    // 1. Add trainer_type to trainers
    console.log("Adding employment_type and status to trainers...");
    await client.query(`
      ALTER TABLE trainers 
        ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Regular',
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
    `);

    // 2. Create trainer_programs junction table
    console.log("Creating trainer_programs junction table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS trainer_programs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
        program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(trainer_id, program_id)
      );
    `);

    // 3. Create trainer_history table
    console.log("Creating trainer_history table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS trainer_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
        institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
        start_date DATE,
        end_date DATE,
        status TEXT,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Set Permissions
    console.log("Setting permissions...");
    await client.query(`GRANT ALL ON TABLE trainer_programs TO anon, authenticated, service_role;`);
    await client.query(`ALTER TABLE trainer_programs ENABLE ROW LEVEL SECURITY;`);
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trainer_programs' AND policyname = 'Enable read access for all users') THEN
          CREATE POLICY "Enable read access for all users" ON trainer_programs FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trainer_programs' AND policyname = 'Enable all access for admins') THEN
          CREATE POLICY "Enable all access for admins" ON trainer_programs FOR ALL TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
        END IF;
      END $$;
    `);

    await client.query(`GRANT ALL ON TABLE trainer_history TO anon, authenticated, service_role;`);
    await client.query(`ALTER TABLE trainer_history ENABLE ROW LEVEL SECURITY;`);
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trainer_history' AND policyname = 'Enable read access for all users') THEN
          CREATE POLICY "Enable read access for all users" ON trainer_history FOR SELECT USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trainer_history' AND policyname = 'Enable all access for admins') THEN
          CREATE POLICY "Enable all access for admins" ON trainer_history FOR ALL TO authenticated USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
        END IF;
      END $$;
    `);

    console.log("Migration Phase 2 complete!");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
