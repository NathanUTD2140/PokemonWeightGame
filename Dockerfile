# Use an official Node.js LTS image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first, so npm install is cached separately
# from source code changes (faster rebuilds during development)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source files
COPY . .

# Document which port the container listens on
EXPOSE 3001

ENV PORT=3001

# Start the server
CMD ["node", "webServer.js"]