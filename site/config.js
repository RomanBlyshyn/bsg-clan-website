// ============================================================
//  ПІДКЛЮЧЕННЯ ДО БАЗИ (Supabase)
//  Supabase → Project Settings → API:
//    supabaseUrl     = "Project URL"
//    supabaseAnonKey = "anon public" ключ (його можна світити, він публічний)
//  Поки порожньо — сайт бере все з data.js, адмінка і форма не працюють.
// ============================================================

const CONFIG = {
  supabaseUrl: "https://xfimviivrmqztxnjczok.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaW12aWl2cm1xenR4bmpjem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTQ4MjYsImV4cCI6MjEwODY5MDgyNn0.Ga65l5_CodHHOUZ_TPVNZg2FKl8HLWPTJWNDHdDYzIs"
};

const HAS_DB = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
