# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# npm install o'rniga npm ci: package-lock.json bo'yicha aniq versiyalar
RUN npm ci

COPY . .

RUN npm run build

# Nginx stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
