FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p uploads/pdfs uploads/portadas
EXPOSE 3002
CMD ["node", "app.js"]
