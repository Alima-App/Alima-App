-- Mengamankan kunci jawaban pilihan ganda.
-- Kunci dipindahkan dari public.soal ke tabel privat public.soal_kunci.
-- Mahasiswa hanya mendapat SELECT pada kolom soal yang aman.

BEGIN;

-- 1. Buat penyimpanan kunci terpisah dan salin data yang sudah ada.
CREATE TABLE IF NOT EXISTS public.soal_kunci (
  soal_id uuid PRIMARY KEY
    REFERENCES public.soal(id)
    ON DELETE CASCADE,
  kunci text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soal_kunci ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.soal_kunci FROM PUBLIC, anon, authenticated;

INSERT INTO public.soal_kunci (soal_id, kunci)
SELECT id, kunci
FROM public.soal
WHERE kunci IS NOT NULL
ON CONFLICT (soal_id)
DO UPDATE SET kunci = EXCLUDED.kunci;

-- 2. Hilangkan kolom kunci dari tabel yang dapat dibaca mahasiswa.
ALTER TABLE public.soal DROP COLUMN IF EXISTS kunci;

-- 3. Cabut SELECT seluruh tabel; berikan hanya kolom soal yang aman.
REVOKE SELECT ON TABLE public.soal FROM PUBLIC, anon, authenticated;
REVOKE SELECT (kunci) ON TABLE public.soal FROM PUBLIC, anon, authenticated;

GRANT SELECT (id, tugas_id, pertanyaan, pilihan, urutan)
ON TABLE public.soal TO authenticated;

-- 4. Batasi pengelolaan soal hanya untuk profil dosen pemilik kelas.
DROP POLICY IF EXISTS "Dosen kelola soal tugasnya" ON public.soal;

CREATE POLICY "Dosen kelola soal tugasnya"
ON public.soal
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tugas t
    JOIN public.kelas k ON k.id = t.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE t.id = soal.tugas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tugas t
    JOIN public.kelas k ON k.id = t.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE t.id = soal.tugas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

-- 5. Dosen mengelola/membaca kunci melalui RPC terverifikasi.
CREATE OR REPLACE FUNCTION public.simpan_kunci_soal(
  p_soal_id uuid,
  p_kunci text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF p_kunci IS NULL OR length(trim(p_kunci)) = 0 THEN
    RAISE EXCEPTION 'Kunci jawaban tidak boleh kosong.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.soal s
    JOIN public.tugas t ON t.id = s.tugas_id
    JOIN public.kelas k ON k.id = t.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = p_soal_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  ) THEN
    RAISE EXCEPTION 'Soal tidak ditemukan atau Anda bukan dosen pengampu kelas ini.';
  END IF;

  INSERT INTO public.soal_kunci (soal_id, kunci)
  VALUES (p_soal_id, p_kunci)
  ON CONFLICT (soal_id)
  DO UPDATE SET kunci = EXCLUDED.kunci;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ambil_kunci_soal(
  p_soal_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_kunci text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.soal s
    JOIN public.tugas t ON t.id = s.tugas_id
    JOIN public.kelas k ON k.id = t.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = p_soal_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  ) THEN
    RAISE EXCEPTION 'Soal tidak ditemukan atau Anda bukan dosen pengampu kelas ini.';
  END IF;

  SELECT sk.kunci
  INTO v_kunci
  FROM public.soal_kunci sk
  WHERE sk.soal_id = p_soal_id;

  RETURN v_kunci;
END;
$function$;

REVOKE ALL ON FUNCTION public.simpan_kunci_soal(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ambil_kunci_soal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.simpan_kunci_soal(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ambil_kunci_soal(uuid) TO authenticated;

-- 6. Perbarui RPC penilaian: hanya dosen pengampu yang dapat menilai
-- mahasiswa yang terdaftar pada kelas tugas tersebut.
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
    AND j.isi_jawaban = sk.kunci;

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

COMMIT;
