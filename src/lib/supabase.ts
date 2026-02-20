import { createClient } from '@supabase/supabase-js';


// Initialize database client - DaFish Boyz Games project
const supabaseUrl = 'https://yrfjejengmkqpjbluexn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZmplamVuZ21rcXBqYmx1ZXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDAwOTQsImV4cCI6MjA4MDIxNjA5NH0.C77bC7S0lGZnjpKyvC2zuV9dJvpIW-c3wzUyFReIi74';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };
