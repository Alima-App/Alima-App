# Alima App — Demo Mode

Mode demo adalah deployment tersendiri yang dibangun oleh `.github/workflows/deploy-demo.yml` dari branch `main`. Konfigurasinya dibuat oleh `scripts/write-deployment-config.sh` dengan `mode: 'demo'`.

- Menggunakan `dummy-data.js` dan `js/providers/demo-auth.js`.
- Tidak menginisialisasi Supabase dan tidak membutuhkan URL/key Supabase.
- Akun demo: `ahmad.fauzi@alima.test`, `maryam.sholihah@alima.test`, `budi@alima.test`, `siti@alima.test`, `rizky@alima.test`, `dewi@alima.test`, `fajar@alima.test`, `nurul@alima.test`.
- Password seluruh akun: `alima123`.
- Data/sesi demo hanya simulasi dan tidak boleh dipakai untuk keputusan akademik atau data sensitif.

Deployment demo diterbitkan ke repository Pages khusus yang ditentukan oleh GitHub Environment variable `DEMO_DEPLOY_REPOSITORY`. Demo dan produksi tidak berbagi domain deployment maupun konfigurasi runtime. Lihat [`DEPLOYMENT_ENVIRONMENTS.md`](DEPLOYMENT_ENVIRONMENTS.md).
