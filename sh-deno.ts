// Copyright 2024 Divy Srivastava. All rights reserved. MIT license.
//
// https://reverse.put.as/wp-content/uploads/2011/09/Apple-Sandbox-Guide-v1.0.pdf

import {
  allow,
  buildSeatbeltConfig,
  path,
  remoteIp,
  type SeatbeltConfigValue,
  subpath,
} from "./seatbelt.ts";
import { parseArgs } from "jsr:@std/cli@1.0.6/parse-args";

const rules: Record<string, (...args: string[]) => SeatbeltConfigValue> = {
  "allow-run": (...paths: string[]) =>
    allow("process-exec", [
      ...paths.map((path) => subpath(path)),
    ]),
  "allow-read": (...paths: string[]) =>
    allow("file-read*", [
      ...paths.map((path) => subpath(path)),
    ]),
  "allow-write": (...paths: string[]) =>
    allow("file-write*", [
      ...paths.map((path) => subpath(path)),
    ]),
  "allow-net": (...hosts: string[]) => [
    allow("network-bind", hosts.map(remoteIp)),
    allow("network-outbound", hosts.map(remoteIp)),
  ],
  "allow-sys": () => [
    "sysctl-read",
  ],
};

export async function run(args: string[]) {
  const execPath = Deno.execPath();

  const config = buildSeatbeltConfig([
    "system-fsctl",
    "process-fork",

    allow("process-exec", [
      path(execPath),
    ]),

    ...createRules(args),

    allow("file-read*", [
      subpath(new URL(".", import.meta.url).pathname),
      path(execPath),

      subpath(denoDir()),
    ]),
  ]);

  if (args.includes("--emit-profile")) {
    console.log(config);
    return;
  }

  const command = new Deno.Command("sandbox-exec", {
    args: ["-p", config, "deno", ...args],
    stdout: "inherit",
    stderr: "inherit",
  });

  await command.output();
}

export function* createRules(args: string[]) {
  const parsed = parseArgs(args);

  for (const [key, value] of Object.entries(parsed)) {
    if (rules[key]) {
      const values = value.split(",");
      yield rules[key](...values);
    }
  }
}

function denoDir(): string {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["info"],
    stdout: "piped",
  });

  const output = command.outputSync();

  const info = new TextDecoder().decode(output.stdout);

  const lines = info.split("\n");

  for (const line of lines) {
    if (line.includes("DENO_DIR")) {
      return line.split(" ")[2]?.trim();
    }
  }

  throw new Error("DENO_DIR not found");
}

if (import.meta.main) {
  await run(Deno.args);
}
