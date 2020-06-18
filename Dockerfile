
FROM node:13.12-alpine as build

# set working directory
WORKDIR /app

# copy dependency list
COPY ./package.json ./

#install app deps
RUN npm install

#copy application source code
COPY ./ .

# build production app and optimize
RUN npm run build


# production environment
FROM nginx:1.17.9-alpine
COPY --from=build /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]