import { DEBUG } from "../config/constants";

export const log = {
  debug: (...args) => DEBUG && console.log("[DEBUG]", ...args),
  error: (...args) => DEBUG && console.error("[ERROR]", ...args),
  warn: (...args) => DEBUG && console.warn("[WARN]", ...args),
};
