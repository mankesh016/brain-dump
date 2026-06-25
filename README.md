# Brain Dump

setup commands

```bash
npx create-next-app@latest brain-dump

npm install prisma @prisma/client
npx prisma init

docker compose up -d
# if not works docker compose down -v, then again try

npx prisma migrate dev --name init

npm install @prisma/adapter-pg pg @types/pg

prisma migrate reset
npx prisma migrate dev --name init
npx prisma generate


npx prisma db seed
```
