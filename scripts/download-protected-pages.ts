// Run: bun scripts/download-protected-pages.ts
// Downloads protected pages from Supabase Storage for migration

import { createClient } from '@supabase/supabase-js';
import { mkdir } from 'fs/promises';

const FILES = [
  'auto-find-section.html',
  'crossHcolumnCalculator-protected.html',
  'boq-report.html',
];

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Ensure output directory exists
  await mkdir('./protected-source', { recursive: true });

  console.log('Downloading protected pages from Supabase Storage...\n');

  for (const file of FILES) {
    try {
      const { data, error } = await supabase.storage
        .from('protected-pages')
        .download(file);

      if (error) {
        console.error(`Error downloading ${file}:`, error.message);
        continue;
      }

      const text = await data.text();
      await Bun.write(`./protected-source/${file}`, text);
      console.log(`✅ Downloaded: ${file} (${text.length} bytes)`);
    } catch (err) {
      console.error(`Failed to download ${file}:`, err);
    }
  }

  console.log('\nDone!');
}

main();
