FROM node:24-slim AS builder

WORKDIR /usr/src/app

RUN corepack enable

ARG S3_PUBLIC_ENDPOINT=https://s3.seokgukim.com
ARG S3_BLOG_PATH=/blog
ARG NEXT_PUBLIC_GA_ID=

ENV S3_PUBLIC_ENDPOINT=$S3_PUBLIC_ENDPOINT
ENV S3_BLOG_PATH=$S3_BLOG_PATH
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:1.29-alpine

COPY --from=builder /usr/src/app/out /usr/share/nginx/html

EXPOSE 80
