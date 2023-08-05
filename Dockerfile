# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port on which your Node.js app runs (change the port if needed)
EXPOSE 3000

# Command to start your Node.js app
CMD ["npm", "start"]