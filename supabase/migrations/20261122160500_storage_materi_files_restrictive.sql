-- Alima App
-- Migration: restrict access to private course material files.
-- Storage key format verified in js/pages/materi.js:
--   <kelas-uuid>/<timestamp>-<random>.<extension>
--
-- IMPORTANT:
-- These are RESTRICTIVE policies. Existing permissive policies are intentionally
-- retained in this migration. PostgreSQL combines permissive policies with OR,
-- then applies restrictive policies with AND.
--
-- This migration only constrains bucket "materi-files"; it does not change
-- access rules for other Storage buckets.

DROP POLICY IF EXISTS "Alima restrict materi file read" ON storage.objects;
CREATE POLICY "Alima restrict materi file read"
ON storage.objects
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  bucket_id <> 'materi-files'
  OR (
    bucket_id = 'materi-files'
    AND EXISTS (
      SELECT 1
      FROM public.kelas k
      JOIN public.profiles p
        ON p.id = auth.uid()
      WHERE k.id::text = split_part(storage.objects.name, '/', 1)
        AND (
          (p.peran = 'dosen' AND k.pengajar_id = auth.uid())
          OR
          (
            p.peran = 'mahasiswa'
            AND EXISTS (
              SELECT 1
              FROM public.anggota_kelas ak
              WHERE ak.kelas_id = k.id
                AND ak.mahasiswa_id = auth.uid()
            )
          )
        )
    )
  )
);

DROP POLICY IF EXISTS "Alima restrict materi file upload" ON storage.objects;
CREATE POLICY "Alima restrict materi file upload"
ON storage.objects
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id <> 'materi-files'
  OR (
    bucket_id = 'materi-files'
    AND EXISTS (
      SELECT 1
      FROM public.kelas k
      JOIN public.profiles p
        ON p.id = auth.uid()
      WHERE k.id::text = split_part(storage.objects.name, '/', 1)
        AND p.peran = 'dosen'
        AND k.pengajar_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Alima restrict materi file delete" ON storage.objects;
CREATE POLICY "Alima restrict materi file delete"
ON storage.objects
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  bucket_id <> 'materi-files'
  OR (
    bucket_id = 'materi-files'
    AND EXISTS (
      SELECT 1
      FROM public.kelas k
      JOIN public.profiles p
        ON p.id = auth.uid()
      WHERE k.id::text = split_part(storage.objects.name, '/', 1)
        AND p.peran = 'dosen'
        AND k.pengajar_id = auth.uid()
    )
  )
);

-- No existing policy is dropped by this migration.
-- After applying, test with a lecturer who owns a class and a student enrolled
-- in that class, plus users who do not belong to the class.
