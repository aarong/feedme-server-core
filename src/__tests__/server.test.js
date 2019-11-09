import check from "check-types";
import md5Calculator from "feedme-util/md5calculator";
import server from "../server";
import config from "../config";
import harness from "./server.harness";

/*

File Structure

This is the master file and all other files are named server.*.js.
The harn and its tests are stored outside, as well as large test blocks
for certain functions.

Testing Strategy

Unit: Each method (app-, transport-, or internally-triggered) code branch.
For each unit, check that all potential results are as desired, including
verifying no change (errors, events, state, transport calls, return values).

1. Test state-modifying functionality
    For all outside function calls, transport events, and internal functions
      Test all errors (thrown)
      For each possible success type (by branch)
        Check server events (no extra)
        Check server internal state
        Check transport calls (no extra)
        Check outbound callbacks are called (none)
        Check inbound callbacks from transport and timers
          Check server events
          Check server internal state
          Check transport calls
          Check outbound callbacks are called (none)
        Check return value

2. Test state-getting functionality. Outside-facing and internal.
    No need to worry about events, state change, transport calls, or callbacks.
    Test that each "type" of state results in the correct error being thrown or
    return value being returned. This means that a given code path may
    have multiple tests.

State: Server members
    ._options
    ._transportWrapper (including state)
      ._transportWrapperState
    ._clientIds
    ._transportClientIds
    ._handshakeTimers
    ._handshakeStatus
    ._handshakeResponses (including state)
      ._handshakeResponseStates._server
      ._handshakeResponseStates._handshakeRequest
      ._handshakeResponseStates._appResponded
      ._handshakeResponseStates._neutralized
    ._actionResponses (including state)
      ._actionResponseStates._server
      ._actionResponseStates._actionRequest
      ._actionResponseStates._appResponded
      ._actionResponseStates._neutralized
    ._clientFeedStates
    ._feedClientStates
    ._terminationTimers
    ._feedOpenResponses (including state)
      ._feedOpenResponseStates._server
      ._feedOpenResponseStates._feedOpenRequest
      ._feedOpenResponseStates._appResponded
      ._feedOpenResponseStates._neutralized
    ._feedCloseResponses (including state)
      ._feedCloseResponseStates._server
      ._feedCloseResponseStates._feedCloseRequest
      ._feedCloseResponseStates._appResponded
      ._feedCloseResponseStates._neutralized

1. State-modifying functionality
    Outside-triggered
      server()
      .start()
      .stop()
      .actionRevelation()
      .feedTermination()
      .disconnect()
      ._appHandshakeSuccess() via handshakeResponse.success()
      ._appActionSuccess() via actionResponse.success()
      ._appActionFailures() via actionResponse.failure()
      ._appFeedOpenSuccess() via feedOpenResponse.success()
      ._appFeedOpenFailure() via feedOpenResponse.failure()
      ._appFeedCloseSuccess() via feedCloseResponse.success()
    Transport-triggered
      ._processStarting()
      ._processStart()
      ._processStopping()
      ._processStop()
      ._processConnect()
      ._processDisconnect()
      ._processMessage()
        ._processHandshake()
        ._processAction()
        ._processFeedOpen()
        ._processFeedClose()
    Internal
      ._setState()

2. State-getting functionality
    Server functions
      .state()
    Internal helper functions:
      ._getState()
      ._getClientFeeds()
      ._getFeedClients()

*/

expect.extend({
  toHaveState: harness.toHaveState
});

// Testing: app-triggered state modifiers

describe("The server() factory function", () => {
  describe("can return failure", () => {
    it("should throw on invalid options argument - missing", () => {
      expect(() => {
        server();
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
    });

    it("should throw on invalid options argument - bad type", () => {
      expect(() => {
        server("junk");
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
    });

    // The transport argument is checked by transportWrapper in main

    it("should throw on invalid options.transportWrapper argument - missing", () => {
      expect(() => {
        server({});
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid options.transportWrapper.")
      );
    });

    it("should throw on invalid options.transportWrapper argument - bad type", () => {
      expect(() => {
        server({ transportWrapper: "junk" });
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid options.transportWrapper.")
      );
    });

    it("should throw on invalid options.handshakeMs argument - bad type", () => {
      expect(() => {
        harness({ handshakeMs: "junk" });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.handshakeMs."));
    });

    it("should throw on invalid options.handshakeMs argument - non-integer", () => {
      expect(() => {
        harness({ handshakeMs: 1.2 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.handshakeMs."));
    });

    it("should throw on invalid options.handshakeMs argument - negative integer", () => {
      expect(() => {
        harness({ handshakeMs: -1 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.handshakeMs."));
    });

    it("should throw on invalid options.terminationMs argument - bad type", () => {
      expect(() => {
        harness({ terminationMs: "junk" });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.terminationMs."));
    });

    it("should throw on invalid options.terminationMs argument - non-integer", () => {
      expect(() => {
        harness({ terminationMs: 1.2 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.terminationMs."));
    });

    it("should throw on invalid options.terminationMs argument - negative integer", () => {
      expect(() => {
        harness({ terminationMs: -1 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.terminationMs."));
    });
  });

  describe("can return success", () => {
    // Events - N/A

    // State

    it("should set the initial state correctly using defaults", () => {
      const harn = harness();
      expect(harn.server).toHaveState({
        _options: {
          handshakeMs: config.defaults.handshakeMs,
          terminationMs: config.defaults.terminationMs
        },
        _transportWrapper: harn.transportWrapper,
        _transportWrapperState: "stopped",
        _clientIds: {},
        _transportClientIds: {},
        _handshakeTimers: {},
        _handshakeStatus: {},
        _handshakeResponses: {},
        _handshakeResponseStates: {},
        _actionResponses: {},
        _actionResponseStates: {},
        _clientFeedStates: {},
        _feedClientStates: {},
        _terminationTimers: {},
        _feedOpenResponses: {},
        _feedOpenResponseStates: {},
        _feedCloseResponses: {},
        _feedCloseResponseStates: {}
      });
    });

    it("should set the initial state correctly using custom options", () => {
      const harn = harness({
        handshakeMs: 123,
        terminationMs: 456
      });
      expect(harn.server).toHaveState({
        _options: {
          handshakeMs: 123,
          terminationMs: 456
        },
        _transportWrapper: harn.transportWrapper,
        _transportWrapperState: "stopped",
        _clientIds: {},
        _transportClientIds: {},
        _handshakeTimers: {},
        _handshakeStatus: {},
        _handshakeResponses: {},
        _handshakeResponseStates: {},
        _actionResponses: {},
        _actionResponseStates: {},
        _clientFeedStates: {},
        _feedClientStates: {},
        _terminationTimers: {},
        _feedOpenResponses: {},
        _feedOpenResponseStates: {},
        _feedCloseResponses: {},
        _feedCloseResponseStates: {}
      });
    });

    // Transport calls

    it("should make no transport calls", () => {
      const harn = harness();
      expect(harn.transportWrapper.state.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.send.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    // Return value

    it("should return an object", () => {
      const harn = harness();
      expect(check.object(harn.server)).toBe(true);
    });
  });
});

describe("The server.start() function", () => {
  describe("can return failure", () => {
    it("should throw if the server is not stopped", () => {
      const harn = harness();
      harn.server.start();
      harn.transportWrapper.state.mockReturnValue("starting");
      harn.transportWrapper.emit("starting");
      expect(() => {
        harn.server.start();
      }).toThrow(new Error("INVALID_STATE: The server is not stopped."));
    });
  });

  describe("can return success", () => {
    // Events

    it("should emit starting", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();

      harn.server.start();

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      const newState = harn.getServerState();

      harn.server.start();

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should call transport.start()", () => {
      const harn = harness();
      harn.server.start();

      expect(harn.transportWrapper.start.mock.calls.length).toBe(1);
      expect(harn.transportWrapper.start.mock.calls[0].length).toBe(0);
      expect(harn.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.send.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value

    it("should return void", () => {
      const harn = harness();
      expect(harn.server.start()).toBe(undefined);
    });
  });
});

describe("The server.stop() function", () => {
  describe("can return failure", () => {
    it("should throw if the server is not started", () => {
      const harn = harness();
      expect(() => {
        harn.server.stop();
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });
  });

  describe("can return success", () => {
    // Events

    it("should emit nothing", () => {
      const harn = harness();
      harn.makeServerStarted();
      const serverListener = harn.createServerListener();

      harn.server.stop();

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const newState = harn.getServerState();

      harn.server.stop();

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should call transport.stop()", () => {
      const harn = harness();
      harn.makeServerStarted();

      harn.server.stop();

      expect(harn.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.stop.mock.calls.length).toBe(1);
      expect(harn.transportWrapper.stop.mock.calls[0].length).toBe(0);
      expect(harn.transportWrapper.send.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value

    it("should return void", () => {});
  });
});

describe("The server.actionRevelation() function", () => {
  describe("can return failure", () => {
    it("should throw if the server is not started", () => {
      const harn = harness();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });

    it("should throw on invalid params - bad type", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation(null);
      }).toThrow("INVALID_ARGUMENT: Invalid params.");
    });

    it("should throw on invalid params.actionName - bad type", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: false,
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid action name.");
    });

    it("should throw on invalid params.actionName - empty string", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid action name.");
    });

    it("should throw on invalid params.actionData - bad type", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: 123,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid action data.");
    });

    it("should throw on invalid params.actionData - not JSON-expressible", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { value: undefined },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Action data is not JSON-expressible.");
    });

    it("should throw on invalid params.feedName", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: false,
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed name.");
    });

    it("should throw on invalid params.feedArgs", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { junk: 123 },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed arguments object.");
    });

    it("should throw on invalid params.feedDeltas - bad type", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: null
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed deltas.");
    });

    it("should throw on invalid params.feedDeltas - schema violation", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [null]
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed delta.");
    });

    it("should throw on invalid params.feedDeltas - non JSON-expressible value", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [
            { Operation: "Set", Path: {}, Value: { junk: undefined } }
          ]
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed delta.");
    });

    it("should throw if params.feedData and params.feedMD5 are both present", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedMd5: "123456789012345678901234",
          feedData: {}
        });
      }).toThrow(
        "INVALID_ARGUMENT: Cannot specify both params.feedMd5 and params.feedData."
      );
    });

    it("should throw on invalid params.feedMd5 - bad type", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedMd5: null
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data hash.");
    });

    it("should throw on invalid params.feedMd5 - bad form", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedMd5: "a"
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data hash.");
    });

    it("should throw on invalid params.feedData - bad type", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedData: null
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data.");
    });

    it("should throw on invalid params.feedData - not JSON-expressible", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedData: { junk: undefined }
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data.");
    });
  });

  describe("can return success", () => {
    let harn;
    let cidClosed; // eslint-disable-line no-unused-vars
    let cidOpening; // eslint-disable-line no-unused-vars
    let cidOpen; // eslint-disable-line no-unused-vars
    let cidClosing; // eslint-disable-line no-unused-vars
    let cidOtherfaOpen; // eslint-disable-line no-unused-vars
    let cidOtherfnOpen; // eslint-disable-line no-unused-vars
    beforeEach(() => {
      harn = harness();
      harn.makeServerStarted();

      // Client with the feed closed
      cidClosed = harn.makeClient("tcid_client_closed");

      // Client with the feed opening
      cidOpening = harn.makeClient("tcid_client_opening");
      harn.makeFeedOpening("tcid_client_opening", "some_feed", {
        feed: "args"
      });

      // Client with the feed open
      cidOpen = harn.makeClient("tcid_client_open");
      harn.makeFeedOpen(
        "tcid_client_open",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );

      // Client with the feed closing
      cidClosing = harn.makeClient("tcid_client_closing");
      harn.makeFeedClosing("tcid_client_closing", "some_feed", {
        feed: "args"
      });

      // Client with another feed argument open
      cidOtherfaOpen = harn.makeClient("tcid_client_otherfa_open");
      harn.makeFeedOpen(
        "tcid_client_otherfa_open",
        "some_feed",
        { feed: "args_other" },
        { feed: "data" }
      );

      // Client with another feed name open
      cidOtherfnOpen = harn.makeClient("tcid_client_otherfn_open");
      harn.makeFeedOpen(
        "tcid_client_otherfn_open",
        "some_other_feed",
        { feed: "args" },
        { feed: "data" }
      );
    });

    // Events

    it("should emit nothing", () => {
      const serverListener = harn.createServerListener();

      harn.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const newState = harn.getServerState();

      harn.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should call .send() for appropriate clients - with no data verification", () => {
      harn.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });

      expect(harn.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.send.mock.calls.length).toBe(1);
      expect(harn.transportWrapper.send.mock.calls[0].length).toBe(2);
      expect(harn.transportWrapper.send.mock.calls[0][0]).toBe(
        "tcid_client_open"
      );
      expect(JSON.parse(harn.transportWrapper.send.mock.calls[0][1])).toEqual({
        MessageType: "ActionRevelation",
        ActionName: "some_action",
        ActionData: { action: "data" },
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });
      expect(harn.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    it("should call .send() for appropriate clients - with hash", () => {
      harn.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        feedMd5: "123456789012345678901234"
      });

      expect(harn.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.send.mock.calls.length).toBe(1);
      expect(harn.transportWrapper.send.mock.calls[0].length).toBe(2);
      expect(harn.transportWrapper.send.mock.calls[0][0]).toBe(
        "tcid_client_open"
      );
      expect(JSON.parse(harn.transportWrapper.send.mock.calls[0][1])).toEqual({
        MessageType: "ActionRevelation",
        ActionName: "some_action",
        ActionData: { action: "data" },
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        FeedMd5: "123456789012345678901234"
      });
      expect(harn.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    it("should call .send() for appropriate clients - with feed data", () => {
      harn.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        feedData: { feed: "data2" }
      });

      expect(harn.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harn.transportWrapper.send.mock.calls.length).toBe(1);
      expect(harn.transportWrapper.send.mock.calls[0].length).toBe(2);
      expect(harn.transportWrapper.send.mock.calls[0][0]).toBe(
        "tcid_client_open"
      );
      expect(JSON.parse(harn.transportWrapper.send.mock.calls[0][1])).toEqual({
        MessageType: "ActionRevelation",
        ActionName: "some_action",
        ActionData: { action: "data" },
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        FeedMd5: md5Calculator.calculate({ feed: "data2" })
      });
      expect(harn.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value
    it("should return void", () => {
      expect(
        harn.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [
            {
              Operation: "Set",
              Path: ["feed"],
              Value: "data2"
            }
          ]
        })
      ).toBe(undefined);
    });
  });
});

describe("The server.feedTermination() function", () => {
  // See server.feedtermination.test.js
});

describe("The server.disconnect() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appHandshakeSuccess() and handshakeResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appActionSuccess() and actionResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appActionFailure() and actionResponse.failure() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appFeedOpenSuccess() and feedOpenResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appFeedOpenFailure() and feedOpenResponse.failure() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appFeedCloseSuccess() and feedCloseResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

// Testing: transport-triggered state modifiers

describe("The server._processStarting() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processStart() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processStopping() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processStop() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processConnect() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processDisconnect() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processMessage() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processHandshake() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processAction() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processFeedOpen() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processFeedClose() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

// Testing: internal state modifiers

describe("The server._setState() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._terminateOpeningFeed() function", () => {
  // Tested as part of server.feedTermination()
});

describe("The server._terminateOpenFeed() function", () => {
  // Tested as part of server.feedTermination()
});

describe("The server._delete() function", () => {});

describe("The server._set() function", () => {});

// Testing: app-triggered state-getting functionality

describe("The server.state() function", () => {});

// Testing: internal state-getting functionality

describe("The server._get() function", () => {});

describe("The server._getClientFeeds() function", () => {});

describe("The server._getFeedClients() function", () => {});
