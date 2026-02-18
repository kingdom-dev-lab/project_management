#!/usr/bin/env bash
set -e

npm install
npx prisma generate --schema backend/prisma/schema.prisma
npx prisma db push --schema backend/prisma/schema.prisma
npm run dev
