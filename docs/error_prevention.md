# Development Rules & Error Prevention Guidelines

This document catalogs encountered errors and establishes mandatory rules to prevent their recurrence. **Always reference this file before starting a new implementation task.**

## 1. Next.js App Router & Server/Client Components

### 🔴 Error: "Event handlers cannot be passed to Client Component props"

- **Context**: Passing an `onClick={() => void}` function or a server-side event handler from a `page.tsx` (Server Component) to a child component.
- **Root Cause**: Server Components execute on the server and serialize props to JSON. Functions are not serializable.
- **✅ Rule**:
  - **Never pass functions as props from Server Components.**
  - Pass only serializable data (strings, numbers, objects).
  - Move interaction logic (state, event handlers) _inside_ the Client Component.
  - If a component needs interactivity, mark it with `"use client";` at the very top.

### 🔴 Error: "use client" missing for interactive components

- **Context**: Using `useState`, `useEffect`, `useRouter`, or event handlers in a component without `"use client"`.
- **Root Cause**: By default, components in `app/` are Server Components.
- **✅ Rule**:
  - If a component uses React hooks (`useState` etc.) or DOM events (`onClick`), **explicitly add `"use client";`** as the first line.

## 2. Testing (Vitest & Playwright)

### 🔴 Error: Vitest running E2E tests

- **Context**: `npm run test:coverage` failing because it tries to execute `e2e/*.spec.ts`.
- **Root Cause**: Vitest config default include pattern matches e2e files.
- **✅ Rule**:
  - In `vitest.config.ts`, **always explicitly exclude the e2e directory**:
    ```ts
    exclude: ["**/e2e/**", "**/node_modules/**", ...]
    ```

### 🔴 Error: E2E Selector Failures with Shadcn UI (`asChild`)

- **Context**: `getByRole("button")` failing when testing a `<Button asChild><Link ...></Button>`.
- **Root Cause**: `asChild` merges the Button's styles onto the child element. If the child is a `<Link>`, the semantic role becomes `link` (`<a>`), not `button`.
- **✅ Rule**:
  - When testing components using `asChild`, **assert against the underlying HTML semantics**.
  - For `<Button asChild><Link ...>`, use `getByRole("link")`.

### 🔴 Error: CI/Test Timeouts (Cold Start)

- **Context**: E2E tests failing because the dev server took too long to start or redirect.
- **Root Cause**: Serverless/Cold environments or first-time builds can be slow.
- **✅ Rule**:
  - Use generous timeouts for critical navigation steps in E2E tests (e.g., `timeout: 30000`).
  - Use `test.beforeEach` to ensure the app is in a ready state.

## 3. Localization (i18n)

### 🔴 Error: Incomplete Translation

- **Context**: Translating a page but missing child components (e.g., specific cards or tooltips).
- **✅ Rule**:
  - When localizing, **inspect the entire component tree**.
  - Check reusable components (like Cards, badges, tooltips) for hardcoded English strings.

## 4. General Development

### 🔴 Error: Deprecation Warnings

- **Context**: `middleware` file convention warning in Next.js 15+.
- **✅ Rule**:
  - Pay attention to build warnings.
  - Follow the latest official documentation rules (e.g., naming conventions).

## 5. Recharts & Tooltips

### 🔴 Error: Type mismatch in Tooltip Formatter

- **Context**: `recharts` Tooltip `formatter` props failing with `ValueType` or `undefined` mismatches.
- **Root Cause**: Recharts' `value` passed to the formatter can be `undefined` according to internal types.
- **✅ Rule**:
  - Always handle `undefined` explicitly in the formatter parameter.
  - Use `(value: string | number | readonly (string | number)[] | undefined) => ...` or similar wide types.
  - Convert to number safely: `Number(value ?? 0)`.

---

**Last Updated**: 2026-01-03

## 6. Linting & Code Quality

### 🔴 Error: Pre-commit Lint Failures (Unused vars, explicit any)

- **Context**: Committing code that fails basic lint checks due to unused imports/variables or usage of `any`.
- **Root Cause**: Rushing to commit/complete without running the linter locally first.
- **✅ Rule**:
  - **Always run `npm run lint`** (or check IDE problems) before marking a task as complete.
  - **Remove unused imports** immediately after refactoring code (e.g., `ColumnDef` defined but never used).
  - **Avoid `any`**. Use proper types. If a fallback is absolutely necessary, ensure it satisfies the type checker or use specific suppressions sparingly (and justify them).

### 🔴 Error: `SqliteError: no such table` during `next build`

- **Context**: Build failing because Next.js tries to statically generate pages that query the database, but the DB doesn't exist in the CI/Build environment.
- **Root Cause**: Next.js attempts SSG (Static Site Generation) by default for server components without dynamic inputs.
- **✅ Rule**:
  - For pages requiring real-time DB access (e.g., Dashboard, Market List), **always export `export const dynamic = "force-dynamic";`**.
  - This prevents Next.js from trying to connect to the DB at build time and ensures data is fetched fresh on every request.

### 🔴 Error: Use of `@ts-ignore`

- **Context**: Using `@ts-ignore` to suppress TypeScript errors.
- **Root Cause**: `@ts-ignore` suppresses all errors on the next line, potentially hiding real bugs or regressions. It also fails linting if there is no error (`@typescript-eslint/ban-ts-comment`).
- **✅ Rule**:
  - **Never use `@ts-ignore`**.
  - **Use `@ts-expect-error` instead** if you must suppress an error. This ensures that if the error is fixed later, TypeScript will alert you to remove the suppression.
  - **Justify the suppression**: Always add a comment explaining _why_ the suppression is needed (e.g., library type mismatch).

## 7. Quality Assurance (QA) & Hooks

### 🔴 Error: Lint/Type Errors in "Completed" Code

- **Context**: Code marked as complete but failing due to `react-hooks/set-state-in-effect` or TypeScript operator mismatches (comparing string vs number).
- **Root Cause**: Skipping manual `lint` and `tsc` checks relying only on partial IDE feedback.
- **✅ Rule**:
  - **Strict QA Check**: Before ANY commit or completion notification, run:
    - `npm run lint`
    - `npx tsc --noEmit`
  - **Zero Tolerance**: Do not proceed until **ALL** errors and warnings (including Tailwind class warnings) are resolved.

### 🔴 Error: `react-hooks/set-state-in-effect`

- **Context**: Using a function (`loadFilters`) inside `useEffect` that updates state, but not managing dependencies correctly, causing potential loop warnings or stale closures.
- **✅ Rule**:
  - **Wrap functions in `useCallback`** if they are used in `useEffect`.
  - **Inline** fetch logic inside `useEffect` if the function is only used once on mount.
  - Ensure the dependency array is exhaustive.

### 🔴 Error: TypeScript Operator Mismatch (`>` cannot be applied to types `string | number` and `number`)

- **Context**: Comparing a database value (typed as `string | number`) directly with a numeric threshold.
- **✅ Rule**:
  - **Strict Type Guards**: Never assume a union type is a number.
  - **Explicit Conversion**: Use `parseFloat` or type casting (after verification) before arithmetic operations.
  - Example: `const stockVal = typeof val === 'string' ? parseFloat(val) : val;`

## 8. Data Consistency & Metric Scaling

### 🔴 Error: Mismatch between Frontend Format (%) and Backend Storage (Decimal)

- **Context**: User sees "4.5%" in UI, inputs threshold "4.5", but backend stores `0.045`. Comparison `0.045 >= 4.5` fails universally.
- **Root Cause**: Storing raw decimal values while displaying formatted percentage values using a multiplier (e.g., x100) only at render time.
- **✅ Rule**:
  - **Store Internal Values at Display Scale**: If the user thinks in percentages (e.g., "ROE 15%"), the internal `rawValue` used for logic/filtering MUST be `15.0`, not `0.15`.
  - **Unified Conversion**: Use a central transformation logic (like `createMetric`) that applies the multiplier (`x100`) to _both_ the formatted string string AND the logic-driving `rawValue`.

### 🔴 Error: Broken Component Hierarchy during Refactoring

- **Context**: `Parsing error: ')' expected` or `JSX element has no corresponding closing tag`.
- **Root Cause**: Removing a wrapper component (e.g., `<Provider>`) but forgetting to remove its corresponding closing tag (`</Provider>`).
- **✅ Rule**:
  - **Verify Closing Tags**: When removing or moving a wrapper component, explicitly locate and remove the closing tag immediately.
  - **Lint Check Post-Refactor**: Always run linting focused on the modified file immediately after structural JSX changes.

### 🔴 Error: DB Operation Failure due to ID Normalization Mismatch

- **Context**: Deleting or updating a record (e.g., Stock) fails silently even though the UI reports success.
- **Root Cause**: Passing a "display value" (e.g., "7203") to a Server Action instead of the "database ID" (e.g., "7203.T").
- **✅ Rule**:
  - **Always use `stock.id` (normalized code) for DB operations.**
  - **Differentiate between `code` (display) and `id` (storage key)** in the frontend `Stock` type.
  - In Server Actions, ensure the passed identifier is validated against the exact format stored in the database.

## 9. Type Synchronization

### 🔴 Error: Type 'X' is missing properties from type 'StockMetrics'

- **Context**: Adding new metrics to `StockMetrics` or `ScrapedData` but forgetting to update dependent files.
- **Root Cause**: Multiple files create/map `StockMetrics` objects and must be kept in sync.
- **✅ Rule**:
  - **Update ALL of the following files** when adding new metrics:
    1. `src/types/stock.ts` (both `StockMetrics` and `ScrapedData` interfaces)
    2. `src/lib/stock-fetcher.ts` (real-time fetch logic)
    3. `scraper/main.py` (batch fetch logic)
    4. `src/lib/stock-utils.ts` (`transformScrapedDataToStock` metrics object)
    5. `src/lib/screener.ts` (`mapScrapedDataToStock` metrics object) ⚠️ **Easily forgotten!**
    6. `src/components/dashboard/market/table-config.ts` (if displaying in table)
  - **Use the workflow**: Run `/stock-metrics-update` for the full checklist.

## 10. Next.js Caching (`unstable_cache`)

### 🔴 Error: "Failed to set Next.js data cache - items over 2MB cannot be cached"

- **Context**: Using `unstable_cache` to cache large datasets (e.g., 4000+ stocks).
- **Root Cause**: Next.js has a **2MB limit** for cached items. Large data (3.2MB+) exceeds this.
- **✅ Rule**:
  - **Check data size before caching**: Estimate serialized JSON size of return value.
  - **For large datasets (>1MB)**:
    - Use client-side optimizations instead (e.g., virtual scrolling)
    - Cache smaller subsets or paginated data
    - Consider Redis/external cache for production
  - **Alternative**: Skip caching for pages with large data and optimize initial render instead.

### 🔴 Error: Type 'Function' is not assignable to type 'string[]' in `unstable_cache` tags

- **Context**: TypeScript error when passing a function to the `tags` parameter: `tags: (id: string) => [...]`.
- **Root Cause**: `unstable_cache` expects static `tags: string[]`, not a function.
- **✅ Rule**:
  - **`tags` must be a static array**: Use `tags: ["tag1", "tag2"]`.
  - **No dynamic tags**: Cannot use parameter-based tags like `tags: (id) => [`user-${id}`]`.
  - **For per-resource invalidation**: Use `revalidateTag("resource-type")` to invalidate all related items, or use multiple static tags.

### 🔴 Error: Cache Key Collision (`unstable_cache`)

- **Context**: Using `unstable_cache` inside a function with arguments (e.g., `getBox(id)`), but using a static key like `["box-data"]`.
- **Root Cause**: The cache key `["box-data"]` is global. All calls to `getBox(id)` regardless of `id` share the same cache entry (the first one cached).
- **✅ Rule**:
  - **Include arguments in the key**: Use `[`box-data-${id}`]` or `["box-data", id]`.
  - **Dynamic wrapper**: Define the cached function _inside_ the main function scope to capture arguments, or pass arguments explicitly to the key array.

---

**Last Updated**: 2026-01-06
