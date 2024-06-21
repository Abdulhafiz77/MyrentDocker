FROM node:lts-alpine
WORKDIR /server
COPY package.json .
RUN npm install --no-update-notifier
COPY . .
CMD [ "npm", "start" ]