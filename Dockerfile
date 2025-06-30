# Build stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./
RUN echo 'nodeLinker: "node-modules"' > ./.yarnrc.yml
RUN corepack enable && yarn --frozen-lockfile

# Install dependencies
RUN yarn install

# Copy all files
COPY . .

# Build the app
RUN yarn build

# Serve stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build --chmod=755 /app/dist /usr/share/nginx/html

# Copy nginx configuration (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
