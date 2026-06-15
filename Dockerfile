FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 8081
CMD ["npm","start"]