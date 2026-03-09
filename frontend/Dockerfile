FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Hinweis: Dev-Server für lokale Demos. Für Produktion könnte ein Build & Serve Schritt ergänzt werden.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
