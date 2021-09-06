import _ from "lodash";
import feedSerializer from "feedme-util/feedserializer";
import check from "check-types";
import emitter from "component-emitter";
import debug from "debug";
import uuid from "uuid";
import jsonExpressible from "json-expressible";
import validateClientMessage from "feedme-util/validateclientmessage";
import validateHandshake from "feedme-util/validatehandshake";
import validateAction from "feedme-util/validateaction";
import validateFeedOpen from "feedme-util/validatefeedopen";
import validateFeedClose from "feedme-util/validatefeedclose";
import validateDelta from "feedme-util/validatedelta";
import md5Calculator from "feedme-util/md5calculator";
import feedValidator from "feedme-util/feedvalidator";
import config from "./config";
import handshakeRequest from "./handshakerequest";
import handshakeResponse from "./handshakeresponse";
import actionRequest from "./actionrequest";
import actionResponse from "./actionresponse";
import feedOpenRequest from "./feedopenrequest";
import feedOpenResponse from "./feedopenresponse";
import feedCloseRequest from "./feedcloserequest";
import feedCloseResponse from "./feedcloseresponse";

const dbg = debug("feedme-server-core");

/**
 * Core server module.
 * @typedef {Object} Server
 * @extends emitter
 */

const proto = {};
emitter(proto);

/**
 * Feedme spec version.
 * @memberof Server
 * @static
 */
const feedmeVersion = "0.1";

/**
 * Factory function.
 * @param {Object} options
 * @param {TransportWrapper} options.transportWrapper
 * @param {number} options.handshakeMs
 * @param {number} options.terminationMs
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @returns {Server}
 */

export default function serverFactory(options) {
  dbg("Initializing Server object");

  // Check options
  if (!check.object(options)) {
    throw new Error("INVALID_ARGUMENT: Invalid options argument.");
  }

  // Check options.transportWrapper
  if (!check.object(options.transportWrapper)) {
    throw new Error("INVALID_ARGUMENT: Invalid options.transportWrapper.");
  }

  // Check options.handshakeMs (if specified)
  if ("handshakeMs" in options) {
    if (!check.integer(options.handshakeMs) || options.handshakeMs < 0) {
      throw new Error("INVALID_ARGUMENT: Invalid options.handshakeMs.");
    }
  }

  // Check options.terminationMs (if specified)
  if ("terminationMs" in options) {
    if (!check.integer(options.terminationMs) || options.terminationMs < 0) {
      throw new Error("INVALID_ARGUMENT: Invalid options.terminationMs.");
    }
  }

  // Success

  const server = Object.create(proto);

  /**
   * Configuration options excluding the transport wrapper.
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._options = _.clone(config.defaults);
  _.each(server._options, (val, key) => {
    if (key !== "transportWrapper" && key in options) {
      server._options[key] = options[key];
    }
  });

  /**
   * Transport wrapper.
   * @memberof Server
   * @instance
   * @private
   * @type {TransportWrapper}
   */
  server._transportWrapper = options.transportWrapper;

  /**
   * Feedme client ids indexed by transport client id.
   *
   * server._clientIds[tcid] = cid (string)
   *
   * Present for clients that are connected on the transport
   *
   * Added when a client connects to the transport - pre-specified
   *   Feedme client id may not yet have been communicated to the client by a HandshakeResponse
   *
   * Removed when
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._clientIds = {};

  /**
   * Transport client ids indexed by Feedme client id.
   *
   * server._transportClientIds[cid] = tcid (string)
   *
   * Present for clients that are connected on the transport
   *
   * Added when a client connects via the transport - pre-specified
   *   Feedme client id may not yet have been communicated to the client by a HandshakeResponse
   *
   * Removed when
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._transportClientIds = {};

  /**
   * Handshake status flags.
   *
   * server._handshakeStatus[cid] = "waiting" or "processing" or "complete"
   *
   * Present for clients that are connected on the transport
   *
   * - "waiting" if waiting for a version-compatible Handshake message from the
   *   client
   *
   * - "processing" if a version-compatible Handshake message has been received
   *   from the client but a successful HandshakeResponse has not yet been sent,
   *   because the app has assigned a handshake event listener and has not yet
   *   called hres.success()
   *
   * - "complete" if the handshake has been completed successfully, in which case
   *   Action, FeedOpen, and FeedClose messages are valid
   *
   * Added when a client connects via the transport
   *
   * Removed when
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._handshakeStatus = {};

  /**
   * Active HandshakeResponse objects that have been emitted to the application.
   *
   * server._handshakeResponses[cid] = HandshakeResponse object
   *
   * Added when a valid and version-compatible Handshake message is received
   * and the app has assigned a handshake event listener
   *   Before the handshake event is emitted
   *
   * Removed and object neutralized when
   *   The app calls hres.success() and a HandshakeResponse is sent
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._handshakeResponses = {};

  /**
   * Timer ids for handshake timeout disconnects, indexed by Feedme client id.
   *
   * server._handshakeTimers[cid] = timerId (integer)
   *
   * Added when a client connects to the transport (if so configured)
   *
   * Removed when
   *   The client submits a library-compatible Handshake message
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._handshakeTimers = {};

  /**
   * Active ActionResponse objects that have been emitted to the application.
   *
   * server._actionResponses[cid][actionCallbackId] = ActionResponse object
   *
   * Added when a valid Action message is received
   *   Before the action event is emitted
   *
   * Removed and object neutralized when
   *   The app calls ares.success/failure() an an ActionResponse is sent
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._actionResponses = {};

  /**
   * State of client feeds that are not closed, indexed first by client.
   *
   * server._clientFeedStates[cid][feedSerial] = "opening" or "open" or "closing" or "terminated"
   *
   * Added when a client transmits a valid FeedOpen message
   *
   * Removed when
   *   A FeedCloseResponse is message sent
   *   A FeedTermination message is sent (after terminationMs passes, if so configured)
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._clientFeedStates = {};

  /**
   * State of client feeds that are not closed, indexed first by feed.
   *
   * server._feedClientStates[feedSerial][cid] = "opening" or "open" or "closing" or "terminated"
   *
   * Added when a client transmits a valid FeedOpen message
   *
   * Removed when
   *   A FeedCloseResponse message is sent
   *   A FeedTermination message is sent (after terminationMs passes, if so configured)
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._feedClientStates = {};

  /**
   * Active FeedOpenResponse objects that have been emitted to the application.
   * Always and only exist when feed state is opening.
   *
   * server._feedOpenResponses[cid][feedSerial] = FeedOpenResponse object
   *
   * Added when a valid FeedOpen message is received
   *   Before the feedOpen event is emitted
   *
   * Removed and object neutralized when
   *   The app calls fores.success/failure() and a FeedOpenResponse is sent
   *   The app calls server.feedTermination() on the feed and a FeedOpenResponse is sent
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._feedOpenResponses = {};

  /**
   * Active FeedCloseResponse objects that have been emitted to the application.
   * Always and only exist when feed state is closing.
   *
   * server._feedCloseResponses[cid][feedSerial] = FeedCloseResponse object
   *
   * Added when a valid FeedClose message is received and the client has
   * assigned a feedClose event listener
   *   Before the feedClose event is emitted
   *
   * Removed and object neutralized when
   *   The app calls fcres.success()
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._feedCloseResponses = {};

  /**
   * Timers to flip feed state from terminated to closed after terminationMs.
   *
   * server._terminationTimers[cid][feedSerial] = timerId
   *
   * Added when a FeedTermination message is sent (if so configured)
   *
   * Removed when
   *   The terminationMs period elapses
   *   The client disconnects from the transport
   *   The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._terminationTimers = {};

  // Listen for transport events
  server._transportWrapper.on("starting", server._processStarting.bind(server));
  server._transportWrapper.on("start", server._processStart.bind(server));
  server._transportWrapper.on("stopping", server._processStopping.bind(server));
  server._transportWrapper.on("stop", server._processStop.bind(server));
  server._transportWrapper.on("connect", server._processConnect.bind(server));
  server._transportWrapper.on("message", server._processMessage.bind(server));
  server._transportWrapper.on(
    "disconnect",
    server._processDisconnect.bind(server)
  );
  server._transportWrapper.on(
    "transportError",
    server._processTransportError.bind(server)
  );

  return server;
}

// Events

/**
 * @event starting
 * @memberof Server
 * @instance
 */

/**
 * @event start
 * @memberof Server
 * @instance
 */

/**
 * @event stopping
 * @memberof Server
 * @instance
 * @param {?Error} err "FAILURE: ..." if the transport failed
 *                     Not present if due to call to server.stop()
 */

/**
 * @event stop
 * @memberof Server
 * @instance
 * @param {?Error} err "FAILURE: ..." if the transport failed
 *                     Not present if due to call to server.stop()
 */

/**
 * @event connect
 * @memberof Server
 * @instance
 * @param {string} clientId
 */

/**
 * @event handshake
 * @memberof Server
 * @instance
 * @param {HandshakeRequest} handshakeRequest
 * @param {HandshakeResponse} handshakeResponse
 */

/**
 * @event action
 * @memberof Server
 * @instance
 * @param {ActionRequest} actionRequest
 * @param {ActionResponse} actionResponse
 */

/**
 * @event feedOpen
 * @memberof Server
 * @instance
 * @param {FeedOpenRequest} feedOpenRequest
 * @param {FeedOpenResponse} feedOpenResponse
 */

/**
 * @event feedClose
 * @memberof Server
 * @instance
 * @param {FeedCloseRequest} feedCloseRequest
 * @param {FeedCloseResponse} feedCloseResponse
 */

/**
 * @event disconnect
 * @memberof Server
 * @instance
 * @param {string} clientId
 * @param {?Error} err  "HANDSHAKE_TIMEOUT: ..." if client did not handshake in time
 *                      "STOPPING: ..." if the due to a call to server.stop()
 *                      "FAILURE: ..." if the transport failed
 *                      Not present if due to call to server.disconnect()
 */

/**
 * @event transportError
 * @memberof Server
 * @instance
 * @param {Error} err
 */

/**
 * @event badClientMessage
 * @memberof Server
 * @instance
 * @param {string} clientId
 * @param {Error} err "INVALID_MESSAGE: ..." if the message was structurally invalid
 *                    "UNEXPECTED_MESSAGE: ..." if the message was sequentially invalid
 */

// Public functions

/**
 * @memberof Server
 * @instance
 * @returns {string} "starting" or "started" or "stopping" or "stopped"
 */
proto.state = function state() {
  dbg("State requested");

  return this._transportWrapper.state();
};

/**
 * Starts the server.
 * @memberof Server
 * @instance
 * @throws {Error} "INVALID_STATE: ..."
 */
proto.start = function start() {
  dbg("Start requested");

  // Check server state
  if (this.state() !== "stopped") {
    throw new Error("INVALID_STATE: The server is not stopped.");
  }

  // Start the transport
  this._transportWrapper.start();
};

/**
 * Stops the server.
 * @memberof Server
 * @instance
 * @throws {Error} "INVALID_STATE: ..."
 */
proto.stop = function stop() {
  dbg("Stop requested");

  // Check server state
  if (this.state() !== "started") {
    throw new Error("INVALID_STATE: The server is not started.");
  }

  // Stop the transport
  this._transportWrapper.stop();
};

/**
 * Transmits ActionRevelation messages to clients that have the specified feed open.
 * @memberof Server
 * @instance
 * @param {Object} params
 * @param {string} params.actionName
 * @param {Object} params.actionData
 * @param {string} params.feedName
 * @param {Object} params.feedArgs
 * @param {Array} params.feedDeltas
 * @param {?string} params.feedMd5
 * @param {?Object} params.feedData
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "INVALID_STATE: ..."
 */
proto.actionRevelation = function actionRevelation(params) {
  dbg("Action revelation requested");

  // Check server state
  if (this.state() !== "started") {
    throw new Error("INVALID_STATE: The server is not started.");
  }

  // Check params
  if (!check.object(params)) {
    throw new Error("INVALID_ARGUMENT: Invalid params.");
  }

  // Check action name - empty is spec-valid
  if (!check.string(params.actionName)) {
    throw new Error("INVALID_ARGUMENT: Invalid action name.");
  }

  // Check action data
  if (!check.object(params.actionData)) {
    throw new Error("INVALID_ARGUMENT: Invalid action data.");
  }
  if (!jsonExpressible(params.actionData)) {
    throw new Error("INVALID_ARGUMENT: Action data is not JSON-expressible.");
  }

  // Validate feed name/arg types and cascade errors
  feedValidator.validate(params.feedName, params.feedArgs);

  // Validate feed deltas
  if (!check.array(params.feedDeltas)) {
    throw new Error("INVALID_ARGUMENT: Invalid feed deltas.");
  }
  _.each(params.feedDeltas, delta => {
    try {
      validateDelta.check(delta, true); // Ensure values are JSON-expressible
    } catch (e) {
      throw new Error("INVALID_ARGUMENT: Invalid feed delta.");
    }
  });

  // Check that feed data/hash are not both present
  if ("feedMd5" in params && "feedData" in params) {
    throw new Error(
      "INVALID_ARGUMENT: Cannot specify both params.feedMd5 and params.feedData."
    );
  }
  let feedMd5;

  // Validate hash (if present)
  if ("feedMd5" in params) {
    if (!check.string(params.feedMd5) || params.feedMd5.length !== 24) {
      throw new Error("INVALID_ARGUMENT: Invalid feed data hash.");
    } else {
      ({ feedMd5 } = params);
    }
  }

  // Validate feed data (if present)
  if ("feedData" in params) {
    if (!check.object(params.feedData) || !jsonExpressible(params.feedData)) {
      throw new Error("INVALID_ARGUMENT: Invalid feed data.");
    } else {
      feedMd5 = md5Calculator.calculate(params.feedData);
    }
  }

  // Success

  // Assemble the ActionRevelation message
  let msg = {
    MessageType: "ActionRevelation",
    ActionName: params.actionName,
    ActionData: params.actionData,
    FeedName: params.feedName,
    FeedArgs: params.feedArgs,
    FeedDeltas: params.feedDeltas
  };
  if (feedMd5) {
    msg.FeedMd5 = feedMd5;
  }
  msg = JSON.stringify(msg);

  // Transmit to clients with the feed open
  const feedSerial = feedSerializer.serialize(params.feedName, params.feedArgs);
  if (feedSerial in this._feedClientStates) {
    _.each(this._feedClientStates[feedSerial], (state, clientId) => {
      if (state === "open") {
        this._transportWrapper.send(this._transportClientIds[clientId], msg);
      }
    });
  }
};

/**
 * Forcefully closes one or more client feeds. If a client has a feed opening,
 * it is sent a FeedOpenResponse message indicating failure. If a client has a feed
 * open, it is sent a FeedTermination message.
 * @memberof Server
 * @instance
 * @param {Object} params
 * @param {?string} params.clientId
 * @param {?string} params.feedName
 * @param {?Array} params.feedArgs
 * @param {string} params.errorCode
 * @param {Object} params.errorData
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "INVALID_STATE: ..."
 */
proto.feedTermination = function feedTermination(params) {
  dbg("Feed termination requested");

  // Check server state
  if (this.state() !== "started") {
    throw new Error("INVALID_STATE: The server is not started.");
  }

  // Check params
  if (!check.object(params)) {
    throw new Error("INVALID_ARGUMENT: Invalid params.");
  }

  // Check usage
  let usage;
  if ("clientId" in params && "feedName" in params && "feedArgs" in params) {
    usage = 1;
  } else if ("clientId" in params) {
    usage = 2;
  } else if ("feedName" in params && "feedArgs" in params) {
    usage = 3;
  } else {
    throw new Error("INVALID_ARGUMENT: Invalid usage.");
  }

  // Check client id (if required by usage)
  if (usage !== 3 && !check.string(params.clientId)) {
    throw new Error("INVALID_ARGUMENT: Invalid client id.");
  }

  // Check feed name/args and cascade errors (if required by usage)
  if (usage !== 2) {
    feedValidator.validate(params.feedName, params.feedArgs);
  }

  // Check error code (required for all usages) - empty is spec-valid
  if (!check.string(params.errorCode)) {
    throw new Error("INVALID_ARGUMENT: Invalid error code.");
  }

  // Check error data (required for all usages)
  if (!check.object(params.errorData) || !jsonExpressible(params.errorData)) {
    throw new Error("INVALID_ARGUMENT: Invalid error data.");
  }

  // Success

  if (usage === 1) {
    // 1. Specific feed and client
    dbg("Feed termination usage 1");

    const feedSerial = feedSerializer.serialize(
      params.feedName,
      params.feedArgs
    );
    const feedState = this._get(
      this._clientFeedStates,
      params.clientId,
      feedSerial,
      "closed"
    );

    if (feedState === "opening") {
      this._terminateOpeningFeed(
        params.clientId,
        params.feedName,
        params.feedArgs,
        params.errorCode,
        params.errorData
      );
    } else if (feedState === "open") {
      this._terminateOpenFeed(
        params.clientId,
        params.feedName,
        params.feedArgs,
        params.errorCode,
        params.errorData
      );
    }
  } else if (usage === 2) {
    // 2. All feeds for one client
    dbg("Feed termination usage 2");

    if (params.clientId in this._clientFeedStates) {
      _.each(this._clientFeedStates[params.clientId], (state, feedSerial) => {
        if (state === "opening") {
          const f = feedSerializer.unserialize(feedSerial);
          this._terminateOpeningFeed(
            params.clientId,
            f.feedName,
            f.feedArgs,
            params.errorCode,
            params.errorData
          );
        } else if (state === "open") {
          const f = feedSerializer.unserialize(feedSerial);
          this._terminateOpenFeed(
            params.clientId,
            f.feedName,
            f.feedArgs,
            params.errorCode,
            params.errorData
          );
        }
      });
    }
  } else {
    // 3. All clients on one feed
    dbg("Feed termination usage 3");

    const feedSerial = feedSerializer.serialize(
      params.feedName,
      params.feedArgs
    );

    if (feedSerial in this._feedClientStates) {
      _.each(this._feedClientStates[feedSerial], (state, clientId) => {
        if (state === "opening") {
          this._terminateOpeningFeed(
            clientId,
            params.feedName,
            params.feedArgs,
            params.errorCode,
            params.errorData
          );
        } else if (state === "open") {
          this._terminateOpenFeed(
            clientId,
            params.feedName,
            params.feedArgs,
            params.errorCode,
            params.errorData
          );
        }
      });
    }
  }
};

/**
 * Disconnects a client transport connection. Returns successfully if the
 * client does not exist.
 * @memberof Server
 * @instance
 * @param {string} clientId
 * @throws {Error} "INVALID_ARGUMENT: ..."
 *                 "INVALID_STATE: ..."
 */
proto.disconnect = function disconnect(clientId) {
  dbg("Disconnect requested");

  // Check server state
  if (this.state() !== "started") {
    throw new Error("INVALID_STATE: The server is not started.");
  }

  // Check client id
  if (!check.string(clientId)) {
    throw new Error("INVALID_ARGUMENT: Invalid client id.");
  }

  // Disconnect on the transport (if connected)
  if (clientId in this._transportClientIds) {
    this._transportWrapper.disconnect(this._transportClientIds[clientId]);
  }
};

// Transport listeners

/**
 * Process a transport starting event.
 * @memberof Server
 * @instance
 * @private
 */
proto._processStarting = function _processStarting() {
  dbg("Observed transport starting event");

  this.emit("starting");
};

/**
 * Process a transport start event.
 * @memberof Server
 * @instance
 * @private
 */
proto._processStart = function _processStart() {
  dbg("Observed transport start event");

  this.emit("start");
};

/**
 * Process a transport stopping event.
 *
 * The transport is required to have already emitted a disconnect event for each
 * previously-connected client.
 * @memberof Server
 * @instance
 * @private
 * @param {?Error} err
 */
proto._processStopping = function _processStopping(err) {
  dbg("Observed transport stopping event");

  if (err) {
    this.emit("stopping", err);
  } else {
    this.emit("stopping");
  }
};

/**
 * Process a transport stop event.
 * @memberof Server
 * @instance
 * @private
 * @param {?Error} err
 */
proto._processStop = function _processStop(err) {
  dbg("Observed transport stop event");

  if (err) {
    this.emit("stop", err);
  } else {
    this.emit("stop");
  }
};

/**
 * Process a transport connect event.
 * @memberof Server
 * @instance
 * @private
 * @param {string} transportClientId
 */
proto._processConnect = function _processConnect(transportClientId) {
  dbg("Observed transport connect event");

  // Update state
  const clientId = uuid();
  this._clientIds[transportClientId] = clientId;
  this._transportClientIds[clientId] = transportClientId;
  this._handshakeStatus[clientId] = "waiting";

  // Set a handshake timer (if configured)
  if (this._options.handshakeMs > 0) {
    this._handshakeTimers[clientId] = setTimeout(() => {
      this._transportWrapper.disconnect(
        transportClientId,
        new Error(
          "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
        )
      );
    }, this._options.handshakeMs);
  }

  this.emit("connect", clientId);

  // Await a Handshake message
};

/**
 * Process a transport message event. Parse, validate, and route.
 * @memberof Server
 * @instance
 * @private
 * @param {string} transportClientId
 * @param {string} msg
 */
proto._processMessage = function _processMessage(transportClientId, msg) {
  dbg("Observed transport message event");

  const clientId = this._clientIds[transportClientId];

  // Try to parse JSON and validate message structure
  let val;
  try {
    val = JSON.parse(msg);
    validateClientMessage.check(val);
    if (val.MessageType === "Handshake") {
      validateHandshake.check(val, false); // No need to check JSON-expressibility (coming from JSON)
    } else if (val.MessageType === "Action") {
      validateAction.check(val, false);
    } else if (val.MessageType === "FeedOpen") {
      validateFeedOpen.check(val, false);
    } else {
      validateFeedClose.check(val, false); // FeedClose
    }
  } catch (e) {
    dbg("Invalid JSON or schema violation");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Invalid JSON or schema violation.",
          Message: msg
        }
      })
    );

    // Emit badClientMessage
    const err = new Error("INVALID_MESSAGE: Invalid JSON or schema violation.");
    err.clientMessage = msg;
    err.parseError = e;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // Route the message
  dbg("Routing the message");
  this[`_process${val.MessageType}`](clientId, val, msg);
};

/**
 * Process a Handshake message.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {Object} msg Structurally valid Handshake message object
 * @param {string} msgString
 */
proto._processHandshake = function _processHandshake(clientId, msg, msgString) {
  dbg("Received Handshake message");

  const transportClientId = this._transportClientIds[clientId];

  // Is the message expected?
  if (this._handshakeStatus[clientId] !== "waiting") {
    dbg("Unexpected Handshake message - handshake status not waiting");

    // Send a ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected Handshake message.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error("UNEXPECTED_MESSAGE: Unexpected Handshake message.");
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // Is there a compatible version?
  if (!_.includes(msg.Versions, feedmeVersion)) {
    dbg("Invalid or unsupported Feedme version");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "HandshakeResponse",
        Success: false
      })
    );
    return; // Stop
  }

  // Success

  dbg("Successful Handshake message");

  // Kill the handshake timer (will not exist if handshakeMs is 0)
  if (this._handshakeTimers[clientId]) {
    clearTimeout(this._handshakeTimers[clientId]);
    delete this._handshakeTimers[clientId];
  }

  // Either emit to the app or respond with success immediately
  if (this.hasListeners("handshake")) {
    dbg("Emitting handshake event");

    this._handshakeStatus[clientId] = "processing";

    // Create, store, and emit a HandshakeResponse object
    const hreq = handshakeRequest(clientId);
    const hres = handshakeResponse(this, hreq);
    this._handshakeResponses[clientId] = hres;
    this.emit("handshake", hreq, hres);
  } else {
    dbg("No handshake listeners, returning success to client");

    this._handshakeStatus[clientId] = "complete";

    // Send HandshakeResponse success
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "HandshakeResponse",
        Success: true,
        Version: feedmeVersion
      })
    );
  }
};

/**
 * Process an Action message.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {Object} msg Structurally valid Action message object
 * @param {string} msgString
 */
proto._processAction = function _processAction(clientId, msg, msgString) {
  dbg("Received Action message");

  const transportClientId = this._transportClientIds[clientId];

  // Handshake complete?
  if (this._handshakeStatus[clientId] !== "complete") {
    dbg("Unexpected Action message - Handshake required");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error(
      "UNEXPECTED_MESSAGE: Action message received before successful Handshake."
    );
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // stop
  }

  // Is the callback id in use?
  if (this._exists(this._actionResponses, clientId, msg.CallbackId)) {
    dbg("Unexpected Action message - CallbackId in use");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Action message reused an outstanding CallbackId.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error(
      "UNEXPECTED_MESSAGE: Action message reused an outstanding CallbackId."
    );
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // If there is no action listener then return an error to the client
  if (!this.hasListeners("action")) {
    dbg("No action listener - returning error to client");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ActionResponse",
        CallbackId: msg.CallbackId,
        Success: false,
        ErrorCode: "INTERNAL_ERROR",
        ErrorData: {}
      })
    );
    return; // Stop
  }

  // Success

  dbg("Successful Action message - emitting action event");

  // Create, store, and emit an ActionResponse object
  const areq = actionRequest(
    clientId,
    msg.CallbackId,
    msg.ActionName,
    msg.ActionArgs
  );
  const ares = actionResponse(this, areq);
  this._set(this._actionResponses, clientId, msg.CallbackId, ares);
  this.emit("action", areq, ares);
};

/**
 * Process a FeedOpen message.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {Object} msg Structurally valid FeedOpen message object
 * @param {string} msgString
 */
proto._processFeedOpen = function _processFeedOpen(clientId, msg, msgString) {
  dbg("Received FeedOpen message");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(msg.FeedName, msg.FeedArgs);

  // Handshake complete?
  if (this._handshakeStatus[clientId] !== "complete") {
    dbg("Unexpected FeedOpen message - Handshake required");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error(
      "UNEXPECTED_MESSAGE: FeedOpen message received before successful Handshake."
    );
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // Check the feed state
  const feedState = this._get(
    this._clientFeedStates,
    clientId,
    feedSerial,
    "closed"
  );
  if (feedState !== "closed" && feedState !== "terminated") {
    dbg("Unexpected FeedOpen message - feed not closed/terminated");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedOpen message.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error(
      "UNEXPECTED_MESSAGE: FeedOpen message referenced a feed that was not closed or terminated."
    );
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // If the feed was terminated then set closed
  // The feed open could still fail if there is no feedOpen listener, but the client
  // submitted a valid request and the feed should no longer be considered terminated
  if (feedState === "terminated") {
    this._delete(this._clientFeedStates, clientId, feedSerial);
    this._delete(this._feedClientStates, feedSerial, clientId);
  }

  // If a termination timer exists then kill it
  // May not exist even if the feed state is terminated (if terminationMs is 0)
  if (this._exists(this._terminationTimers, clientId, feedSerial)) {
    clearTimeout(this._terminationTimers[clientId][feedSerial]);
    this._delete(this._terminationTimers, clientId, feedSerial);
  }

  // If there is no feedOpen listener then return an error to the client
  if (!this.hasListeners("feedOpen")) {
    dbg("No feedOpen listener - returning error");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "FeedOpenResponse",
        Success: false,
        FeedName: msg.FeedName,
        FeedArgs: msg.FeedArgs,
        ErrorCode: "INTERNAL_ERROR",
        ErrorData: {}
      })
    );
    return; // Stop
  }

  // Success

  dbg("Successful FeedOpen message - emitting feedOpen event");

  // Update the feed state
  this._set(this._clientFeedStates, clientId, feedSerial, "opening");
  this._set(this._feedClientStates, feedSerial, clientId, "opening");

  // Create, store, and emit a FeedOpenResponse object
  const foreq = feedOpenRequest(clientId, msg.FeedName, msg.FeedArgs);
  const fores = feedOpenResponse(this, foreq);
  this._set(this._feedOpenResponses, clientId, feedSerial, fores);
  this.emit("feedOpen", foreq, fores);
};

/**
 * Process a FeedClose message.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {Object} msg Structurally valid FeedClose message object
 * @param {string} msgString
 */
proto._processFeedClose = function _processFeedClose(clientId, msg, msgString) {
  dbg("Received FeedClose message");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(msg.FeedName, msg.FeedArgs);

  // Handshake complete?
  if (this._handshakeStatus[clientId] !== "complete") {
    dbg("Unexpected FeedClose message - Handshake required");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error(
      "UNEXPECTED_MESSAGE: FeedClose message received before successful Handshake."
    );
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // Check the feed state
  const feedState = this._get(
    this._clientFeedStates,
    clientId,
    feedSerial,
    "closed"
  );
  if (feedState !== "open" && feedState !== "terminated") {
    dbg("Unexpected FeedClose message - feed not closed/terminated");

    // Send ViolationResponse
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedClose message.",
          Message: msgString
        }
      })
    );

    // Emit badClientMessage
    const err = new Error(
      "UNEXPECTED_MESSAGE: FeedClose message referenced a feed that was not open or terminated."
    );
    err.clientMessage = msgString;
    this.emit("badClientMessage", clientId, err);

    return; // Stop
  }

  // Success

  dbg("Successful FeedClose message");

  // If a termination timer exists then kill it
  // May not exist even if the feed state is terminated (if terminationMs is 0)
  if (this._exists(this._terminationTimers, clientId, feedSerial)) {
    clearTimeout(this._terminationTimers[clientId][feedSerial]);
    this._delete(this._terminationTimers, clientId, feedSerial);
  }

  // Either emit to the app or respond with success immediately
  if (feedState === "open" && this.hasListeners("feedClose")) {
    // The feed state was open (not terminated) and there is
    // a feedClose listener
    dbg("Emitting feedClose event");

    // Update feed state
    this._set(this._clientFeedStates, clientId, feedSerial, "closing");
    this._set(this._feedClientStates, feedSerial, clientId, "closing");

    // Create, store, and emit a FeedCloseResponse object
    const fcreq = feedCloseRequest(clientId, msg.FeedName, msg.FeedArgs);
    const fcres = feedCloseResponse(this, fcreq);
    this._set(this._feedCloseResponses, clientId, feedSerial, fcres);
    this.emit("feedClose", fcreq, fcres);
  } else {
    // The feed state was terminated or it was open and there is no
    // feedClose listener. Either way, immediate success
    dbg("Returning immediate success to client");

    // Update feed state
    this._delete(this._clientFeedStates, clientId, feedSerial);
    this._delete(this._feedClientStates, feedSerial, clientId);

    // Send a FeedCloseResponse indicating success
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "FeedCloseResponse",
        FeedName: msg.FeedName,
        FeedArgs: msg.FeedArgs
      })
    );
  }
};

/**
 * Process a transport disconnect event.
 * @memberof Server
 * @instance
 * @private
 * @param {string} transportClientId
 * @param {?Error} err
 */
proto._processDisconnect = function _processDisconnect(transportClientId, err) {
  dbg("Observed transport disconnect event");

  const clientId = this._clientIds[transportClientId];

  // Neutralize any relevant response objects
  if (this._handshakeResponses[clientId]) {
    this._handshakeResponses[clientId]._neutralize();
  }
  if (this._actionResponses[clientId]) {
    _.each(this._actionResponses[clientId], ares => {
      ares._neutralize();
    });
  }
  if (this._feedOpenResponses[clientId]) {
    _.each(this._feedOpenResponses[clientId], fores => {
      fores._neutralize();
    });
  }
  if (this._feedCloseResponses[clientId]) {
    _.each(this._feedCloseResponses[clientId], fcres => {
      fcres._neutralize();
    });
  }

  // Clear any relevant timeouts
  if (this._handshakeTimers[clientId]) {
    clearTimeout(this._handshakeTimers[clientId]);
  }
  if (this._terminationTimers[clientId]) {
    _.each(this._terminationTimers[clientId], timerId => {
      clearTimeout(timerId);
    });
  }

  // Reset relevant state
  delete this._clientIds[transportClientId];
  delete this._transportClientIds[clientId];
  delete this._handshakeTimers[clientId];
  delete this._handshakeStatus[clientId];
  delete this._handshakeResponses[clientId];
  delete this._actionResponses[clientId];
  if (this._clientFeedStates[clientId]) {
    _.each(this._clientFeedStates[clientId], (state, feedSerial) => {
      this._delete(this._feedClientStates, feedSerial, clientId);
    });
    delete this._clientFeedStates[clientId];
  }
  delete this._terminationTimers[clientId];
  delete this._feedOpenResponses[clientId];
  delete this._feedCloseResponses[clientId];

  // Emit
  if (err) {
    this.emit("disconnect", clientId, err);
  } else {
    this.emit("disconnect", clientId);
  }
};

/**
 * Process an transportError event.
 * @memberof Server
 * @instance
 * @private
 * @param {Error} err
 */
proto._processTransportError = function _processTransportError(err) {
  dbg("Observed transport wrapper transportError event");

  this.emit("transportError", err);
};

// Response object functions

/**
 * Handle a successful app call to handshakeResponse.success()
 * The server has not stopped and client has not disconnected.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 */
proto._appHandshakeSuccess = function _appHandshakeSuccess(clientId) {
  dbg("Processing handshake success");

  const transportClientId = this._transportClientIds[clientId];

  // Update state (handshake timer was already cleared)
  delete this._handshakeResponses[clientId];
  this._handshakeStatus[clientId] = "complete";

  // Send a HandshakeResponse message indicating success
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "HandshakeResponse",
      Success: true,
      Version: feedmeVersion
    })
  );
};

/**
 * Handle a successful app call to actionResponse.success()
 * The server has not stopped and client has not disconnected.
 * Assume valid arguments - checked by response object.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} actionCallbackId
 * @param {Object} actionData
 */

proto._appActionSuccess = function _appActionSuccess(
  clientId,
  actionCallbackId,
  actionData
) {
  dbg("Processing action success");

  const transportClientId = this._transportClientIds[clientId];

  // Update state
  this._delete(this._actionResponses, clientId, actionCallbackId);

  // Send an ActionResponse message indicating success
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "ActionResponse",
      CallbackId: actionCallbackId,
      Success: true,
      ActionData: actionData
    })
  );
};

/**
 * Handle a successful app call to actionResponse.failure()
 * The server has not stopped and client has not disconnected.
 * Assume valid arguments - checked by response object.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} actionCallbackId
 * @param {string} errorCode
 * @param {Object} errorData
 */

proto._appActionFailure = function _appActionFailure(
  clientId,
  actionCallbackId,
  errorCode,
  errorData
) {
  dbg("Processing action failure");

  const transportClientId = this._transportClientIds[clientId];

  // Update state
  this._delete(this._actionResponses, clientId, actionCallbackId);

  // Send an ActionResponse message indicating failure
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "ActionResponse",
      CallbackId: actionCallbackId,
      Success: false,
      ErrorCode: errorCode,
      ErrorData: errorData
    })
  );
};

/**
 * Handle a successful app call to feedOpenResponse.success()
 * The server has not stopped and client has not disconnected.
 * Assume valid arguments - checked by response object.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} feedName
 * @param {Object} feedArgs
 * @param {Object} feedData
 */

proto._appFeedOpenSuccess = function _appFeedOpenSuccess(
  clientId,
  feedName,
  feedArgs,
  feedData
) {
  dbg("Processing feed open success");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(feedName, feedArgs);

  // Update state (any termination timer is already cleared)
  this._delete(this._feedOpenResponses, clientId, feedSerial);
  this._set(this._clientFeedStates, clientId, feedSerial, "open");
  this._set(this._feedClientStates, feedSerial, clientId, "open");

  // Send a FeedOpenResponse message indicating success
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "FeedOpenResponse",
      Success: true,
      FeedName: feedName,
      FeedArgs: feedArgs,
      FeedData: feedData
    })
  );
};

/**
 * Handle a successful app call to feedOpenResponse.failure()
 * The server has not stopped and client has not disconnected.
 * Assume valid arguments - checked by response object.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} feedName
 * @param {Object} feedArgs
 * @param {string} errorCode
 * @param {Object} errorData
 */

proto._appFeedOpenFailure = function _appFeedOpenFailure(
  clientId,
  feedName,
  feedArgs,
  errorCode,
  errorData
) {
  dbg("Processing feed open failure");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(feedName, feedArgs);

  // Update state (any termination timer is already cleared)
  this._delete(this._clientFeedStates, clientId, feedSerial);
  this._delete(this._feedClientStates, feedSerial, clientId);
  this._delete(this._feedOpenResponses, clientId, feedSerial);

  // Send a FeedOpenResponse message indicating failure
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "FeedOpenResponse",
      Success: false,
      FeedName: feedName,
      FeedArgs: feedArgs,
      ErrorCode: errorCode,
      ErrorData: errorData
    })
  );
};

/**
 * Handle a successful app call to feedCloseResponse.success()
 * The server has not stopped and client has not disconnected.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} feedName
 * @param {Array} feedArgs
 */

proto._appFeedCloseSuccess = function _appFeedCloseSuccess(
  clientId,
  feedName,
  feedArgs
) {
  dbg("Processing feed close success");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(feedName, feedArgs);

  // Update state (any termination timer is already cleared)
  this._delete(this._clientFeedStates, clientId, feedSerial);
  this._delete(this._feedClientStates, feedSerial, clientId);
  this._delete(this._feedCloseResponses, clientId, feedSerial);

  // Send a FeedCloseResponse message indicating success
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "FeedCloseResponse",
      FeedName: feedName,
      FeedArgs: feedArgs
    })
  );
};

// Internal helper functions

/**
 * Forcibly closes an opening feed by sending a FeedOpenResponse message
 * indicating failure. Sets feed state to closed.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} feedName
 * @param {Array} feedArgs
 * @param {string} errorCode
 * @param {Object} errorData
 * @returns {void}
 */
proto._terminateOpeningFeed = function _terminateOpeningFeed(
  clientId,
  feedName,
  feedArgs,
  errorCode,
  errorData
) {
  dbg("Terminating opening feed");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(feedName, feedArgs);

  // Set feed state to closed
  this._delete(this._clientFeedStates, clientId, feedSerial);
  this._delete(this._feedClientStates, feedSerial, clientId);

  // Neutralize the feedOpenResponse object and delete the reference to it
  this._feedOpenResponses[clientId][feedSerial]._neutralize();
  this._delete(this._feedOpenResponses, clientId, feedSerial);

  // Send FeedOpenResponse message indicating failure
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "FeedOpenResponse",
      Success: false,
      FeedName: feedName,
      FeedArgs: feedArgs,
      ErrorCode: errorCode,
      ErrorData: errorData
    })
  );
};

/**
 * Forcibly closes an open feed by sending a FeedTermination message.
 * Sets feed state to terminated.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {string} feedName
 * @param {Array} feedArgs
 * @param {string} errorCode
 * @param {Object} errorData
 * @returns {void}
 */
proto._terminateOpenFeed = function _terminateOpenFeed(
  clientId,
  feedName,
  feedArgs,
  errorCode,
  errorData
) {
  dbg("Terminating open feed");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(feedName, feedArgs);

  // Set feed state to terminated
  this._set(this._clientFeedStates, clientId, feedSerial, "terminated");
  this._set(this._feedClientStates, feedSerial, clientId, "terminated");

  // Set a termination timer (if so configured)
  if (this._options.terminationMs > 0) {
    this._set(
      this._terminationTimers,
      clientId,
      feedSerial,
      setTimeout(() => {
        this._delete(this._clientFeedStates, clientId, feedSerial);
        this._delete(this._feedClientStates, feedSerial, clientId);
        this._delete(this._terminationTimers, clientId, feedSerial);
      }, this._options.terminationMs)
    );
  }

  // Send FeedTermination message
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "FeedTermination",
      FeedName: feedName,
      FeedArgs: feedArgs,
      ErrorCode: errorCode,
      ErrorData: errorData
    })
  );
};

/**
 * Set obj.key1.key2 equal to val and create the obj.key1 object if it
 * doesn't exist.
 * @memberof Server
 * @instance
 * @private
 * @param {Object} obj
 * @param {string} key1
 * @param {string} key2
 * @param {*} val
 * @returns {void}
 */
proto._set = function _set(obj, key1, key2, val) {
  if (!(key1 in obj)) {
    obj[key1] = {}; // eslint-disable-line no-param-reassign
  }
  obj[key1][key2] = val; // eslint-disable-line no-param-reassign
};

/**
 * Delete obj.key1.key2 and then delete obj.key1 if it is empty.
 * @memberof Server
 * @instance
 * @private
 * @param {Object} obj
 * @param {string} key1
 * @param {string} key2
 * @returns {void}
 */
proto._delete = function _delete(obj, key1, key2) {
  delete obj[key1][key2]; // eslint-disable-line no-param-reassign
  if (_.isEmpty(obj[key1])) {
    delete obj[key1]; // eslint-disable-line no-param-reassign
  }
};

/**
 * Return obj.key1.key2 if it exists, otherwise return specified value.
 * @memberof Server
 * @instance
 * @private
 * @param {Object} obj
 * @param {string} key1
 * @param {string} key2
 * @param {*} missing
 * @returns {void}
 */
proto._get = function _get(obj, key1, key2, missing) {
  if (key1 in obj && key2 in obj[key1]) {
    return obj[key1][key2];
  }
  return missing;
};

/**
 * Return true if obj.key1.key2 exists and false if either key does not.
 * @memberof Server
 * @instance
 * @private
 * @param {Object} obj
 * @param {string} key1
 * @param {string} key2
 * @returns {void}
 */
proto._exists = function _exists(obj, key1, key2) {
  return key1 in obj && key2 in obj[key1];
};
