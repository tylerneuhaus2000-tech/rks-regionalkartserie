import type { ComponentProps } from "react";

/**
 * Public pages use document navigation. The deployed Vinext client router can
 * intercept a click without issuing a request; a native anchor remains usable
 * before hydration and preserves keyboard, modifier-click and browser history.
 * The selected season is restored by SeasonProvider from localStorage.
 */
export default function SiteLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
