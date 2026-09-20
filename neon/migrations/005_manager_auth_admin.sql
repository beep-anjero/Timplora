-- Timplora managers need Neon Auth's admin role to create employee accounts.
update neon_auth."user" as auth_user
set role = 'admin', "updatedAt" = now()
from profiles
where profiles.id = auth_user.id::text
  and profiles.role = 'manager'
  and coalesce(auth_user.role, 'user') <> 'admin';
