FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=scanner-engine

CMD ["pnpm", "start", "--filter=scanner-engine"]
