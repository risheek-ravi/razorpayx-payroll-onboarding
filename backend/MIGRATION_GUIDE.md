# Database Migration Guide: SQLite → PostgreSQL

Since Vercel requires PostgreSQL for production, you'll need to create an initial migration for your database schema.

## Why Migrate?

- **SQLite**: File-based database, works locally but NOT on Vercel's serverless functions
- **PostgreSQL**: Cloud database, works everywhere including Vercel

## Option 1: Fresh Start (Recommended for New Projects)

If you don't have important data in your SQLite database:

### Step 1: Get PostgreSQL Database

Choose one:
- **Vercel Postgres**: Free tier, integrated with Vercel
- **Supabase**: Free tier, 500MB storage
- **Neon**: Free tier, 10GB storage

### Step 2: Create Initial Migration

```bash
cd backend

# Set your PostgreSQL DATABASE_URL in .env
echo 'DATABASE_URL="postgresql://user:password@host:5432/dbname"' > .env

# Create initial migration
npx prisma migrate dev --name init

# This creates: prisma/migrations/XXXXXX_init/migration.sql
```

### Step 3: Verify Migration

```bash
# Check if migration was created
ls prisma/migrations/

# Open Prisma Studio to verify tables
npx prisma studio
```

### Step 4: Deploy

```bash
# Deploy to Vercel
vercel --prod

# Migrations will run automatically via vercel-build script
```

## Option 2: Migrate Existing Data

If you have important data in SQLite that you need to keep:

### Step 1: Export SQLite Data

```bash
cd backend

# Install sqlite3 if needed
# macOS: brew install sqlite3
# Ubuntu: sudo apt-get install sqlite3

# Export data to SQL
sqlite3 prisma/dev.db .dump > data_backup.sql
```

### Step 2: Set Up PostgreSQL

```bash
# Add PostgreSQL DATABASE_URL to .env
echo 'DATABASE_URL="postgresql://user:password@host:5432/dbname"' > .env

# Create migration
npx prisma migrate dev --name init
```

### Step 3: Transform and Import Data

The exported SQLite SQL won't work directly in PostgreSQL. You'll need to:

1. **Manual approach**: Use Prisma Studio to manually recreate important records
2. **Script approach**: Write a Node.js script to read SQLite and write to PostgreSQL

**Example migration script:**

```typescript
// scripts/migrate-data.ts
import { PrismaClient as SQLitePrisma } from '@prisma/client';
import { PrismaClient as PostgresPrisma } from '@prisma/client';

const sqlite = new SQLitePrisma({
  datasources: { db: { url: 'file:./dev.db' } }
});

const postgres = new PostgresPrisma({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrate() {
  // Migrate businesses
  const businesses = await sqlite.business.findMany();
  for (const business of businesses) {
    await postgres.business.create({ data: business });
  }

  // Migrate employees
  const employees = await sqlite.employee.findMany();
  for (const employee of employees) {
    await postgres.employee.create({ data: employee });
  }

  // Migrate shifts
  const shifts = await sqlite.shift.findMany();
  for (const shift of shifts) {
    await postgres.shift.create({ data: shift });
  }

  console.log('✅ Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(() => {
    sqlite.$disconnect();
    postgres.$disconnect();
  });
```

Run it:
```bash
npx tsx scripts/migrate-data.ts
```

## Option 3: Keep SQLite for Local Dev

You can use SQLite locally and PostgreSQL in production:

### Step 1: Create Two Prisma Schemas

**For local dev** (`prisma/schema.dev.prisma`):
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
// ... rest of schema
```

**For production** (`prisma/schema.prisma`):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
// ... rest of schema
```

### Step 2: Use Environment-Specific Commands

```bash
# Local development
npx prisma generate --schema=prisma/schema.dev.prisma
npx prisma db push --schema=prisma/schema.dev.prisma

# Production
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy
```

**Note**: This approach is more complex and not recommended for beginners.

## Recommended Approach

For most users, **Option 1 (Fresh Start)** is recommended:

1. ✅ Simple and straightforward
2. ✅ No data migration complexity
3. ✅ Clean database schema
4. ✅ Easier to maintain

## After Migration

### Verify Everything Works

```bash
# 1. Check Prisma Client is generated
npx prisma generate

# 2. Test database connection
npx prisma db push

# 3. Open Prisma Studio
npx prisma studio

# 4. Test API locally
npm run dev

# 5. Test health endpoint
curl http://localhost:3001/health
```

### Update .gitignore

Make sure these are in `.gitignore`:
```
# Database files
*.db
*.db-journal
prisma/dev.db
prisma/dev.db-journal

# Environment
.env
.env.local
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
**Solution**: Create `.env` file with `DATABASE_URL="postgresql://..."`

### "Can't reach database server"
**Solution**: 
- Check DATABASE_URL is correct
- Verify database is running and accessible
- Check firewall/security group settings

### "Migration failed"
**Solution**:
- Drop the database and try again: `npx prisma migrate reset`
- Check PostgreSQL logs for errors
- Verify schema syntax is correct

### "Prisma Client out of sync"
**Solution**: Run `npx prisma generate` after any schema changes

## Quick Reference

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Push schema without migration
npx prisma db push

# Open database GUI
npx prisma studio
```

## Need Help?

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Setup Guide](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgres)
- Check `DEPLOYMENT.md` for deployment-specific issues

---

**Ready to migrate?** Follow Option 1 for the simplest path to production!

