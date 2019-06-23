import "source-map-support/register";
import debug from "debug";
import transportWrapper from "./transportwrapper";
import messageParser from "./messageparser";

const dbg = debug("feedme-server-core");

/**
 * Outward-facing server factory function.
 *
 * Takes a transport from outside, wraps it, and injects it into the server.
 */
export default function feedmeServer() {
  dbg("Feedme server factory function");

  transportWrapper.a = "a"; // bring into docs
  messageParser.a = "a"; // bring into docs

  return {};
}
