// Copyright 2024 Divy Srivastava. All rights reserved. MIT license.

export function subpath(path: string): SeatbeltConfigValue {
  return {
    type: "subpath",
    value: path,
  };
}

export function path(path: string): SeatbeltConfigValue {
  return {
    type: "path",
    value: path,
  };
}

export function allow(
  name: string,
  values: SeatbeltConfigValue[],
): SeatbeltConfigValue {
  return {
    name,
    values,
  };
}

export function remoteIp(host: string): SeatbeltConfigValue {
  return {
    type: "remote ip",
    value: host == "localhost" ? "localhost:*" : `*:*`,
  };
}

export type SeatbeltConfigValue = string | SeatbeltConfigValue[] | {
  type: string;
  value: string;
} | {
  name: string;
  values: SeatbeltConfigValue[];
};

export function buildSeatbeltConfig(config: SeatbeltConfigValue[]) {
  let r = "(version 1)\n";
  r += "(deny default)\n\n";
  r += '(import "bsd.sb")\n\n';
  for (const c of config) {
    r += writeConfigValue(c);
  }

  return r;
}

function writeConfigValue(value: SeatbeltConfigValue): string {
  if (typeof value === "string") {
    return `(allow ${value})\n`;
  } else if (Array.isArray(value)) {
    return value.map(writeConfigValue).join("");
  } else if ("type" in value) {
    return `(${value.type} "${value.value}")\n`;
  } else if ("name" in value) {
    return `(allow ${value.name}\n  ${
      value.values.map(writeConfigValue).join("  ")
    })\n`;
  }

  throw new Error("Invalid value");
}
