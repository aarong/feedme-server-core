import "source-map-support/register";

/**
 * Outward-facing server factory function.
 *
 * Takes a transport from outside, wraps it, and injects it into the server.
 */
export default function feedmeServer() {
  console.log("Feedme server factory function");
  return {};
}
