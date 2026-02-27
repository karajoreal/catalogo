FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Script para generar nginx.conf con la variable de entorno del backend
# BACKEND_HOST debe apuntar al nombre interno del servicio API en EasyPanel
# Default: catalogo-api (nombre del servicio en EasyPanel)
ENV BACKEND_HOST=catalogo-api
ENV BACKEND_PORT=3002

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
