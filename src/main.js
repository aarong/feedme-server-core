import "source-map-support/register";
import check from "check-types";
import server from "./server";
import transportWrapper from "./transportwrapper";

/**
 * Outward-facing server factory function.
 *
 * Takes a transport from outside, wraps it, and injects it into the server.
 *
 * The options parameter is identical to that taken by the server, but a
 * transport property is taken rather than a transportWrapper.
 */
export default function feedmeServer(options) {
  // Check options
  if (!check.object(options)) {
    throw new Error("INVALID_ARGUMENT: Invalid options argument.");
  }

  // Check options.transport
  if (!check.object(options.transport)) {
    throw new Error("INVALID_ARGUMENT: Invalid options.transport.");
  }

  // Create transport wrapper
  const wrapper = transportWrapper(options.transport);

  // Create a server using the transport and return it
  delete options.transport; // eslint-disable-line no-param-reassign
  options.transportWrapper = wrapper; // eslint-disable-line no-param-reassign
  const s = server(options);
  return s;
}
