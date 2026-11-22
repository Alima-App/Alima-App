-- Mengamankan kelas, keanggotaan, kelompok, materi, dan tugas.
-- Mahasiswa bergabung kelas hanya melalui RPC berdasarkan kode kelas.
-- Hak dosen dibatasi pada kelas yang dimilikinya dan profil berperan dosen.

BEGIN;

-- Pastikan RLS aktif pada seluruh tabel yang diamankan.
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelompok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota_kelompok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugas ENABLE ROW LEVEL SECURITY;

-- 1. Hapus kebijakan lama agar tidak ada jalur akses lama yang tetap terbuka.
DROP POLICY IF EXISTS "Dosen kelola anggota kelasnya" ON public.anggota_kelas;
DROP POLICY IF EXISTS "Mahasiswa bergabung kelas" ON public.anggota_kelas;
DROP POLICY IF EXISTS "Mahasiswa lihat anggota kelas" ON public.anggota_kelas;

DROP POLICY IF EXISTS "Dosen kelola kelas sendiri" ON public.kelas;
DROP POLICY IF EXISTS "Mahasiswa lihat kelas terdaftar" ON public.kelas;

DROP POLICY IF EXISTS "Dosen kelola anggota kelompok" ON public.anggota_kelompok;
DROP POLICY IF EXISTS "Mahasiswa lihat kelompoknya" ON public.anggota_kelompok;

DROP POLICY IF EXISTS "Dosen kelola kelompok kelasnya" ON public.kelompok;
DROP POLICY IF EXISTS "Mahasiswa lihat kelompok kelasnya" ON public.kelompok;

DROP POLICY IF EXISTS "Dosen kelola materi kelasnya" ON public.materi;
DROP POLICY IF EXISTS "Mahasiswa lihat materi kelasnya" ON public.materi;

DROP POLICY IF EXISTS "Dosen kelola tugas kelasnya" ON public.tugas;
DROP POLICY IF EXISTS "Mahasiswa lihat tugas kelasnya" ON public.tugas;

-- 2. KELAS: dosen hanya mengelola kelas miliknya; mahasiswa hanya membaca kelas yang diikuti.
CREATE POLICY "Dosen lihat kelas sendiri"
ON public.kelas FOR SELECT TO authenticated
USING (
  pengajar_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.peran = 'dosen'
  )
);

CREATE POLICY "Mahasiswa lihat kelas terdaftar"
ON public.kelas FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.anggota_kelas ak
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ak.kelas_id = kelas.id
      AND ak.mahasiswa_id = auth.uid()
      AND p.peran = 'mahasiswa'
  )
);

CREATE POLICY "Dosen buat kelas sendiri"
ON public.kelas FOR INSERT TO authenticated
WITH CHECK (
  pengajar_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.peran = 'dosen'
  )
);

CREATE POLICY "Dosen ubah kelas sendiri"
ON public.kelas FOR UPDATE TO authenticated
USING (
  pengajar_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.peran = 'dosen'
  )
)
WITH CHECK (
  pengajar_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.peran = 'dosen'
  )
);

CREATE POLICY "Dosen hapus kelas sendiri"
ON public.kelas FOR DELETE TO authenticated
USING (
  pengajar_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.peran = 'dosen'
  )
);

-- 3. ANGGOTA_KELAS: baca sesuai peran; dosen boleh mengeluarkan anggota kelasnya.
-- Tidak ada kebijakan INSERT/UPDATE langsung untuk mahasiswa.
CREATE POLICY "Dosen lihat anggota kelas sendiri"
ON public.anggota_kelas FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = anggota_kelas.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

CREATE POLICY "Mahasiswa lihat anggota kelasnya"
ON public.anggota_kelas FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.peran = 'mahasiswa'
  )
  AND (
    anggota_kelas.mahasiswa_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.anggota_kelas milik_saya
      WHERE milik_saya.kelas_id = anggota_kelas.kelas_id
        AND milik_saya.mahasiswa_id = auth.uid()
    )
  )
);

CREATE POLICY "Dosen keluarkan anggota kelas sendiri"
ON public.anggota_kelas FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = anggota_kelas.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

-- 4. KELOMPOK: dosen mengelola kelompok di kelas sendiri; mahasiswa hanya membaca.
CREATE POLICY "Dosen kelola kelompok kelas sendiri"
ON public.kelompok FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = kelompok.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = kelompok.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

CREATE POLICY "Mahasiswa lihat kelompok kelasnya"
ON public.kelompok FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.anggota_kelas ak
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ak.kelas_id = kelompok.kelas_id
      AND ak.mahasiswa_id = auth.uid()
      AND p.peran = 'mahasiswa'
  )
);

-- 5. ANGGOTA_KELOMPOK: hanya dosen pemilik kelas yang dapat mengelola.
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
);

CREATE POLICY "Mahasiswa lihat anggota kelompoknya"
ON public.anggota_kelompok FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.anggota_kelompok milik_saya
    JOIN public.kelompok g ON g.id = milik_saya.kelompok_id
    JOIN public.anggota_kelas ak ON ak.kelas_id = g.kelas_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE milik_saya.mahasiswa_id = auth.uid()
      AND ak.mahasiswa_id = auth.uid()
      AND anggota_kelompok.kelompok_id = milik_saya.kelompok_id
      AND p.peran = 'mahasiswa'
  )
);

-- 6. MATERI DAN TUGAS: dosen pemilik kelas dapat mengelola; mahasiswa terdaftar hanya membaca.
CREATE POLICY "Dosen kelola materi kelas sendiri"
ON public.materi FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = materi.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = materi.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

CREATE POLICY "Mahasiswa lihat materi kelasnya"
ON public.materi FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.anggota_kelas ak
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ak.kelas_id = materi.kelas_id
      AND ak.mahasiswa_id = auth.uid()
      AND p.peran = 'mahasiswa'
  )
);

CREATE POLICY "Dosen kelola tugas kelas sendiri"
ON public.tugas FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = tugas.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.kelas k
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE k.id = tugas.kelas_id
      AND k.pengajar_id = auth.uid()
      AND p.peran = 'dosen'
  )
);

CREATE POLICY "Mahasiswa lihat tugas kelasnya"
ON public.tugas FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.anggota_kelas ak
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ak.kelas_id = tugas.kelas_id
      AND ak.mahasiswa_id = auth.uid()
      AND p.peran = 'mahasiswa'
  )
);

-- 7. Hak tabel: cabut hak yang tidak diperlukan, khususnya TRUNCATE yang melewati RLS.
REVOKE ALL ON TABLE
  public.kelas,
  public.anggota_kelas,
  public.kelompok,
  public.anggota_kelompok,
  public.materi,
  public.tugas
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.kelas,
  public.kelompok,
  public.anggota_kelompok,
  public.materi,
  public.tugas
TO authenticated;

GRANT SELECT, DELETE ON TABLE public.anggota_kelas TO authenticated;

-- 8. Cabut RPC pencarian lama; frontend memakai RPC gabung yang atomik.
REVOKE ALL ON FUNCTION public.cari_kelas_by_kode(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.gabung_kelas_by_kode(p_kode text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid;
  v_kelas_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Silakan masuk terlebih dahulu.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.peran = 'mahasiswa'
  ) THEN
    RAISE EXCEPTION 'Hanya akun mahasiswa yang dapat bergabung ke kelas.';
  END IF;

  IF p_kode IS NULL OR upper(trim(p_kode)) !~ '^[A-Z0-9]{6}$' THEN
    RAISE EXCEPTION 'Kode kelas harus terdiri dari 6 karakter huruf atau angka.';
  END IF;

  SELECT k.id
  INTO v_kelas_id
  FROM public.kelas k
  WHERE k.kode = upper(trim(p_kode))
  LIMIT 1;

  IF v_kelas_id IS NULL THEN
    RAISE EXCEPTION 'Kode kelas tidak ditemukan.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.anggota_kelas ak
    WHERE ak.kelas_id = v_kelas_id
      AND ak.mahasiswa_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Anda sudah terdaftar di kelas ini.';
  END IF;

  INSERT INTO public.anggota_kelas (kelas_id, mahasiswa_id)
  VALUES (v_kelas_id, v_user_id)
  ON CONFLICT (kelas_id, mahasiswa_id) DO NOTHING;

  RETURN v_kelas_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.gabung_kelas_by_kode(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gabung_kelas_by_kode(text) TO authenticated;

COMMIT;
