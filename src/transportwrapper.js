import emitter from "component-emitter";
import check from "check-types";
import debug from "debug";

const dbg = debug("feedme-server-core:transport-wrapper");

/**
 * Verifies that the app-provided transport object behaves as required by the
 * documentation.
 *
 * - The transport API is verified on intialization
 * - Transport function return values and errors are validated
 * - Transport event sequence is validated
 * - Library invocation sequence is validated (but arguments are not)
 *
 * @typedef {Object} TransportWrapper
 * @extends emitter
 */

const proto = {};
emitter(proto);

/**
 * Creates a TransportWrapper object.
 * @param {Object} transport
 * @returns {TransportWrapper}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
export default function transportWrapperFactory(transport) {
  dbg("Initializing TransportWrapper object");

  // Check that the transport is an object
  if (!check.object(transport)) {
    throw new Error(
      "INVALID_ARGUMENT: The supplied transport is not an object."
    );
  }

  // Check that the transport exposes the required API
  if (
    !check.function(transport.on) ||
    !check.function(transport.state) ||
    !check.function(transport.start) ||
    !check.function(transport.stop) ||
    !check.function(transport.send) ||
    !check.function(transport.disconnect)
  ) {
    throw new Error(
      "INVALID_ARGUMENT: The supplied transport does not implement the required API."
    );
  }

  // Check that the transport state is stopped
  if (transport.state() !== "stopped") {
    throw new Error("INVALID_ARGUMENT: The supplied transport is not stopped.");
  }

  // Success
  const transportWrapper = Object.create(proto);

  /**
   * Transport being wrapped.
   * @memberof TransportWrapper
   * @instance
   * @private
   * @type {Object}
   */
  transportWrapper._transport = transport;

  /**
   * Last transport state emission.
   * @memberof TransportWrapper
   * @instance
   * @private
   * @type {string} stop, starting, started, start
   */
  transportWrapper._lastStateEmission = "stop";

  /**
   * Array of string client ids understood to be connected to the transport.
   * Always kept in sort order.
   * @memberof TransportWrapper
   * @instance
   * @private
   * @type {Array}
   */
  transportWrapper._clientIds = [];

  // Listen for transport events
  transportWrapper._transport.on(
    "starting",
    transportWrapper._processTransportStarting.bind(transportWrapper)
  );
  transportWrapper._transport.on(
    "start",
    transportWrapper._processTransportStart.bind(transportWrapper)
  );
  transportWrapper._transport.on(
    "stopping",
    transportWrapper._processTransportStopping.bind(transportWrapper)
  );
  transportWrapper._transport.on(
    "stop",
    transportWrapper._processTransportStop.bind(transportWrapper)
  );
  transportWrapper._transport.on(
    "connect",
    transportWrapper._processTransportConnect.bind(transportWrapper)
  );
  transportWrapper._transport.on(
    "message",
    transportWrapper._processTransportMessage.bind(transportWrapper)
  );
  transportWrapper._transport.on(
    "disconnect",
    transportWrapper._processTransportDisconnect.bind(transportWrapper)
  );

  return transportWrapper;
}

// Events

/**
 * Emitted on valid transport starting event.
 * @event starting
 * @memberof TransportWrapper
 * @instance
 */

/**
 * Emitted on valid transport start event.
 * @event start
 * @memberof TransportWrapper
 * @instance
 */

/**
 * Emitted on valid transport stopping event.
 * @event stopping
 * @memberof TransportWrapper
 * @instance
 * @param {?Error} err
 */

/**
 * Emitted on valid transport stop event.
 * @event stop
 * @memberof TransportWrapper
 * @instance
 * @param {?Error} err
 */

/**
 * Emitted on valid transport connect event.
 * @event connect
 * @memberof TransportWrapper
 * @instance
 * @param {string} clientId
 */

/**
 * Emitted on valid transport message event.
 * @event message
 * @memberof TransportWrapper
 * @instance
 * @param {string} clientId
 * @param {string} msg
 */

/**
 * Emitted on valid transport disconnect event.
 * @event disconnect
 * @memberof TransportWrapper
 * @instance
 * @param {string} clientId
 * @param {?Error} err
 */

/**
 * Emitted when the transport violates the prescribed behavior.
 * @event transportError
 * @memberof TransportWrapper
 * @instance
 * @param {Error} err "INVALID_RESULT: ..."     Transport returned unexpected return value or error
 *                    "UNEXPECTED_EVENT: ..."   Event not valid for current transport state
 *                    "BAD_EVENT_ARGUMENT: ..." Event emitted with invalid argument signature
 */

// Public functions

/**
 * @memberof TransportWrapper
 * @instance
 * @throws {Error} "TRANSPORT_ERROR: ..."
 */
proto.state = function state() {
  dbg("State requested");

  // Try to get the state
  let st;
  let transportErr;
  try {
    st = this._transport.state();
  } catch (e) {
    transportErr = e;
  }

  // Did it throw an error? Never should
  if (transportErr) {
    const emitErr = new Error(
      `INVALID_RESULT: Transport threw an error on call to state().`
    );
    emitErr.transportError = transportErr;
    this.emit("transportError", emitErr);
    throw new Error(
      `TRANSPORT_ERROR: The transport unexpectedly threw an error.`
    );
  }

  // Was the state as expected?
  if (
    !(st === "stopped" && this._lastStateEmission === "stop") &&
    !(st === "starting" && this._lastStateEmission === "starting") &&
    !(st === "started" && this._lastStateEmission === "start") &&
    !(st === "stopping" && this._lastStateEmission === "stopping")
  ) {
    this.emit(
      "transportError",
      new Error(
        `INVALID_RESULT: Transport unexpectedly returned '${st}' on a call to state() when previous emission was '${this._lastStateEmission}'.` // prettier-ignore
      )
    );
    throw new Error(
      `TRANSPORT_ERROR: The transport returned an unexpected state.`
    );
  }

  // Return
  return st;
};

/**
 * @memberof TransportWrapper
 * @instance
 * @throws {Error} "TRANSPORT_ERROR: ..."
 * @throws {Error} "INVALID_CALL: ..."
 */
proto.start = function start() {
  dbg("Start requested");

  // Check invocation sequence (library behavior)
  if (this._lastStateEmission !== "stop") {
    throw new Error(
      "INVALID_CALL: Call to start() when the transport state was not 'stopped'."
    );
  }

  // Try to start the transport
  try {
    this._transport.start();
  } catch (e) {
    // Invalid behavior from the transport
    const emitErr = new Error(
      `INVALID_RESULT: Transport threw an error on a call to start() when previous emission was 'stop'.`
    );
    emitErr.transportError = e;
    this.emit("transportError", emitErr);
    throw new Error(`TRANSPORT_ERROR: Transport unexpectedly threw an error.`);
  }
};

/**
 * @memberof TransportWrapper
 * @instance
 * @throws {Error} "TRANSPORT_ERROR: ..."
 * @throws {Error} "INVALID_CALL: ..."
 */
proto.stop = function stop() {
  dbg("Stop requested");

  // Check invocation sequence (library behavior)
  if (this._lastStateEmission !== "start") {
    throw new Error(
      "INVALID_CALL: Call to stop() when the transport state was not 'started'."
    );
  }

  // Try to stop the transport
  try {
    this._transport.stop();
  } catch (e) {
    // Invalid behavior from the transport
    const emitErr = new Error(
      `INVALID_RESULT: Transport threw an error on a call to stop() when previous emission was 'start'.`
    );
    emitErr.transportError = e;
    this.emit("transportError", emitErr);
    throw new Error(`TRANSPORT_ERROR: Transport unexpectedly threw an error.`);
  }
};

/**
 * @memberof TransportWrapper
 * @instance
 * @param {string} clientId
 * @param {string} msg
 * @throws {Error} "TRANSPORT_ERROR: ..."
 * @throws {Error} "INVALID_CALL: ..."
 */
proto.send = function send(clientId, msg) {
  dbg("Send requested");

  // Check invocation sequence (library behavior)
  if (this._lastStateEmission !== "start") {
    throw new Error(
      "INVALID_CALL: Call to send() when the transport state was not 'started'."
    );
  }

  // Was this a valid call from the server? Check that client is connected
  if (!this._clientIds.includes(clientId)) {
    throw new Error(
      "INVALID_CALL: Call to send() referencing client not understood to be connected."
    );
  }

  // Try to send the message
  try {
    this._transport.send(clientId, msg);
  } catch (e) {
    // Invalid behavior from the transport
    const emitErr = new Error(
      `INVALID_RESULT: Transport threw an error on a call to send() when previous state emission was 'start' and client was understood to be connected.`
    );
    emitErr.transportError = e;
    this.emit("transportError", emitErr);
    throw new Error(`TRANSPORT_ERROR: Transport unexpectedly threw an error.`);
  }
};

/**
 * @memberof TransportWrapper
 * @instance
 * @param {string} clientId
 * @param {?Error} err
 * @throws {Error} "TRANSPORT_ERROR: ..."
 * @throws {Error} "INVALID_CALL: ..."
 */
proto.disconnect = function disconnect(clientId, inErr) {
  dbg("Disconnect requested");

  // // Check invocation sequence (library behavior)
  if (this._lastStateEmission !== "start") {
    throw new Error(
      "INVALID_CALL: Call to disconnect() when the transport state was not 'started'."
    );
  }

  // Was this a valid call from the server? Check that client is connected
  if (!this._clientIds.includes(clientId)) {
    throw new Error(
      "INVALID_CALL: Call to disconnect() referencing client not understood to be connected."
    );
  }

  // Try to disconnect the client
  try {
    if (inErr) {
      this._transport.disconnect(clientId, inErr);
    } else {
      this._transport.disconnect(clientId);
    }
  } catch (e) {
    // Invalid behavior from the transport
    const emitErr = new Error(
      `INVALID_RESULT: Transport threw an error on a call to disconnect() when previous state emission was 'start' and client was understood to be connected.`
    );
    emitErr.transportError = e;
    this.emit("transportError", emitErr);
    throw new Error(`TRANSPORT_ERROR: Transport unexpectedly threw an error.`);
  }
};

// Transport event processors

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportStarting = function _processTransportStarting(...args) {
  dbg("Observed transport starting event");

  // The transport messed up if the previous state was not stopped
  if (this._lastStateEmission !== "stop") {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'starting' event following a '${this._lastStateEmission}' emission.` // prettier-ignore
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 0) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'starting' event."
      )
    );
    return; // Stop
  }

  // Emit
  this._lastStateEmission = "starting";
  this.emit("starting");
};

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportStart = function _processTransportStart(...args) {
  dbg("Observed transport start event");

  // The transport messed up if the previous state was not starting
  if (this._lastStateEmission !== "starting") {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'start' event following a '${this._lastStateEmission}' emission.` // prettier-ignore
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 0) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'start' event."
      )
    );
    return; // Stop
  }

  // Emit
  this._lastStateEmission = "start";
  this.emit("start");
};

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportStopping = function _processTransportStopping(...args) {
  dbg("Observed transport stopping event");

  // The transport messed up if the previous state was not starting or started
  if (
    this._lastStateEmission !== "starting" &&
    this._lastStateEmission !== "start"
  ) {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'stopping' event following a '${this._lastStateEmission}' emission.` // prettier-ignore
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 1) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'stopping' event."
      )
    );
    return; // Stop
  }

  // Error valid if specified?
  if (
    args.length === 1 &&
    (!check.instance(args[0], Error) ||
      args[0].message.substr(0, 8) !== "FAILURE:")
  ) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'stopping' event."
      )
    );
    return; // Stop
  }

  // Emit
  this._lastStateEmission = "stopping";
  if (args.length === 0) {
    this.emit("stopping");
  } else {
    this.emit("stopping", args[0]);
  }
};

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportStop = function _processTransportStop(...args) {
  dbg("Observed transport stop event");

  // The transport messed up if the previous state was not stopping
  if (this._lastStateEmission !== "stopping") {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'stop' event following a '${this._lastStateEmission}' emission.` // prettier-ignore
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 1) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'stop' event."
      )
    );
    return; // Stop
  }

  // Error valid if specified?
  if (
    args.length === 1 &&
    (!check.instance(args[0], Error) ||
      args[0].message.substr(0, 8) !== "FAILURE:")
  ) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'stop' event."
      )
    );
    return; // Stop
  }

  // Emit
  this._lastStateEmission = "stop";
  if (args.length === 0) {
    this.emit("stop");
  } else {
    this.emit("stop", args[0]);
  }
};

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportConnect = function _processTransportConnect(...args) {
  dbg("Observed transport connect event");

  // The transport messed up if the last state emission wasn't start
  if (this._lastStateEmission !== "start") {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'connect' event while not started.`
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 1) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'connect' event."
      )
    );
    return; // Stop
  }

  // Client id valid?
  if (!check.string(args[0]) || args[0] === "") {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'connect' event."
      )
    );
    return; // Stop
  }

  // Client id unique?
  if (this._clientIds.includes(args[0])) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed an already-connected client id with the 'connect' event."
      )
    );
    return; // Stop
  }

  // Save the client id and keep the array sorted
  this._clientIds.push(args[0]);
  this._clientIds.sort();

  // Emit
  this.emit("connect", args[0]);
};

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportMessage = function _processTransportMessage(...args) {
  dbg("Observed transport message event");

  // The transport messed up if the last state emission wasn't start
  if (this._lastStateEmission !== "start") {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'message' event while not started.`
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 2) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'message' event."
      )
    );
    return; // Stop
  }

  // Client id valid?
  if (!check.string(args[0]) || args[0] === "") {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'message' event."
      )
    );
    return; // Stop
  }

  // Message valid?
  if (!check.string(args[1])) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed a non-string message with the 'message' event."
      )
    );
    return; // Stop
  }

  // Client connected?
  if (!this._clientIds.includes(args[0])) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed an unknown client id with the 'message' event."
      )
    );
    return; // Stop
  }

  // Emit
  this.emit("message", args[0], args[1]);
};

/**
 * @memberof TransportWrapper
 * @instance
 * @private
 * @param {Array} args
 */
proto._processTransportDisconnect = function _processTransportDisconnect(
  ...args
) {
  dbg("Observed transport disconnect event");

  // The transport messed up if the last state emission wasn't start
  if (this._lastStateEmission !== "start") {
    this.emit(
      "transportError",
      new Error(
        `UNEXPECTED_EVENT: Transport emitted a  'disconnect' event while not started.`
      )
    );
    return; // Stop
  }

  // Extraneous arguments?
  if (args.length > 2) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'disconnect' event."
      )
    );
    return; // Stop
  }

  // Client id valid?
  if (!check.string(args[0]) || args[0] === "") {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'disconnect' event."
      )
    );
    return; // Stop
  }

  // Client connected?
  if (!this._clientIds.includes(args[0])) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed an unknown client id with the 'disconnect' event."
      )
    );
    return; // Stop
  }

  // Error valid if specified?
  if (
    args.length === 2 &&
    (!check.instance(args[1], Error) ||
      (args[1].message.substr(0, 8) !== "FAILURE:" &&
        args[1].message.substr(0, 9) !== "STOPPING:" &&
        args[1].message.substr(0, 18) !== "HANDSHAKE_TIMEOUT:"))
  ) {
    this.emit(
      "transportError",
      new Error(
        "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'disconnect' event."
      )
    );
    return; // Stop
  }

  // Forget the client id
  this._clientIds.splice(this._clientIds.indexOf(args[0]), 1);

  // Emit
  if (args.length === 1) {
    this.emit("disconnect", args[0]);
  } else {
    this.emit("disconnect", args[0], args[1]);
  }
};
