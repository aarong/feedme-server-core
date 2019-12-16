import sourceMapSupport from "source-map-support";
import check from "check-types";
import _ from "lodash";
import server from "./server";
import transportWrapper from "./transportwrapper";

/*
Do not register source map support in the testing environment.
Jest comes with source map support out of the box and installing outside
source map support throws off error line numbers in the build tests.
*/
if (process.env.NODE_ENV !== "test") {
  sourceMapSupport.install();
}

/**
 * Outward-facing server factory function.
 *
 * Takes a transport from outside, wraps it, and injects it into the server.
 *
 * The options parameter is identical to that taken by the server, but a
 * transport property is taken rather than a transportWrapper.
 */
export default function feedmeServerCore(options) {
  // Check options
  if (!check.object(options)) {
    throw new Error("INVALID_ARGUMENT: Invalid options argument.");
  }

  // Check options.transport
  if (!check.object(options.transport)) {
    throw new Error("INVALID_ARGUMENT: Invalid options.transport.");
  }

  // Create a server with a wrapped transport and return it
  const serverOptions = _.cloneDeep(options);
  delete serverOptions.transport;
  serverOptions.transportWrapper = transportWrapper(options.transport);
  const s = server(serverOptions);
  return s;
}
