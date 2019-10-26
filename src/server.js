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
 * Feedme Server Core
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
 * Factory function
 * @param {Object} options
 * @param {TransportWrapper} options.transportWrapper
 * @param {number} options.handshakeMs
 * @param {number} options.terminationMs
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @returns {Server}
 */

export default function serverFactory(options) {
  dbg("Initializing server object");

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
   * Configuration options excluding the transportWrapper
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
   * server._clientIds[tcid] = clientId
   *
   * Added when a client connects to the transport
   *   Not necessarily communicated via HandshakeResponse yet, but pre-specified
   *   Presence does not mean the handshake process is complete
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
   * server._transportClientIds[cid] = transportClientId
   *
   * Added when a client connects via the transport - pre-specified
   *   Presence does not mean the handshake process is complete
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
   * Timer ids for handshake timeout disconnects, indexed by Feedme client id.
   *
   * server._handshakeTimers[cid] = timerId
   *
   * Added when a client connects to the transport
   *   Absence does not mean that the handshake process is complete
   *   HandshakeResponse could be pending if there is a `handshake` event listener
   *
   * Removed when
   *    The client submits a version-compatible Handshake message
   *    The client disconnects from the transport
   *    The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._handshakeTimers = {};

  /**
   * Handshake status flags.
   *
   * server._handshakeStatus[cid] = missing/string
   *
   * Missing if there is no client with the id
   * "waiting" if waiting for a version-compatible Handshake message
   * "processing" if a version-compatible Handshake message has been received
   *   but a successful HandshakeResponse hasn't been sent (waiting on app)
   * "complete" if the handshake has been completed successfully
   *   Action, FeedOpen, and FeedClose messages are valid
   *
   * Added when a client connects
   *
   * Removed when
   *   The client disconnects
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
   * Added when a valid and version-compatible `Handshake` message is received
   *   Before the `handshake` event is emitted
   *
   * Removed when
   *   The app calls `handshakeResponse.success()` and a `HandshakeResponse` is sent
   *   The client disconnects from the transport (object neutralized)
   *   The server stops (object neutralized)
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._handshakeResponses = {};

  /**
   * Active ActionResponse objects that have been emitted to the application.
   *
   * server._actionResponses[cid][actionCallbackId] = ActionResponse object
   *
   * Added when a valid `Action` message is received
   *   Before the `action` event is emitted
   *
   * Removed when
   *   The app calls `actionResponse.success/failure()` an an `ActionResponse` is sent
   *   The client disconnects from the transport (object neutralized)
   *   The server stops (object neutralized)
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._actionResponses = {};

  /**
   * State of client feeds that are not closed
   * Indexed by client id and then feed serial
   * Either opening, open, closing, or terminated
   *
   * Added when a client transmits a FeedOpen message
   *
   * Removed when
   *  A FeedCloseResponse is message sent
   *  A FeedTermination message is sent and terminationMs passes
   *  The client disconnects
   *  The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._clientFeedStates = {};

  /**
   * State of client feeds that are not closed
   * Indexed by feed serial and then client id
   * Either opening, open, closing, or terminated
   *
   * Added when a client transmits a FeedOpen message
   *
   * Removed when
   *  A FeedCloseResponse message is sent
   *  A FeedTermination message is sent and terminationMs passes
   *  The client disconnects
   *  The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._feedClientStates = {};

  /**
   * Timers to flip feed state from terminated to closed.
   * Indexed by client id and feed serial.
   *
   * Added when a FeedTermination message is sent
   *
   * Removed when
   *  The terminationMs period elapses
   *  The client disconnects
   *  The server stops
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._terminationTimers = {};

  /**
   * Active FeedOpenResponse objects that have been emitted to the application.
   *
   * server._feedOpenResponses[cid][feedSerial] = FeedOpenResponse object
   *
   * Added when a valid `FeedOpen` message is received
   *   Before the `feedOpen` event is emitted
   *
   * Removed when
   *   The app calls `feedOpenResponse.success/failure()` and a `FeedOpenResponse` is sent
   *   The app calls `server.feedTermination()` on the feed and a `FeedOpenResponse` is sent (object neutralized)
   *   The client disconnects from the transport (object neutralized)
   *   The server stops (object neutralized)
   *
   * Always and only exists when FeedManager state is `opening`.
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._feedOpenResponses = {};

  /**
   * Active FeedCloseResponse objects that have been emitted to the application.
   *
   * server._feedCloseResponses[cid][feedSerial] = FeedCloseResponse object
   *
   * Added when a valid `FeedClose` message is received
   *   Before the `feedClose` event is emitted
   *
   * Removed when
   *   The app calls `feedCloseResponse.success()`
   *   The client disconnects from the transport (object neutralized)
   *   The server stops (object neutralized)
   *
   * Always and only exists when FeedManager state is `closing`.
   *
   * @memberof Server
   * @instance
   * @private
   * @type {Object}
   */
  server._feedCloseResponses = {};

  // Listen for transport events
  server._transportWrapper.on("starting", () => {
    server._processStarting();
  });
  server._transportWrapper.on("start", () => {
    server._processStart();
  });
  server._transportWrapper.on("stopping", err => {
    server._processStopping(err);
  });
  server._transportWrapper.on("stop", err => {
    server._processStopp(err);
  });
  server._transportWrapper.on("connect", tcid => {
    server._processConnect(tcid);
  });
  server._transportWrapper.on("message", (tcid, msg) => {
    server._processMessage(tcid, msg);
  });
  server._transportWrapper.on("disconnect", (tcid, err) => {
    server._processDisconnect(tcid, err);
  });

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
 * @param {?Error} err Present iff this did not result from a call to `server.stop()`
 */

/**
 * @event stop
 * @memberof Server
 * @instance
 * @param {?Error} err Present iff this did not result from a call to `server.stop()`
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
 * @param {string} clientId
 * @instance
 * @param {?Error} err Present iff this did not result from a call to `server.disconnect()`
 */

/**
 * @event badClientMessage
 * @memberof Server
 * @instance
 * @param {string} clientId
 * @param {Error} err "INVALID_MESSAGE: ..."
 *                    "UNEXPECTED_MESSAGE: ..."
 */

/**
 * @event transportError
 * @memberof Server
 * @instance
 * @param {Error} err
 */

// Public functions

/**
 * @memberof Server
 * @instance
 * @returns {string} starting/started/stopping/stopped
 */
proto.state = function state() {
  dbg("State requested");

  return this._transportWrapper.state();
};

/**
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
 * Transmits ActionRevelation messages to clients that have opened
 * the specified feed.
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

  // Check action name
  if (!check.nonEmptyString(params.actionName)) {
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
      validateDelta.check(delta, true); // Ensure Values are JSON-expressible
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
      // eslint-disable-next-line prefer-destructuring
      feedMd5 = params.feedMd5;
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
        this._transportWrapper.send(clientId, msg);
      }
    });
  }
};

/**
 * Closes client feeds using FeedTermination messages (if open)
 * and FeedOpenResponse messages (if opening).
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

  // Check usage (same numbering as user docs)
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
  if (usage !== 3 && !check.nonEmptyString(params.clientId)) {
    throw new Error("INVALID_ARGUMENT: Invalid client id.");
  }

  // Check feed name/args and cascade errors (if required by usage)
  if (usage !== 2) {
    feedValidator.validate(params.feedName, params.feedArgs);
  }

  // Check error code (required for all usages)
  if (!check.nonEmptyString(params.errorCode)) {
    throw new Error("INVALID_ARGUMENT: Invalid error code.");
  }

  // Check error data (required for all usages)
  if (!check.object(params.errorData) || !jsonExpressible(params.errorData)) {
    throw new Error("INVALID_ARGUMENT: Invalid error data.");
  }

  // Success

  // Act based on usage
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
 * Disconnects a client - post-handshake only.
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

  // Check if client id is valid
  if (!check.nonEmptyString(clientId)) {
    throw new Error("INVALID_ARGUMENT: Invalid client id.");
  }

  // Throw is client has not completed a handshake (app not in control)
  if (this._handshakeStatus[clientId] !== "complete") {
    throw new Error(
      "INVALID_STATE: Client does not exist or has not completed a hanshake."
    );
  }

  // Disconnect on the transport
  this._transportWrapper.disconnect(clientId);
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
 * Process a transport started event.
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
 * Transport required to have already emitted `disconnect` events for all
 * previously-connected clients.
 * @memberof Server
 * @instance
 * @private
 */
proto._processStopping = function _processStopping(err) {
  dbg("Observed transport stopping event");

  // Neutralize all response objects
  _.each(this._handshakeResponses, hsres => {
    hsres._neutralize();
  });
  _.each(this._actionResponses, client => {
    _.each(client, ares => {
      ares._neutralize();
    });
  });
  _.each(this._feedOpenResponses, client => {
    _.each(client, fores => {
      fores._neutralize();
    });
  });
  _.each(this._feedCloseResponses, client => {
    _.each(client, fcres => {
      fcres._neutralize();
    });
  });

  // Clear all handshake timers
  _.each(this._handshakeTimers, timerId => {
    clearTimeout(timerId);
  });

  // Clear all termination timers
  _.each(this._terminationTimers, clientTimers => {
    _.each(clientTimers, timerId => {
      clearTimeout(timerId);
    });
  });

  // Reset internal state
  this._clientIds = {};
  this._transportClientIds = {};
  this._handshakeTimers = {};
  this._handshakeStatus = {};
  this._handshakeResponses = {};
  this._actionResponses = {};
  this._clientFeedStates = {};
  this._feedClientStates = {};
  this._terminationTimers = {};
  this._feedOpenResponses = {};
  this._feedCloseResponses = {};

  // Emit the event
  if (err) {
    this.emit("stopping", err);
  } else {
    this.emit("stopping");
  }
};

/**
 * Process a transport stopped event.
 * @memberof Server
 * @instance
 * @private
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

  // Pre-assign a Feedme client id
  const clientId = uuid();
  this._clientIds[transportClientId] = clientId;
  this._transportClientIds[clientId] = transportClientId;

  // Set handshake status
  this._handshakeStatus[clientId] = "waiting";

  // Set a handshake timer if configured
  if (this._options.handshakeMs > 0) {
    this._handshakeTimers[clientId] = setTimeout(() => {
      // Disconnect event handler resets the client state
      this._transportWrapper.disconnect(
        transportClientId,
        new Error(
          "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
        )
      );
    }, this._options.handshakeMs);
  }

  // Await a Handshake message
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
  const handshakeStatus = this._handshakeStatus[clientId];

  // Neutralize any response objects
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

  // Clear any handshake timeout
  if (this._handshakeTimers[clientId]) {
    clearTimeout(this._handshakeTimers[clientId]);
    delete this._handshakeTimers[clientId];
  }

  // Clear any termination timeouts
  if (this._terminationTimers[clientId]) {
    _.each(this._terminationTimers[clientId], timerId => {
      clearTimeout(timerId);
    });
  }

  // Reset internal state related to this client
  delete this._clientIds[transportClientId];
  delete this._transportClientIds[clientId];
  delete this._handshakeTimers[clientId];
  delete this._handshakeStatus[clientId];
  delete this._handshakeResponses[clientId];
  delete this._actionResponses[clientId];
  if (this._clientFeedStates[clientId]) {
    _.each(this._clientFeedStates[clientId], (state, feedSerial) => {
      delete this._feedClientStates[feedSerial][clientId];
    });
    delete this._clientFeedStates[clientId];
  }
  delete this._terminationTimers[clientId];
  delete this._feedOpenResponses[clientId];
  delete this._feedCloseResponses[clientId];

  // Emit only if the app was aware of this client
  if (handshakeStatus !== "waiting") {
    if (err) {
      this.emit("disconnect", clientId, err);
    } else {
      this.emit("disconnect", clientId);
    }
  }
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
  // No need to check JSON-expressibility (coming from JSON)
  // Send ViolationResponse if the message was structurally invalid
  let val;
  try {
    val = JSON.parse(msg);
    validateClientMessage.check(val);
    if (val.MessageType === "Handshake") {
      validateHandshake.check(val, false);
    } else if (val.MessageType === "Action") {
      validateAction.check(val, false);
    } else if (val.MessageType === "FeedOpen") {
      validateFeedOpen.check(val, false);
    } else if (val.MessageType === "FeedClose") {
      validateFeedClose.check(val, false);
    }
  } catch (e) {
    dbg("Invalid JSON or schema violation: %0", e);
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
    return;
  }

  // Route the message
  dbg("Routing the message");
  this[`_process${val.MessageType}`](clientId, val);
};

/**
 * Process a Handshake message.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {Object} msg Valid Handshake message object
 */
proto._processHandshake = function _processHandshake(clientId, msg) {
  dbg("Received Handshake message");

  const transportClientId = this._transportClientIds[clientId];

  // Send a ViolationResponse if unexpected
  if (this._handshakeStatus[clientId] !== "waiting") {
    dbg("Unexpected Handshake message - status not waiting");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected Handshake message.",
          Message: msg
        }
      })
    );
    return; // Stop
  }

  // Send HandshakeResponse failure if no compatible version
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

  // Kill the handshake timer (will not exist if options.handshakeMs is 0)
  if (this._handshakeTimers[clientId]) {
    clearTimeout(this._handshakeTimers[clientId]);
    delete this._handshakeTimers[clientId];
  }

  // If there is a handshake event listener, emit
  // Otherwise complete the handshake
  if (this.hasListeners("handshake")) {
    dbg("Emitting handshake event to application");

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
    this._transportWrapper.send(transportClientId, {
      MessageType: "HandshakeResponse",
      Success: true,
      Version: feedmeVersion,
      ClientId: clientId
    });
  }
};

/**
 * Process an Action message.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 * @param {Object} msg Valid Action message object
 */
proto._processAction = function _processAction(clientId, msg) {
  dbg("Received Action message");

  const transportClientId = this._transportClientIds[clientId];

  // Send ViolationResponse if handshake not complete
  if (this._handshakeStatus[clientId] !== "complete") {
    dbg("Unexpected Action message - Handshake required");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      })
    );
    return;
  }

  // Send a ViolationResponse if the callback id is in use
  if (this._actionResponses[clientId][msg.CallbackId]) {
    dbg("Unexpected Action message - CallbackId in use");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Action message reused an outstanding CallbackId.",
          Message: msg
        }
      })
    );
    return; // Stop
  }

  // If there is no action listener then return an error to the client
  if (!this.hasListeners("action")) {
    dbg("No action listener - stopping");
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

  dbg("Successful Action message - emitting action event to application");

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
 * @param {Object} msg Valid FeedOpen message object
 */
proto._processFeedOpen = function _processFeedOpen(clientId, msg) {
  dbg("Received FeedOpen message");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(msg.FeedName, msg.FeedArgs);

  // Send ViolationResponse if handshake not complete
  if (this._handshakeStatus[clientId] !== "complete") {
    dbg("Unexpected FeedOpen message - Handshake required");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      })
    );
    return;
  }

  // Get feed state
  const feedState = this._get(
    this._clientFeedStates,
    clientId,
    feedSerial,
    "closed"
  );

  // Send a ViolationResponse if the feed isn't closed or terminated
  if (feedState !== "closed" && feedState !== "terminated") {
    dbg("Unexpected FeedOpen message - feed not closed/terminated");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedOpen message.",
          Message: msg
        }
      })
    );
    return; // Stop
  }

  // If there are no feedOpen listeners then return an error to the client
  if (!this.hasListeners("feedOpen")) {
    dbg("No feedOpen listener - stopping");
    this._transportWrapper.send(transportClientId, {
      MessageType: "FeedOpenResponse",
      Success: false,
      FeedName: msg.FeedName,
      FeedArgs: msg.FeedArgs,
      ErrorCode: "INTERNAL_ERROR",
      ErrorData: {}
    });
    return; // Stop
  }

  // Success

  dbg("Successful FeedOpen message - emitting feedOpen event to application");

  // If the feed state was terminated then kill the termination timer
  if (feedState === "terminated") {
    clearTimeout(this._terminationTimers[clientId][feedSerial]);
    this._delete(this._terminationTimers, clientId, feedSerial);
  }

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
 * @param {Object} msg Valid FeedClose message object
 */
proto._processFeedClose = function _processFeedClose(clientId, msg) {
  dbg("Received FeedClose message");

  const transportClientId = this._transportClientIds[clientId];
  const feedSerial = feedSerializer.serialize(msg.FeedName, msg.FeedArgs);

  // Send ViolationResponse if handshake not complete
  if (this._handshakeStatus[clientId] !== "complete") {
    dbg("Unexpected FeedClose message - Handshake required");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      })
    );
    return;
  }

  // Get the feed state
  const feedState = this._get(
    this._clientFeedStates,
    clientId,
    feedSerial,
    "closed"
  );

  // Send a ViolationResponse if the feed was not open or terminated
  if (feedState !== "open" && feedState !== "terminated") {
    dbg("Unexpected FeedClose message - feed not closed/terminated");
    this._transportWrapper.send(
      transportClientId,
      JSON.stringify({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedClose message.",
          Message: msg
        }
      })
    );
    return;
  }

  // Success

  dbg("Successful FeedClose message");

  // If the feed state was terminated then kill the termination timer
  if (feedState === "terminated") {
    clearTimeout(this._terminationTimers[clientId][feedSerial]);
    this._delete(this._terminationTimers, clientId, feedSerial);
  }

  // Either emit to the app or respond with success immediately
  if (feedState === "open" && this.hasListeners("feedClose")) {
    dbg("Emitting feedClose event to application");

    // The feed state was open, not terminated, and there is
    // a feedClose listener

    // Update feed state
    this._set(this._clientFeedStates, clientId, feedSerial, "closing");
    this._set(this._feedClientStates, feedSerial, clientId, "closing");

    // Create, store, and emit a FeedCloseResponse object
    const fcreq = feedCloseRequest(clientId, msg.FeedName, msg.FeedArgs);
    const fcres = feedCloseResponse(this, fcreq);
    this._set(this._feedCloseResponses, clientId, feedSerial, fcres);
    this.emit("feedClose", fcreq, fcres);
  } else {
    dbg("Returning immediate success to client");
    // The feed state was terminated or it was open and there is no
    // feedClose listener. Either way, immediate success

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

// Response object functions

/**
 * Handle a successful app call to handshakeResponse.success()
 *
 * Server has not stopped and client has not disconnected.
 * @memberof Server
 * @instance
 * @private
 * @param {string} clientId
 */
proto._appHandshakeSuccess = function _appHandshakeSuccess(clientId) {
  dbg("Processing handshake success");

  const transportClientId = this._transportClientIds[clientId];

  // Update internal state (handshake timer already cleared)
  delete this._handshakeResponses[clientId];
  this._handshakeStatus[clientId] = "complete";

  // Send a HandshakeResponse message indicating success
  this._transportWrapper.send(
    transportClientId,
    JSON.stringify({
      MessageType: "HandshakeResponse",
      Success: true,
      Version: feedmeVersion,
      ClientId: clientId
    })
  );
};

/**
 * Handle a successful app call to actionResponse.success()
 *
 * Action data type and JSON-expressibility checked by response object.
 *    MOVE this functionality here for all _app functions?
 *
 * Server has not stopped and client has not disconnected.
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

  // Update internal state
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
 *
 * Error code type and error data data type and JSON-expressibility checked
 * by response object.
 *
 * Server has not stopped and client has not disconnected.
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

  // Update internal state
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
 *
 * Feed data type and JSON-expressibility checked by response object.
 *
 * Server has not stopped and client has not disconnected.
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

  // Update internal state (any termination timer is already cleared)
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
 *
 * Error code type and error data data type and JSON-expressibility checked
 * by response object.
 *
 * Server has not stopped and client has not disconnected.
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

  // Update internal state (any termination timer is already cleared)
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
 *
 * Server has not stopped and client has not disconnected.
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
      FeedArgs: feedArgs,
      Success: true
    })
  );
};

// Internal helper functions

/**
 * Terminates an opening feed by sending a FeedOpenResponse message
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

  // Set internal state to closed
  this._delete(this._clientFeedStates, clientId, feedSerial);
  this._delete(this._feedClientStates, feedSerial, clientId);

  // Neutralize the feedOpenResponse object passed with the feedOpen event
  // and delete the reference to it
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
 * Terminates an open feed by sending a FeedTermination message.
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

  // Set internal state to terminated
  this._set(this._clientFeedStates, clientId, feedSerial, "terminated");
  this._set(this._feedClientStates, feedSerial, clientId, "terminated");

  // Set a termination timer if so configured
  if (this._options.terminationMs > 0) {
    if (!this._terminationTimers[clientId]) {
      this._terminationTimers[clientId] = {};
    }
    this._terminationTimers[clientId][feedSerial] = setTimeout(() => {
      this._delete(this._clientFeedStates, clientId, feedSerial);
      this._delete(this._feedClientStates, feedSerial, clientId);
    }, this._options.terminationMs);
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
 * Delete obj.key1.key2 and then delete obj.key1 if it is empty.
 * Assume that obj.key1 exists.
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
 * Set obj.key1.key2 equal to val and create the obj.key1 object if it
 * doesn't exist.
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
 * Return obj.key1.key2 if it exists, otherwise return missing value.
 * @instance
 * @private
 * @param {Object} obj
 * @param {string} key1
 * @param {string} key2
 * @param {*} missing
 * @param {*} val
 * @returns {void}
 */
proto._get = function _get(obj, key1, key2, missing) {
  if (key1 in obj && key2 in obj[key1]) {
    return obj[key1][key2];
  }
  return missing;
};
