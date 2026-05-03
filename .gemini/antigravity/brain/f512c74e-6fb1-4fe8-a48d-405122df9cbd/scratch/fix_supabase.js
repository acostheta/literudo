const { Client } = require('pg');

const client = new Client({
  host: "db.xvsvfwbifupfivnbhiil.supabase.co",
  port: 5432,
  user: "postgres",
  password: "NhFGSZBbmVbHwGbw",
  database: "postgres",
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    await client.connect();
    console.log("Connected directly to Supabase Postgres!");

    const sql = `
      -- 1. Crear función corregida con todas las columnas detectadas
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (
          id, 
          name, 
          email, 
          role, 
          status, 
          password, 
          about_me, 
          avatar_url
        )
        VALUES (
          new.id, 
          COALESCE(new.raw_user_meta_data->>'name', 'Usuario Nuevo'), 
          new.email, 
          'Usuario', 
          'activo',
          'literudo',
          '', 
          ''
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- 2. Vincular trigger
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `;

    await client.query(sql);
    console.log("SQL Fix applied successfully!");
  } catch (err) {
    console.error("Error applying fix:", err);
  } finally {
    await client.end();
  }
}

fix();
