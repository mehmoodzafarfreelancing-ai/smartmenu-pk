FROM node:20-alpine AS base
WORKDIR /app

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies like TypeScript)
RUN npm install

# Copy all your project files
COPY . .

# Build the Next.js app while TypeScript is available
RUN npm run build

# NOW set the environment to production for the live server
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]
