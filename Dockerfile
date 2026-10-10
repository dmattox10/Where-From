FROM node:20-alpine AS build
WORKDIR /app

# npm, not yarn: this repo carries a package-lock.json and no yarn.lock, which
# is the opposite of the home-v4 sites. `npm ci` rather than `npm install` so a
# deploy installs the locked tree and fails loudly if the lock has drifted from
# package.json, instead of quietly resolving something new on the server.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# GITHUB_PAGES is deliberately NOT set. vite.config.js reads it to choose the
# base path, and the unset branch gives './' — relative, which is what both
# Capacitor (file://) and a site served at the root of its own domain need.
# Setting it would produce '/Where-From/' and every asset here would 404.
#
# build:web, not build. The GA tag is injected only by this script (see
# vite.config.js); `npm run build` stays clean because `npm run sync` uses it to
# feed `cap sync`, and analytics must not reach the store binary.
RUN npm run build:web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
