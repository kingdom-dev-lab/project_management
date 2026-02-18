@echo off
setlocal

call npm install || exit /b 1
call npx prisma generate --schema backend/prisma/schema.prisma || exit /b 1
call npx prisma db push --schema backend/prisma/schema.prisma || exit /b 1
call npm run dev
