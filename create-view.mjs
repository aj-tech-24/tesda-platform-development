import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Creating registry_view...");

    await client.query(`
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
    `);

    // We must grant access to the view
    await client.query(`GRANT SELECT ON registry_view TO anon, authenticated, service_role;`);

    console.log("registry_view created successfully!");

  } catch (err) {
    console.error("Database error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
