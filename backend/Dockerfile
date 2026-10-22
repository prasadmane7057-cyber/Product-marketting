FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.postgres.prisma

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
