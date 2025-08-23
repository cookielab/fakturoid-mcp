# Debugging Wrangler Dev in Zed

This guide explains how to debug your Cloudflare Workers project using Wrangler Dev in the Zed editor.

## Prerequisites

- Zed editor with debugger support
- Node.js and pnpm installed
- Wrangler CLI (installed as a dev dependency in this project)

## Debug Configurations

The project includes three debug configurations in `.zed/debug.json`:

### 1. Attach to Wrangler Dev

This configuration attaches the debugger to an already running Wrangler Dev server.

**Steps:**
1. Start Wrangler Dev with the inspector enabled:
   ```bash
   pnpm cf:dev -- --inspect
   ```
   Or manually:
   ```bash
   pnpm wrangler dev --inspect
   ```

2. Wait for Wrangler to start and show the inspector message:
   ```
   Debugger listening on ws://127.0.0.1:9229/...
   ```

3. In Zed, press `F5` or run `debugger: start` command
4. Select "Attach to Wrangler Dev" from the list
5. The debugger will attach to the running process

### 2. Launch Wrangler Dev with Debugger

This configuration starts Wrangler Dev with the debugger attached from the beginning.

**Steps:**
1. Set breakpoints in your TypeScript code
2. Press `F5` or run `debugger: start` command
3. Select "Launch Wrangler Dev with Debugger"
4. Wrangler will start with the debugger attached

### 3. Debug TypeScript File

This configuration is for debugging individual TypeScript files directly with tsx.

**Steps:**
1. Open the TypeScript file you want to debug
2. Set breakpoints
3. Press `F5` or run `debugger: start` command
4. Select "Debug TypeScript File"

## Setting Breakpoints

1. Click in the gutter next to the line number where you want to pause execution
2. A red dot will appear indicating the breakpoint
3. Right-click on the breakpoint to:
   - Add conditions
   - Add log messages
   - Set hit counts
   - Disable/enable the breakpoint

## Debug Panel

Once debugging starts, the debug panel will show:
- **Variables**: Local and global variables in the current scope
- **Call Stack**: The execution path to the current breakpoint
- **Breakpoints**: All active breakpoints in your project
- **Debug Console**: Output from `console.log()` and debugger messages

## Tips for Debugging Cloudflare Workers

1. **Source Maps**: Ensure source maps are generated for proper TypeScript debugging
2. **Environment Variables**: Wrangler loads `.dev.vars` automatically in development
3. **Bindings**: KV namespaces, D1 databases, and other bindings work in debug mode
4. **Hot Reload**: Code changes will restart the worker, requiring debugger reattachment

## Troubleshooting

### Debugger won't attach
- Ensure Wrangler is running with `--inspect` flag
- Check that port 9229 is not in use by another process
- Try restarting both Wrangler and Zed

### Breakpoints not hitting
- Verify source maps are enabled in your TypeScript configuration
- Check that the file path in the debugger matches the actual file
- Ensure the code is actually executing (add a `console.log` to verify)

### Performance issues
- Debugging can slow down execution, especially with many breakpoints
- Consider using conditional breakpoints for high-frequency code paths
- Use log points instead of breakpoints for non-intrusive debugging

## Advanced Configuration

You can customize the debug configurations by editing `.zed/debug.json`:

- `skipFiles`: Add patterns to skip stepping into certain files
- `sourceMaps`: Enable/disable source map support
- `resolveSourceMapLocations`: Control where source maps are loaded from
- `outFiles`: Specify where compiled JavaScript files are located

## References

- [Zed Debugger Documentation](https://zed.dev/docs/debugger)
- [Wrangler Debugging Guide](https://developers.cloudflare.com/workers/observability/debugging-workers/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
