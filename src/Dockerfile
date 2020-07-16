FROM tiangolo/uwsgi-nginx-flask:python3.6-alpine3.8
ENV LISTEN_PORT 6970
ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_DEFAULT_REGION=
ENV DEFAULT_BUCKET=
EXPOSE 6970
COPY nlp_module/ /app
COPY deps/ /deps
COPY custom.conf /etc/nginx/conf.d/
RUN apk add --no-cache linux-headers python3-dev libstdc++ && \
    apk add --no-cache g++ && \
    ln -s /usr/include/locale.g /usr/include/xlocale.h && \
    pip install --no-cache-dir .
RUN apk --update add openjdk8-jre
