
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://smlaqershlicbckfwyed.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbGFxZXJzaGxpY2Jja2Z3eWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzAzNjgsImV4cCI6MjA1OTE0NjM2OH0.49aBX-fewsh1kGWRyNLSGwwLk0FRTsWVf7cJc10_N7g";

// Create a Supabase client with the URL and API key
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
