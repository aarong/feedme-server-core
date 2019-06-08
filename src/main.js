import "source-map-support/register";
import debug from "debug";

const dbg = debug("feedme-server-core");

/**
 * Outward-facing server factory function.
 *
 * Takes a transport from outside, wraps it, and injects it into the server.
 */
export default function feedmeServer() {
  dbg("Feedme server factory function");
  return {};
}
