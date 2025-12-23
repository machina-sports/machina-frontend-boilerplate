# Machina Frontend Boilerplate

This boilerplate is the standardized foundation for all Machina Sports frontends. It incorporates:

- **Next.js 16** (App Router)
- **Redux Toolkit** (State management)
- **Tailwind CSS 4** (Styling)
- **White Label / Multi-Brand Support** (Configurable theming and content)
- **Strict TypeScript** & **ESLint** (Code quality)
- **🤖 Machina Assistant** (Machina Advanced Assitant Model )

---

## 🤖 AI / Cursor Guide

**Role:** You are an expert Machina frontend engineer.
**Goal:** Maintain consistency, type safety, and the "Machina Standard" across all contributions.

### Architecture Overview

1. **Providers (`providers/`)**: Domain-specific logic bundles (e.g., `providers/auth`, `providers/data`).
   - Each folder MUST contain: `actions.ts` (Thunks), `reducer.ts` (Slice), `service.ts` (API calls), `provider.tsx` (React Context/Hooks).
   - **Rule:** Redux slices are registered in `store/index.ts`. Components consume state via `useAppSelector` and dispatch via `useAppDispatch`.

2. **HTTP Layer (`libs/client/`)**: Use `libs/client/base.controller.ts` (Axios wrapper) for all requests.
   - Extend `ClientBaseService` in your domain services (e.g., `class MyService extends ClientBaseService`).
   - **Rule:** Never use `fetch` or raw `axios` directly in components.

3. **Components (`components/`)**: **Shared UI**: `components/ui` (Shadcn-like primitives). **Features**: Feature-specific UI goes in `components/<feature>`.
   - **Rule:** Components should be presentational. Logic belongs in Providers/Redux.

4. **Configuration (`config/`)**: **Brands**: `config/brands` defines per-brand tokens (colors, text, assets). **Runtime**: `config/runtime.ts` for env vars.

### Coding Standards

- **Strict Types**: No `any`. Define interfaces for all API responses and Props.
- **Server vs Client**: Use `"use client"` only when necessary (interactive hooks). Prefer Server Components for fetching initial data where possible, but this boilerplate favors Client-side Redux for complex state.
- **Styling**: Tailwind utility classes. Use `className` prop for overrides.
- **Localization**: All text must be in **English**.

---

## 🚀 Developer Guide

### Prerequisites

- Node.js (LTS)
- npm or yarn

### Quick Start

1. **Clone & Install**:

   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Prepare for Production** (Optional):
   Remove example files and dependencies:

   ```bash
   npm run prepare:production
   npm install  # Update dependencies
   ```

   > 💡 This will ignore example pages (`/docs`, `/redux-demo`), example components, and optional dependencies. See `scripts/README.md` for details.

3. **Environment Setup**:
   Create `.env.local`:

   ```env
   # Brand Configuration (default, sportingbet, bwin)
   NEXT_PUBLIC_BRAND=default

   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   MACHINA_API_KEY=your_key
   MACHINA_CLIENT_URL=your_url
   ```

4. **Run Development**:
   ```bash
   npm run dev
   # or with specific brand
   NEXT_PUBLIC_BRAND=sportingbet npm run dev
   ```

### Project Structure

```
├── app/                  # Next.js App Router (Routes & Layouts)
│   ├── api/              # Route Handlers (BFF pattern)
│   ├── layout.tsx        # Root layout with Providers
│   └── page.tsx          # Home page
├── components/           # React Components
│   ├── ui/               # Reusable primitives
│   └── ...               # Feature components
├── config/               # Configuration (Brands, Runtime)
├── providers/            # Domain Logic (Redux + Context)
│   └── <domain>/         # e.g., session, data
│       ├── actions.ts    # Redux Thunks
│       ├── reducer.ts    # Redux Slice
│       ├── service.ts    # API Service
│       └── provider.tsx  # React Provider
├── libs/                 # Library Code
│   └── client/           # HTTP Client Base
├── store/                # Redux Store Configuration
└── public/               # Static Assets
```

### Adding a New Feature

1. **Create Provider**: Add `providers/<feature>/` with actions, reducer, service.
2. **Register Reducer**: Add the new reducer to `store/index.ts`.
3. **Wrap App**: Add the provider to `providers/provider.tsx` (if global) or specific route layout.
4. **Create UI**: Build components in `components/<feature>` using the state.

### HTTP Requests (BFF Pattern)

We use Next.js Route Handlers (`app/api/...`) as a BFF (Backend for Frontend) to proxy requests to backend services, handling authentication and secrets securely.

**Example: `app/api/article/route.ts`**

```typescript
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const api_url = process.env.MACHINA_CLIENT_URL;
  const bearer = process.env.MACHINA_API_KEY;

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${api_url}/document/search`, {
      method: 'POST',
      headers: {
        'X-Api-Token': `${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters: { _id: id } }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

---

## 🧹 Preparing for Production

This boilerplate includes example files and optional dependencies that you may want to remove when starting a new project.

### Quick Setup

After cloning and installing dependencies, run:

```bash
npm run prepare:production
npm install  # Update dependencies after removing optional packages
```

This will:

- ✅ Add example files to `.gitignore` (won't be committed)
- ✅ Remove optional dependencies from `package.json`:
  - `react-markdown` (used for docs page)
  - `react-syntax-highlighter` (used for code highlighting)
  - `@types/react-syntax-highlighter`

**Example files that will be ignored:**

- `app/page.tsx` (example home page with development tips)
- `app/docs/` (documentation page)
- `app/redux-demo/` (Redux demo page)
- `app/deploy/` (deployment guide page)
- `app/components/` (example tip components)
- `components/header/` (example header component)
- `components/footer/` (example footer component)
- `providers/sample/` (example Redux provider)
- `README.md` and documentation files (`.md` files)
- `ENV_EXAMPLE_*` (example environment files)
- `scripts/test-gemini.js` (testing script)

**Note:** After running `prepare:production`, you'll need to manually remove code references:

- Remove `SampleProvider` from `providers/provider.tsx`
- Remove `SampleReducer` from `store/index.ts`
- Remove `Footer` from `app/layout.tsx` (if you don't want it)
- Create your own `app/page.tsx` home page

### Restore Development Mode

To restore example files and dependencies (useful when contributing to the boilerplate):

```bash
npm run prepare:development
npm install  # Restore dependencies
```

For more details, see [`scripts/README.md`](scripts/README.md).

---

## 🎨 Branding & White Label

The app supports multi-brand deployment via `NEXT_PUBLIC_BRAND`.

- **Config**: `config/brands/index.ts`
- **Usage**: `useBrand()` hook or `BrandProvider`.
- **CSS**: CSS variables are injected automatically based on the selected brand.

---

## 🔒 Security

This boilerplate follows security best practices to protect API keys and sensitive data.

### Key Security Features

- ✅ **BFF Pattern**: All external API calls go through Next.js API routes (`/app/api/*`)
- ✅ **Server-Side Keys**: API keys (`MACHINA_API_KEY`, `GEMINI_API_KEY`) are server-side only
- ✅ **No Client Exposure**: Sensitive keys never reach the browser
- ✅ **Environment Variables**: `.env` files are gitignored

### Security Checklist

Before deploying:

- [ ] Verify no `NEXT_PUBLIC_*` prefix for sensitive API keys
- [ ] All external API calls use `/api/*` proxy routes
- [ ] `.env` files are not committed to git
- [ ] Production environment variables are set securely (GitHub Secrets, etc.)

### Important Notes

⚠️ **Never use `NEXT_PUBLIC_MACHINA_API_KEY` or `NEXT_PUBLIC_GEMINI_API_KEY`**

- These would expose keys to the client
- Always use server-side environment variables: `MACHINA_API_KEY`, `GEMINI_API_KEY`

For detailed security review, see [`scripts/SECURITY_REVIEW.md`](scripts/SECURITY_REVIEW.md).

---

## 🚀 Deployment

This boilerplate includes GitHub Actions workflows for automated CI/CD to Azure Kubernetes Service (AKS).

### Quick Overview

1. **Build Workflow** (`.github/workflows/build-staging.yml`): Automatically builds and pushes Docker images when a staging tag is pushed.
2. **Release Workflow** (`.github/workflows/release-staging.yml`): Manually deploys a specific image tag to Kubernetes.

### Setup Steps

1. **Customize Workflows**: Edit both workflow files and replace `app-name` with your application name. Update cluster and resource group names.
2. **Configure GitHub Secrets**: Add required secrets and variables in GitHub Settings → Secrets and variables → Actions.
3. **Setup Kubernetes**: Create registry secret and apply Kubernetes manifests from `k8s/` directory.
4. **Deploy**: Create a staging tag (`v.staging-*`) to trigger build, then manually trigger release workflow.

### Detailed Guide

For complete deployment instructions, see the [Deployment Guide](/deploy) page or check the example workflows in `.github/workflows/`.

**Required GitHub Secrets:**

- `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `REGISTRY_URL`
- `AZURE_CREDENTIALS`

**Required GitHub Variables:**

- `MACHINA_API_KEY`, `MACHINA_CLIENT_URL`
- `NEXT_PUBLIC_BRAND`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_API_BASE_URL`

---

## 🤝 Contributing

1. Fork & Branch (`feat/my-feature`).
2. Commit with semantic messages.
3. Open PR.

## 📞 Support

Contact: mateus.pinheiro@machina.gg
