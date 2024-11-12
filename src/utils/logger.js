import { DEBUG } from "../config/constants";

export const log = {
  debug: (...args) => DEBUG && console.log("[DEBUG]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
};
