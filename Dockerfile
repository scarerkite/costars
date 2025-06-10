FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY .env .
COPY *.js .
COPY public/ ./public/
COPY test/ ./test/
COPY views/ ./views/
ENTRYPOINT ["node"]
CMD ["server.js"]