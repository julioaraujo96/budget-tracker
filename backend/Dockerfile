FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Run migrations at container start, then launch the app
EXPOSE 3001

CMD ["node", "src/index.js"]
