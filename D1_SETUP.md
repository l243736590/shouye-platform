# Cloudflare D1 setup

This project now has a Worker API and D1 schema for accounts, verification documents, posts, unlocks, and admin sessions.

## 1. Log in to Wrangler

```powershell
npx wrangler login
```

## 2. Create the D1 database

```powershell
npm run db:create
```

Copy the `database_id` from the command output.

## 3. Bind D1 in `wrangler.toml`

Uncomment the `[[d1_databases]]` block and replace `REPLACE_WITH_D1_DATABASE_ID`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "shouye-platform-db"
database_id = "your-d1-database-id"
migrations_dir = "migrations"
```

## 4. Apply migrations

```powershell
npm run db:migrate
```

## 5. Deploy

```powershell
npm run deploy
```

After deployment:

- Registration and login write to D1.
- Publishing posts writes to D1.
- The hidden admin entry logs in through the Worker API.
- The admin console reads and updates D1 users, documents, points, account status, and posts.

Until the D1 binding is configured, the public page keeps using local demo data and API calls return a clear `D1 数据库尚未绑定` message.
