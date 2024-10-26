# Security Hardened Deno for macOS

https://littledivy.com/sh-deno

Overcome the technical limitations of Deno permission system by wrapping it with
macOS's native sanboxing primitives.

```diff
- deno run --allow-read=. --allow-ffi main.ts
+ sh-deno run --allow-read=. --allow-ffi main.ts
```

Permissions are enforced on child processes, FFI native code and Deno's
internals.

```c
// sample FFI dylib

static void __attribute__((constructor)) 
initialize(void)
{
  fopen("/etc/passwd", "r"); // blocked by sh-deno
}
```

> **Note**: This project is in early development stage. Please use with caution.
