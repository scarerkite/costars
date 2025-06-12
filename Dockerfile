FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY *.js .
COPY public/ ./public/
COPY test/ ./test/
COPY views/ ./views/
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["server.js"]