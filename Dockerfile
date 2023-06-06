FROM nginx:alpine

COPY . /usr/share/nginx/html

RUN apk update && apk add bash

# https://github.com/storybookjs/storybook/issues/20157#issuecomment-1464901423
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf