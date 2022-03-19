FROM node:15-buster-slim

RUN npm i npm@latest -g
RUN mkdir /opt/node_app
# Create app directory
WORKDIR /opt/node_app

# Install app dependencies

COPY package*.json package-lock.json* ./
RUN npm install --no-optional && npm cache clean --force

COPY . .

EXPOSE 3001

CMD ["npm" , "start"]