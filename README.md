# Security Hardened Deno for macOS

Overcome the technical limitations of Deno permissions system with macOS's
`sandbox-exec` to make harden the sandbox.

```diff
- deno run --allow-read main.ts
+ shd run --allow-read main.ts
```
