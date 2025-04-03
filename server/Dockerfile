# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g nodemon

# Copy the rest of the application
COPY . .

# Expose the backend port (change it if needed)
EXPOSE 4000

# Start the server
CMD ["npm", "run", "server"]
