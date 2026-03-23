const { createClient } = require('@supabase/supabase-js');

// Use SB_URL and SB_SERVICE_ROLE_KEY instead of SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.SB_URL;
const supabaseKey = process.env.SB_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Your Edge Function logic
