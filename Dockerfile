###############
### STAGE 1: Build app
###############
ARG BUILDER_IMAGE=node:22.9.0-alpine
ARG NGINX_IMAGE=nginx:1.27.4-alpine3.21-slim

FROM $BUILDER_IMAGE as builder

# Build args
ARG FINERACT_API_URLS
ARG FINERACT_API_URL
ARG FINERACT_PLATFORM_TENANT_IDENTIFIER
ARG MIFOS_DEFAULT_CHAR_DELIMITER
ARG MIFOS_DEFAULT_LANGUAGE
ARG MIFOS_DEFAULT_DATE_FORMAT
ARG MIFOS_OAUTH_SERVER_ENABLED

# Set as environment variables for build process (Angular may need them)
ENV FINERACT_API_URLS=${FINERACT_API_URLS}
ENV FINERACT_API_URL=${FINERACT_API_URL}
ENV FINERACT_PLATFORM_TENANT_IDENTIFIER=${FINERACT_PLATFORM_TENANT_IDENTIFIER}
ENV MIFOS_DEFAULT_CHAR_DELIMITER=${MIFOS_DEFAULT_CHAR_DELIMITER}
ENV MIFOS_DEFAULT_LANGUAGE=${MIFOS_DEFAULT_LANGUAGE}
ENV MIFOS_DEFAULT_DATE_FORMAT=${MIFOS_DEFAULT_DATE_FORMAT}
ENV MIFOS_OAUTH_SERVER_ENABLED=${MIFOS_OAUTH_SERVER_ENABLED}


ARG NPM_REGISTRY_URL=https://registry.npmjs.org/
ARG BUILD_ENVIRONMENT_OPTIONS="--configuration production"
ARG PUPPETEER_DOWNLOAD_HOST_ARG=https://storage.googleapis.com
ARG PUPPETEER_CHROMIUM_REVISION_ARG=1011831
ARG PUPPETEER_SKIP_DOWNLOAD_ARG

# Set the environment variable to increase Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN apk add --no-cache git

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Export Puppeteer env variables for installation with non-default registry.
ENV PUPPETEER_DOWNLOAD_HOST $PUPPETEER_DOWNLOAD_HOST_ARG
ENV PUPPETEER_CHROMIUM_REVISION $PUPPETEER_CHROMIUM_REVISION_ARG

ENV PUPPETEER_SKIP_DOWNLOAD $PUPPETEER_SKIP_DOWNLOAD_ARG

COPY ./ /usr/src/app/

RUN npm cache clear --force

RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set registry $NPM_REGISTRY_URL --location=global

RUN npm install --location=global @angular/cli@16.0.2

RUN npm install

RUN ng build --output-path=/dist $BUILD_ENVIRONMENT_OPTIONS

###############
### STAGE 2: Serve app with nginx ###
###############
FROM $NGINX_IMAGE


COPY --from=builder /dist /usr/share/nginx/html

EXPOSE 80

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
