# Setting Up Environment Variables for Integration Tests

## ✅ Solution Implemented

Your integration tests now **automatically load** environment variables from `.env` files!

## How It Works

Jest has been configured to load your `.env` file before running any tests. Here's what was added:

### 1. Jest Setup File (`src/test-setup.ts`)

```typescript
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from the worker app directory
config({ path: resolve(__dirname, '../.env') });

// Also try loading from project root if worker .env doesn't exist
config({ path: resolve(__dirname, '../../../.env') });
```

### 2. Jest Configuration (`package.json`)

```json
{
  "jest": {
    ...
    "setupFilesAfterEnv": ["<rootDir>/test-setup.ts"]
  }
}
```

### 3. Added `dotenv` Package

```bash
pnpm add -D dotenv
```

## How to Use

### Step 1: Create a `.env` File

Create a `.env` file in one of these locations:

**Option 1: Worker directory (recommended)**
```bash
# apps/worker/.env
GROQ_API_KEY=your_api_key_here
```

**Option 2: Project root**
```bash
# .env (in project root)
GROQ_API_KEY=your_api_key_here
```

### Step 2: Run Tests

Now simply run the tests - no need to export environment variables!

```bash
cd apps/worker

# Integration tests will automatically load GROQ_API_KEY from .env
pnpm test:integration
```

## Verification

The setup has been verified and is working:
- ✅ `.env` file is detected
- ✅ `GROQ_API_KEY` is loaded successfully
- ✅ Integration tests will have access to the API key

## Priority Order

Jest will check for `.env` files in this order:

1. `apps/worker/.env` (worker-specific)
2. `dev-pulse/.env` (project root)

If both exist, values from the worker directory take precedence.

## What Changed

### New Files
- ✅ `src/test-setup.ts` - Jest setup file to load environment variables

### Modified Files
- ✅ `package.json` - Added `dotenv` dependency and Jest setup configuration

### Updated Documentation
- ✅ `tests/README.md` - Updated to mention `.env` file support

## Security Notes

⚠️ **Important:** Make sure `.env` files are in your `.gitignore`!

Check if `.env` is ignored:
```bash
git check-ignore apps/worker/.env
```

If not, add it:
```bash
echo ".env" >> .gitignore
echo "apps/worker/.env" >> .gitignore
```

## Troubleshooting

### Tests Still Can't Find API Key

1. **Verify `.env` file location:**
   ```bash
   ls -la apps/worker/.env
   # or
   ls -la .env
   ```

2. **Check `.env` file content:**
   ```bash
   cat apps/worker/.env
   # Should show: GROQ_API_KEY=...
   ```

3. **Verify the format (no quotes needed):**
   ```env
   # ✅ Correct
   GROQ_API_KEY=gsk_abc123xyz456
   
   # ❌ Incorrect (don't use quotes)
   GROQ_API_KEY="gsk_abc123xyz456"
   ```

4. **Ensure no extra spaces:**
   ```env
   # ✅ Correct
   GROQ_API_KEY=gsk_abc123xyz456
   
   # ❌ Incorrect (has space)
   GROQ_API_KEY = gsk_abc123xyz456
   ```

### Still Having Issues?

Try running with explicit environment variable:
```bash
GROQ_API_KEY=your_key pnpm test:integration
```

If this works but `.env` doesn't, check:
- File permissions: `chmod 644 apps/worker/.env`
- File encoding: Should be UTF-8
- No BOM marker at start of file

## Example `.env` File

Create `apps/worker/.env` with this content:

```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_actual_api_key_here

# Other optional environment variables
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Benefits

✅ **No manual exports needed** - Just create `.env` and run tests  
✅ **Works in development** - Consistent with how your app loads config  
✅ **Team friendly** - Everyone can have their own `.env` file  
✅ **CI/CD compatible** - Can still use environment variables or secrets  
✅ **Secure** - `.env` files stay local, not in git  

## Next Steps

1. ✅ Create your `.env` file with `GROQ_API_KEY`
2. ✅ Run `pnpm test:integration`
3. ✅ Watch your integration tests run with real API calls! 🚀

Your tests should now automatically pick up the `GROQ_API_KEY` from your `.env` file!

