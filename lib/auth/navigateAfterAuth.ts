import type { Href, Router } from "expo-router";

const DEFAULT_DESTINATION = "/(tabs)";

export function navigateAfterAuthSession(
  router: Router,
  decorateUrl: (path: string) => string,
  destination: string = DEFAULT_DESTINATION,
) {
  const url = decorateUrl(destination);
  if (typeof window !== "undefined" && url.startsWith("http")) {
    window.location.href = url;
    return;
  }
  router.replace(url as Href);
}
