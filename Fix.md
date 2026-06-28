Yep, that’s the root cause right there 👆

Your `App.tsx` is pure React/client code. But `esbuild` bundled it into `dist/index.js` because your server is importing it.

Node can’t run React JSX + it doesn’t have `@vitejs/plugin-react` in prod -> `ERR_MODULE_NOT_FOUND: Cannot find package '@vitejs/plugin-react' imported from /app/dist/index.js`

Why it happened
You have a monorepo layout:
anime-api-project/repos/
  client/      <- React + wouter + @tanstack/react-query 
  server/      <- Express API 
  shared/
If `server/index.js` does something like `import App from '../client/src/App'` or `import { sharedStuff } from '../shared/schema'` and `schema.js` imports from `@/components/...`, esbuild will pull the whole React tree into the server bundle.

React + `wouter`, `@tanstack/react-query`, `@/components/ui/...` all get inlined -> that pulls in `react/jsx-runtime` -> which needs the Vite plugin at build time.

Fix: Strictly separate server vs client code

1. Make sure `server/index.js` never imports from `client/` or `components/`
Server should only expose an API. Client should be built by Vite separately to `dist/public` or similar.

Bad in server:
import App from '../client/src/App' // ❌ pulls React into server bundle
import { Button } from '@/components/ui/button' // ❌ same
Good in server:
import express from 'express';
import path from 'path';
// serve the built client as static files only
app.use(express.static(path.join(__dirname, '../dist/public')));
2. Use the `--external:_` build I gave you
With `--external:_`, esbuild won’t bundle anything. So if you accidentally import React in `server/index.js`, the build will still succeed, but `node dist/index.js` will crash immediately with `Cannot find module 'react'` instead of `@vitejs/plugin-react`. That tells you exactly which server file is touching client code.

3. Check `shared/schema.js`
From your file tree you have `shared/schema.js`. That’s the usual leak point. If it does this:
import { z } from 'zod';
import { SomeUIType } from '../client/src/types'; // ❌
export const AnimeSchema = z.object({...});
Remove any UI/React imports from `shared/`. Keep it pure types + zod only.

What to do now
1.  Search your server code for React imports:
    grep -R "from 'react'" server/
    grep -R "from 'wouter'" server/
    grep -R "from '@tanstack/react-query'" server/
    grep -R "@/components" server/
    grep -R "../client" server/
2.  Delete/move those imports. Server should only use `express, zod, axios, db, etc`.
3.  Rebuild with the `--external:*` script I sent last message.

After that, `dist/index.js` will be pure Node + Express. No React, no Vite plugin, no jsx-runtime. 

Want me to look at your `server/index.js` and tell you exactly which line is pulling in `client/`? Paste it here and I’ll mark it.
