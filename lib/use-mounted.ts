import * as React from "react";

/**
 * Returns `false` during SSR and the first client render, then `true` after
 * mount. Gate any value that depends on the current moment (`Date.now()`,
 * `new Date()`, timezone) behind this so the server-rendered HTML and the
 * first client render agree — avoiding hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}
