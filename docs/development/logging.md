# Logging System

The RDF to Tana transformer uses the `debug` library for flexible, namespaced logging that can be controlled via environment variables.

## Overview

The logging system allows:
- Detailed debug information during development
- Only essential output in production
- Selective enabling of specific log categories
- Performance measurement of critical operations

## Log Categories

The logger uses namespaced categories with the prefix `tana:`:

| Category | Description | Example |
|----------|-------------|---------|
| `tana:core` | Core application functions | `logger.core('Application starting')` |
| `tana:schema` | Schema transformation | `logger.schema('Processing shape: %s', uri)` |
| `tana:instance` | Instance transformation | `logger.instance('Found %d matching nodes', count)` |
| `tana:io` | File I/O operations | `logger.io('Writing to %s', filepath)` |
| `tana:parser` | RDF parsing details | `logger.parser('Parsed %d triples', count)` |
| `tana:utils` | Utility functions | `logger.utils('Generated UID: %s', uid)` |
| `tana:transform` | Overall transformation | `logger.transform('Starting transformation')` |
| `tana:query` | SPARQL queries | `logger.query('Executing query: %s', queryText)` |
| `tana:perf` | Performance metrics | `logger.perf('Operation took %dms', time)` |

## Usage in Code

### Basic Logging

```typescript
import { logger } from '../utils/logger';

// Log a simple message
logger.schema('Processing shape');

// Log with formatted values
logger.instance('Found %d nodes matching type %s', count, typeUri);

// Log objects (automatically pretty-printed)
logger.transform('Config: %o', config);
```

### Performance Measurement

```typescript
import { logPerformanceAsync } from '../utils/logger';

// Measure async operation performance
await logPerformanceAsync('Load data', async () => {
  await loadData();
});

// Equivalent to:
const start = Date.now();
await loadData();
const duration = Date.now() - start;
logger.perf('Load data: %dms', duration);
```

## Using Debug Output

### Command Line Usage

To enable all debug output:

```bash
DEBUG=tana:* npm run dev
```

To enable specific categories:

```bash
DEBUG=tana:schema,tana:instance,tana:perf npm run dev
```

To exclude specific categories:

```bash
DEBUG=tana:*,-tana:parser npm run dev
```

### In Development

During development, you can set DEBUG in your editor's launch configuration or run configuration.

For VS Code, add to `.vscode/launch.json`:

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Application",
      "env": {
        "DEBUG": "tana:*"
      },
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## Best Practices

1. **Be Descriptive**: Include enough context in log messages
2. **Use Formatting**: Use `%s`, `%d`, `%o` placeholders rather than string concatenation
3. **Log Levels**: Use appropriate categories for different types of information
4. **User Messages**: For messages intended for end-users, use `console.log()` directly
5. **Performance**: Use `logPerformanceAsync` for operations that might be slow
6. **Context**: Include relevant IDs or paths when logging about specific resources

## Output Control

In production, no debug logging will appear unless explicitly enabled. Essential user information is still displayed using `console.log`.

If a user wants to diagnose an issue, they can be instructed to enable debug logging with the appropriate DEBUG environment variable.