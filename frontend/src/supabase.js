import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://mbnsdxrhfvidrzqncyob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibnNkeHJoZnZpZHJ6cW5jeW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU4MzgsImV4cCI6MjA4OTQ5MTgzOH0.Rc4oGN-eedTx7yuZTUd6L30H7cDXNUQlx00XzPa5vE0'
);
