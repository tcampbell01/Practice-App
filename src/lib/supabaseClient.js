//supabase setup

// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// These come from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A single Supabase client for the whole app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
