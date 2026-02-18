FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000 4000
CMD ["npm", "run", "dev"]
