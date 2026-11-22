#!/usr/bin/env bash
set -euo pipefail
MODE="${ALIMA_MODE:?ALIMA_MODE wajib diisi}"
if [[ "$MODE" == "demo" ]]; then
  cat > js/deployment-config.js <<'EOF'
export const deployment = Object.freeze({ mode: 'demo', supabaseUrl: '', supabaseAnonKey: '' });
EOF
elif [[ "$MODE" == "production" ]]; then
  : "${SUPABASE_URL:?SUPABASE_URL wajib diisi untuk produksi}"
  : "${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY wajib diisi untuk produksi}"
  export SUPABASE_URL SUPABASE_ANON_KEY
  node --input-type=module <<'EOF'
import { writeFileSync } from 'node:fs';
const quote = value => JSON.stringify(value);
writeFileSync('js/deployment-config.js', `export const deployment = Object.freeze({ mode: 'production', supabaseUrl: ${quote(process.env.SUPABASE_URL)}, supabaseAnonKey: ${quote(process.env.SUPABASE_ANON_KEY)} });\n`);
EOF
else
  echo "ALIMA_MODE harus demo atau production" >&2; exit 1
fi
