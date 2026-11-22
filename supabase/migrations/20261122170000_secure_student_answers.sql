-- Mengamankan jawaban mahasiswa dan proses pemberian nilai.
-- Mahasiswa hanya dapat mengirim/memperbarui isi jawaban miliknya.
-- Dosen memberi nilai melalui RPC yang memeriksa kepemilikan kelas.

-- Hapus kebijakan lama yang memberi mahasiswa akses ALL, termasuk kolom nilai.
DROP POLICY IF EXISTS "Mahasiswa kelola jawaban sendiri" ON public.jawaban;

-- Ganti kebijakan dosen lama dengan akses baca saja.
DROP POLICY IF EXISTS "Dosen update nilai jawaban" ON public.jawaban;
DROP POLICY IF EXISTS "Dosen lihat jawaban kelasnya" ON public.jawaban;

CREATE POLICY "Dosen lihat jawaban kelasnya"
ON public.jawaban
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.soal s
    JOIN public.tugas t ON t.id = s.tugas_id
    JOIN public.kelas k ON k.id = t.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = jawaban.soal_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

DROP POLICY IF EXISTS "Mahasiswa lihat jawaban sendiri" ON public.jawaban;
CREATE POLICY "Mahasiswa lihat jawaban sendiri"
ON public.jawaban
FOR SELECT
TO authenticated
USING (mahasiswa_id = auth.uid());

DROP POLICY IF EXISTS "Mahasiswa kirim jawaban sendiri" ON public.jawaban;
CREATE POLICY "Mahasiswa kirim jawaban sendiri"
ON public.jawaban
FOR INSERT
TO authenticated
WITH CHECK (
  mahasiswa_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.soal s
    JOIN public.tugas t ON t.id = s.tugas_id
    JOIN public.anggota_kelas ak ON ak.kelas_id = t.kelas_id
    WHERE s.id = jawaban.soal_id
      AND ak.mahasiswa_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Mahasiswa ubah isi jawaban sendiri" ON public.jawaban;
CREATE POLICY "Mahasiswa ubah isi jawaban sendiri"
ON public.jawaban
FOR UPDATE
TO authenticated
USING (mahasiswa_id = auth.uid())
WITH CHECK (mahasiswa_id = auth.uid());

-- Cabut hak tulis tingkat tabel, lalu berikan hanya kolom yang diperlukan mahasiswa.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.jawaban FROM anon, authenticated;
GRANT INSERT (soal_id, mahasiswa_id, isi_jawaban)
ON TABLE public.jawaban TO authenticated;
GRANT UPDATE (isi_jawaban)
ON TABLE public.jawaban TO authenticated;

-- Dosen mengubah nilai melalui fungsi terverifikasi, bukan UPDATE langsung.
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
