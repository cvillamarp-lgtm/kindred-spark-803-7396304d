

## Fix Build Error

The issue is simple: `ContentPipeline.tsx` line 10 uses `import PageHeader from ...` (default import), but `PageHeader` is a named export.

### Change
- **`src/pages/ContentPipeline.tsx` line 10**: Change `import PageHeader from` to `import { PageHeader } from`

