# Folder Reorganization Plan

## Current Structure (to be reorganized)
- client/src/app/App.tsx
- client/src/app/pages/AdminLogin.tsx, AdminDashboard.tsx, AdminUsers.tsx, etc.
- client/src/app/components/AdminHeader.tsx, AdminSidebar.tsx
- client/src/app/components/ui/ (shadcn components)
- client/src/app/context/AuthContext.tsx
- client/src/app/data/adminMockData.ts
- client/src/app/api/adminApi.ts

## Target Structure (per mentor guide)
- client/src/App.tsx (moved from app/)
- client/src/pages/ (moved from app/pages/)
- client/src/components/ (moved from app/components/)
- client/src/context/ (moved from app/context/)
- client/src/data/ (moved from app/data/)
- client/src/api/ (moved from app/api/)
- client/src/hooks/ (new - for custom hooks)
- client/src/layout/ (new - for layout components)
- client/src/utils/ (new - for utility functions)

## Steps to Complete:
1. [x] Create new folder structure at client/src/
2. [x] Move pages/ to client/src/pages/
3. [x] Move components/ to client/src/components/
4. [x] Move context/ to client/src/context/
5. [x] Move data/ to client/src/data/
6. [x] Move api/ to client/src/api/
7. [x] Move App.tsx to client/src/App.tsx
8. [x] Update all import paths in the files
9. [x] Update main.tsx to import from new location
10. [x] Verify build works

## COMPLETED: Folder reorganization successful!
- Build verified: ✓
- All imports updated from @/app/ to @/

