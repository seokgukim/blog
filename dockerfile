FROM node:22-slim
# pnpm install -g pnpm
RUN npm install -g pnpm
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN pnpm install
# Bundle app source
COPY . .
# Expose the port the app runs on
EXPOSE 3000
# Run the app
RUN pnpm build
CMD [ "pnpm", "start" ]