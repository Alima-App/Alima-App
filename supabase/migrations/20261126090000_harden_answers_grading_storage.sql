-- Alima App
-- Migration: hardening jawaban, penilaian, kelompok, helper dummy, kode kelas, dan Storage.
-- Tanggal: 2026-11-26. Lihat docs/BUG_AUDIT_2026-11-26.md untuk latar belakang.
--
-- Efek:
-- 1. Mahasiswa hanya dapat mengirim/mengubah jawaban selama batas waktu tugas belum lewat,
--    dan jawaban yang sudah bernilai tidak dapat diubah lagi.
-- 2. berikan_nilai_jawaban menolak nilai di luar 0-100.
-- 3. hitung_nilai_pg membandingkan jawaban dengan kunci tanpa membedakan huruf besar/kecil
--    dan mengabaikan spasi di awal/akhir.
-- 4. Dosen tidak dapat memasukkan ke kelompok mahasiswa yang bukan anggota kelas tersebut.
-- 5. EXECUTE untuk helper insert_dummy_profile (jika ada) dicabut dari client.
-- 6. kelas.kode diberi index unik (dilewati dengan NOTICE jika sudah ada duplikat).
-- 7. Bucket materi-files dibuat privat dengan batas ukuran dan tipe MIME; policy Storage
--    dilengkapi (UPDATE, dan blokir role anon).
--
-- PRASYARAT: kolom public.tugas.batas_waktu dan public.jawaban.nilai harus ada
-- (lihat docs/DATABASE_SCHEMA.md). Jika tidak ada, migrasi berhenti dengan pesan jelas.
--
-- CARA MENJALANKAN: backup dulu, lalu jalankan seluruh isi file ini di Supabase SQL Editor.
-- Setelah itu uji dengan akun dosen, mahasiswa terdaftar, dan mahasiswa non-anggota.

BEGIN;

-- 0. Pemeriksaan prasyarat ----------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tugas' AND column_name = 'batas_waktu'
  ) THEN
    RAISE EXCEPTION 'Kolom public.tugas.batas_waktu tidak ditemukan. Sesuaikan migrasi ini dengan skema aktual.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jawaban' AND column_name = 'nilai'
  ) THEN
    RAISE EXCEPTION 'Kolom public.jawaban.nilai tidak ditemukan. Sesuaikan migrasi ini dengan skema aktual.';
  END IF;
END $$;

-- 1. Jawaban: kunci setelah batas waktu / setelah dinilai -----------------------
CREATE OR REPLACE FUNCTION public.mahasiswa_boleh_menjawab_soal(p_soal_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.soal s
    JOIN public.tugas t ON t.id = s.tugas_id
    JOIN public.anggota_kelas ak
      ON ak.kelas_id = t.kelas_id
     AND ak.mahasiswa_id = auth.uid()
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = p_soal_id
      AND p.peran = 'mahasiswa'
      AND (t.batas_waktu IS NULL OR t.batas_waktu > now())
  );
$function$;

REVOKE ALL ON FUNCTION public.mahasiswa_boleh_menjawab_soal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mahasiswa_boleh_menjawab_soal(uuid) TO authenticated;

DROP POLICY IF EXISTS "Mahasiswa kirim jawaban sendiri" ON public.jawaban;
CREATE POLICY "Mahasiswa kirim jawaban sendiri"
ON public.jawaban
FOR INSERT
TO authenticated
WITH CHECK (
  mahasiswa_id = auth.uid()
  AND public.mahasiswa_boleh_menjawab_soal(jawaban.soal_id)
);

DROP POLICY IF EXISTS "Mahasiswa ubah isi jawaban sendiri" ON public.jawaban;
CREATE POLICY "Mahasiswa ubah isi jawaban sendiri"
ON public.jawaban
FOR UPDATE
TO authenticated
USING (
  mahasiswa_id = auth.uid()
  AND nilai IS NULL
  AND public.mahasiswa_boleh_menjawab_soal(jawaban.soal_id)
)
WITH CHECK (
  mahasiswa_id = auth.uid()
  AND public.mahasiswa_boleh_menjawab_soal(jawaban.soal_id)
);

-- 2. Pemberian nilai: validasi rentang ------------------------------------------
CREATE OR REPLACE FUNCTION public.berikan_nilai_jawaban(
  p_jawaban_id uuid,
  p_nilai numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_updated integer;
BEGIN
  IF p_nilai IS NULL OR p_nilai < 0 OR p_nilai > 100 THEN
    RAISE EXCEPTION 'Nilai harus berada di antara 0 dan 100.';
  END IF;

  UPDATE public.jawaban AS j
  SET nilai = p_nilai
  FROM public.soal AS s
  JOIN public.tugas AS t ON t.id = s.tugas_id
  JOIN public.kelas AS k ON k.id = t.kelas_id
  JOIN public.profiles AS p ON p.id = auth.uid()
  WHERE j.id = p_jawaban_id
    AND s.id = j.soal_id
    AND k.pengajar_id = auth.uid()
    AND p.peran = 'dosen';

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RAISE EXCEPTION 'Jawaban tidak ditemukan atau Anda bukan dosen pengampu kelas ini.';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.berikan_nilai_jawaban(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.berikan_nilai_jawaban(uuid, numeric) TO authenticated;

-- 3. Penilaian PG otomatis: pembandingan tidak sensitif huruf/spasi ---------------
CREATE OR REPLACE FUNCTION public.hitung_nilai_pg(
  p_tugas_id uuid,
  p_mahasiswa_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  total_soal integer;
  total_benar integer;
  hasil numeric;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tugas t
    JOIN public.kelas k ON k.id = t.kelas_id
    JOIN public.profiles pd ON pd.id = auth.uid()
    JOIN public.profiles pm ON pm.id = p_mahasiswa_id
    JOIN public.anggota_kelas ak ON ak.kelas_id = t.kelas_id
      AND ak.mahasiswa_id = p_mahasiswa_id
    WHERE t.id = p_tugas_id
      AND k.pengajar_id = auth.uid()
      AND pd.peran = 'dosen'
      AND pm.peran = 'mahasiswa'
      AND t.tipe = 'pilihan_ganda'
  ) THEN
    RAISE EXCEPTION 'Tugas tidak ditemukan atau Anda tidak berwenang menilai mahasiswa ini.';
  END IF;

  SELECT count(*)::integer
  INTO total_soal
  FROM public.soal s
  WHERE s.tugas_id = p_tugas_id;

  IF total_soal = 0 THEN
    RETURN 0;
  END IF;

  SELECT count(*)::integer
  INTO total_benar
  FROM public.jawaban j
  JOIN public.soal s ON s.id = j.soal_id
  JOIN public.soal_kunci sk ON sk.soal_id = s.id
  WHERE s.tugas_id = p_tugas_id
    AND j.mahasiswa_id = p_mahasiswa_id
    AND lower(trim(j.isi_jawaban)) = lower(trim(sk.kunci));

  hasil := round((total_benar::numeric / total_soal) * 100, 2);

  UPDATE public.jawaban j
  SET nilai = hasil
  FROM public.soal s
  WHERE j.soal_id = s.id
    AND s.tugas_id = p_tugas_id
    AND j.mahasiswa_id = p_mahasiswa_id;

  RETURN hasil;
END;
$function$;

REVOKE ALL ON FUNCTION public.hitung_nilai_pg(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hitung_nilai_pg(uuid, uuid) TO authenticated;

-- 4. Anggota kelompok: mahasiswa harus anggota kelas yang sama --------------------
DROP POLICY IF EXISTS "Dosen kelola anggota kelompok kelas sendiri" ON public.anggota_kelompok;
CREATE POLICY "Dosen kelola anggota kelompok kelas sendiri"
ON public.anggota_kelompok FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.kelompok g
    JOIN public.kelas k ON k.id = g.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE g.id = anggota_kelompok.kelompok_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.kelompok g
    JOIN public.kelas k ON k.id = g.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE g.id = anggota_kelompok.kelompok_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
  AND EXISTS (
    SELECT 1
    FROM public.kelompok g2
    JOIN public.anggota_kelas ak ON ak.kelas_id = g2.kelas_id
    WHERE g2.id = anggota_kelompok.kelompok_id
      AND ak.mahasiswa_id = anggota_kelompok.mahasiswa_id
  )
);

-- 5. Cabut EXECUTE helper dummy (jika ada, apa pun signature-nya) -----------------
-- Helper SECURITY DEFINER yang membuat profil dapat melewati pembatasan INSERT/UPDATE
-- pada public.profiles jika bisa dipanggil lewat RPC oleh client.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.proname = 'insert_dummy_profile'
      AND p.pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    RAISE NOTICE 'EXECUTE dicabut dari client untuk %', r.sig;
  END LOOP;
END $$;

-- 6. Kode kelas unik ---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.kelas GROUP BY kode HAVING count(*) > 1) THEN
    RAISE NOTICE 'Ada kode kelas duplikat; index unik kelas_kode_unique_idx TIDAK dibuat. Perbaiki data lalu jalankan ulang bagian ini.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS kelas_kode_unique_idx ON public.kelas (kode);
  END IF;
END $$;

-- 7. Storage: bucket materi-files -----------------------------------------------------
-- Bucket privat, maksimum 50 MB per file, hanya PDF dan MP3.
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'audio/mpeg']
WHERE id = 'materi-files';

-- Policy RESTRICTIVE untuk UPDATE (rename/pindah/upsert) pada bucket materi-files.
DROP POLICY IF EXISTS "Alima restrict materi file update" ON storage.objects;
CREATE POLICY "Alima restrict materi file update"
ON storage.objects
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  bucket_id <> 'materi-files'
  OR EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id::text = split_part(storage.objects.name, '/', 1)
      AND p.peran = 'dosen'
      AND k.pengajar_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id <> 'materi-files'
  OR EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id::text = split_part(storage.objects.name, '/', 1)
      AND p.peran = 'dosen'
      AND k.pengajar_id = auth.uid()
  )
);

-- Policy sebelumnya hanya berlaku untuk role authenticated. Blokir role anon secara
-- eksplisit pada bucket ini, kalaupun ada policy permisif lama yang terlalu longgar.
DROP POLICY IF EXISTS "Alima deny anon materi files" ON storage.objects;
CREATE POLICY "Alima deny anon materi files"
ON storage.objects
AS RESTRICTIVE
FOR ALL
TO anon
USING (bucket_id <> 'materi-files')
WITH CHECK (bucket_id <> 'materi-files');

COMMIT;

-- ---------------------------------------------------------------------------------
-- UJI SETELAH MIGRASI (jalankan dengan akun berbeda; hasil yang diharapkan di kanan)
--   * Mahasiswa kirim jawaban sebelum batas_waktu ............ berhasil
--   * Mahasiswa ubah jawaban setelah batas_waktu ............. ditolak
--   * Mahasiswa ubah jawaban yang sudah bernilai ............. ditolak
--   * Dosen panggil berikan_nilai_jawaban(id, 150) ............ error "0 dan 100"
--   * Dosen tambah mahasiswa non-anggota ke kelompok .......... ditolak
--   * Panggil rpc insert_dummy_profile dengan akun login ...... error permission denied
--   * Akses file materi-files tanpa login ..................... ditolak
-- ---------------------------------------------------------------------------------
