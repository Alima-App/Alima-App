# Integration Review — 2026-11-28

## Scope

Source package: v2 alima app.zip and v2.2 Alima app.zip.
Target baseline: main at 7cda6ee06ac75a46c3c4ba83bc1174e41a141e0a.
Integration branch: integrasi/v2.2-hardening-complete-2026-11-28.

## Inventory result

The nested Alima-App-fix.zip in v2.2 contains the implementation package. The two ZIP versions contain the same main implementation files; the v2.2 package also carries updated documentation and workflow files.

- js/utils.js is byte-for-byte identical to the version already on main.
- The following source files differ from main and require integration: js/router.js, js/pages/kelas.js, js/pages/materi.js, js/pages/dashboard-production.js, js/pages/login-production.js, js/providers/supabase-auth.js.
- .github/workflows/ping.yml differs and should be updated to use least-privilege permissions and environment variables for secrets.
- New files in the package: docs/BUG_AUDIT_2026-11-26.md and supabase/migrations/20261126090000_harden_answers_grading_storage.sql.
- docs/CHANGELOG.md, docs/DATABASE_SCHEMA.md, and docs/SECURITY.md contain updated content and must be reconciled with the current repository documentation.

## Reviewed improvements

- Shared HTML escaping and HTTP(S)-only URL validation.
- Strong six-character class-code generation and collision retry.
- Router queues rapid navigation changes rather than dropping them.
- Class/material views escape untrusted database values and handle refresh/error states.
- Profile cache expires after ten minutes and is scoped to the authenticated user.
- Public sign-up no longer offers or submits the lecturer role; new accounts are students.
- Material upload validates size, extension and declared MIME type; Storage bucket restrictions remain authoritative.
- Signed-URL opening is initiated synchronously to reduce mobile popup-blocker failures.
- Workflow uses contents: read and passes secrets through environment variables.

## Review cautions — do not treat as production approval

1. The SQL migration has not been executed. Back up and compare the live Supabase schema, grants, policies, bucket and existing data before applying it.
2. The migration's unique-index section skips index creation when duplicate class codes exist. Check the NOTICE and resolve duplicates before relying on uniqueness.
3. The Storage bucket UPDATE statement assumes bucket materi-files exists; verify that the update affects exactly one row and that its MIME/size settings are correct.
4. Class deletion removes Storage objects before deleting the class row because the Storage policy checks class ownership. If the later database deletion fails, referenced files may already be gone. A server-side transactional/cleanup design is preferable.
5. Client-side MIME checks are not proof of file contents. Keep Storage restrictions and consider server-side file-signature inspection for stronger assurance.
6. The audit explicitly leaves debug-panel.html and performance-panel.html exposed at the repository root. Exclude developer tools from production deployment artifacts.
7. Rate limiting class-code guesses, a reproducible baseline schema, CSP, and a normalized grade-per-task model remain open design items.

## Required validation

- Run JavaScript syntax checks and browser smoke tests for production-mode modules.
- Test XSS payloads in profile names, class names, material titles and text.
- Test rejection of javascript: URLs.
- Test class creation/join/removal, membership removal, material upload/delete/download on mobile.
- Test deadline and post-grading answer immutability, score range, group membership, helper RPC permissions, and Storage access using lecturer, enrolled student, and non-member accounts.
- Do not merge this branch to main or execute the SQL migration until the checks above pass.
