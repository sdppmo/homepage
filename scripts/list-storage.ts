import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase.storage
    .from('protected-pages')
    .list();

  if (error) {
    console.error('Error listing files:', error);
    process.exit(1);
  }

  console.log('Files in protected-pages bucket:');
  for (const file of data || []) {
    console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
  }
}

main();
