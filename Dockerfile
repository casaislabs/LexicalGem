FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nodeapp -G nodejs
COPY --chown=nodeapp:nodejs --from=deps /app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs package*.json ./
COPY --chown=nodeapp:nodejs config.js ./config.js
COPY --chown=nodeapp:nodejs src ./src
USER nodeapp
CMD ["node","src/index.js"]
