FROM node:20-alpine AS base
WORKDIR /app
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
