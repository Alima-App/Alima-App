-- Alima App
-- Migration: secure profile registration and self-service updates.
--
-- Effects:
-- 1. New sign-ups are always assigned the mahasiswa role.
-- 2. Public user metadata cannot grant the dosen role.
-- 3. Authenticated users may update only profiles.nama, not peran/email/id.
-- 4. Existing lecturer roles are preserved.
-- 5. Existing auth.users trigger is preserved; no new trigger is created.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    nama,
    peran,
    email
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nama', 'Tanpa Nama'),
    'mahasiswa',
    NEW.email
  );

  RETURN NEW;
END;
$function$;

-- Remove table-level UPDATE and grant only the safe profile field.
REVOKE UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT UPDATE (nama) ON TABLE public.profiles TO authenticated;

-- Ensure the existing self-update policy remains scoped to the user's own row.
DROP POLICY IF EXISTS "Update profil sendiri" ON public.profiles;

CREATE POLICY "Update profil sendiri"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Do not grant direct profile creation or deletion to client roles.
REVOKE INSERT, DELETE ON TABLE public.profiles FROM anon, authenticated;

-- The existing on_auth_user_created trigger on auth.users is intentionally kept.
