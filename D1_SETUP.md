# Cloudflare D1 setup

This project now has a Worker API and D1 schema for accounts, email verification, partner applications, verification documents, posts, unlocks, and admin sessions.

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

## 5. Configure real email verification

Registration sends a real email code through Resend. Create a Resend API key, verify the sending domain, then add the key as a Cloudflare Worker secret:

```powershell
npx wrangler secret put RESEND_API_KEY
```

`MAIL_FROM` is configured in `wrangler.toml` as `售业平台 <noreply@shouye.fun>`. Change it after your mail provider confirms the exact sender address.

## 6. Deploy

```powershell
npm run deploy
```

After deployment:

- Registration and login write to D1.
- Registration requires a real email verification code.
- Publishing posts writes to D1.
- Partner applications write to D1 and appear in the admin console.
- The hidden admin entry logs in through the Worker API.
- The admin console reads and updates D1 users, documents, points, account status, and posts.

Until the D1 binding is configured, the public page keeps using local demo data and API calls return a clear `D1 数据库尚未绑定` message.
