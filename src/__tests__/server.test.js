import feedSerializer from "feedme-util/feedserializer";
import check from "check-types";
import md5Calculator from "feedme-util/md5calculator";
import server from "../server";
import config from "../config";
import harness from "./server.harness";

jest.useFakeTimers();

/*

File Structure

This is the master file and all other files are named server.*.js.
The harness, its tests, and large test blocks are kept are in external files.

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
      ._set()
      ._delete()

2. State-getting functionality
    App-triggered
      .state()
    Internal
      ._get()
      ._exists()

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

    it("should throw on invalid options.transport argument - missing", () => {
      expect(() => {
        server({});
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid options.transportWrapper.")
      );
    });

    it("should throw on invalid options.transport argument - bad type", () => {
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
        _transportWrapper: harn.server._transportWrapper,
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
        _transportWrapper: harn.server._transportWrapper,
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
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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
      harn.transport.state.mockReturnValue("starting");
      harn.transport.emit("starting");
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
      expect(serverListener.connect.mock.calls.length).toBe(0);
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

      expect(harn.transport.start.mock.calls.length).toBe(1);
      expect(harn.transport.start.mock.calls[0].length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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
      expect(serverListener.connect.mock.calls.length).toBe(0);
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

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(1);
      expect(harn.transport.stop.mock.calls[0].length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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
    describe("it may have clients", () => {
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
        expect(serverListener.connect.mock.calls.length).toBe(0);
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

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("tcid_client_open");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
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
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("tcid_client_open");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
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
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("tcid_client_open");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
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
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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

    describe("it may have no clients", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.makeServerStarted();
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
        expect(serverListener.connect.mock.calls.length).toBe(0);
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

      it("should do nothing on the transport", () => {
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

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(0);
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
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
});

describe("The server.feedTermination() function", () => {
  // See server.feedtermination.test.js
});

describe("The server.disconnect() function", () => {
  describe("can return failure", () => {
    it("should throw on invalid server state", () => {
      const harn = harness();
      expect(() => {
        harn.server.disconnect("cid");
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });

    it("should throw on missing client id", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.disconnect();
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
    });

    it("should throw on invalid client id", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.disconnect(false);
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
    });
  });

  describe("can return success", () => {
    // Events

    it("should emit nothing", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cidTarget = harn.makeClient("some_tcid");
      const serverListener = harn.createServerListener();
      harn.server.disconnect(cidTarget);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
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
      const cidTarget = harn.makeClient("some_tcid");
      const newState = harn.getServerState();

      harn.server.disconnect(cidTarget);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should not call transport.disconnect() if client is not connected", () => {
      const harn = harness();
      harn.makeServerStarted();

      harn.server.disconnect("junk");

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    it("should call transport.disconnect() if client is connected", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cidTarget = harn.makeClient("some_tcid");

      harn.server.disconnect(cidTarget);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(1);
      expect(harn.transport.disconnect.mock.calls[0].length).toBe(1);
      expect(harn.transport.disconnect.mock.calls[0][0]).toBe("some_tcid");
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value

    it("should return nothing", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cidTarget = harn.makeClient("some_tcid");

      expect(harn.server.disconnect(cidTarget)).toBeUndefined();
    });
  });
});

describe("The server._appHandshakeSuccess() function - via handshakeResponse.success()", () => {
  describe("can return failure", () => {
    // N/A
  });

  describe("can return success", () => {
    // Events

    it("should emit nothing", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();

      harn.server.once("handshake", (hsreq, hsres) => {
        serverListener.mockClear();
        hsres.success();
      });
      harn.transport.emit("connect", "some_tcid");
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update state appropriately", () => {
      const harn = harness();
      let newState;
      let cid;
      harn.makeServerStarted();

      harn.server.once("handshake", (hsreq, hsres) => {
        cid = hsreq.clientId;
        newState = harn.getServerState();
        hsres.success();
      });
      harn.transport.emit("connect", "some_tcid");
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      newState._handshakeStatus[cid] = "complete";
      delete newState._handshakeResponses[cid];
      delete newState._handshakeResponseStates[cid];
      // this._handshakeTimers was cleared on 'handshake' emission

      expect(harn.server).toHaveState(newState);
    });
    // Transport calls

    it("should operate appropriately on the transport", () => {
      const harn = harness();
      let cid;
      harn.makeServerStarted();

      harn.server.once("handshake", (hsreq, hsres) => {
        cid = hsreq.clientId;
        harn.transport.mockClear();
        hsres.success();
      });
      harn.transport.emit("connect", "some_tcid");
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "HandshakeResponse",
        Success: true,
        Version: "0.1",
        ClientId: cid
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._appActionSuccess() function - via actionResponse.success()", () => {
  describe("can return failure", () => {
    // N/A
  });

  describe("can return success", () => {
    // Events

    it("should emit events appropriately", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", (areq, ares) => {
        serverListener.mockClear();
        ares.success({ action: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update state appropriately - only action underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", (areq, ares) => {
        cid = areq.clientId;
        newState = harn.getServerState();
        ares.success({ action: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      delete newState._actionResponses[cid];
      delete newState._actionResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another action underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "OtherAction",
          ActionArgs: { act: "args" },
          CallbackId: "abc"
        })
      );

      harn.server.once("action", (areq, ares) => {
        cid = areq.clientId;
        newState = harn.getServerState();
        ares.success({ action: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      delete newState._actionResponses[cid]["123"];
      delete newState._actionResponseStates[cid]["123"];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should perform appropriate transport calls", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", (areq, ares) => {
        ares.success({ action: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ActionResponse",
        Success: true,
        CallbackId: "123",
        ActionData: { action: "data" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._appActionFailure() function - via actionResponse.failure()", () => {
  describe("can return failure", () => {
    // N/A
  });

  describe("can return success", () => {
    // Events

    it("should emit events appropriately", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", (areq, ares) => {
        serverListener.mockClear();
        ares.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update state appropriately - only action underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", (areq, ares) => {
        cid = areq.clientId;
        newState = harn.getServerState();
        ares.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      delete newState._actionResponses[cid];
      delete newState._actionResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another action underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "OtherAction",
          ActionArgs: { act: "args" },
          CallbackId: "abc"
        })
      );

      harn.server.once("action", (areq, ares) => {
        cid = areq.clientId;
        newState = harn.getServerState();
        ares.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      delete newState._actionResponses[cid]["123"];
      delete newState._actionResponseStates[cid]["123"];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should perform appropriate transport calls", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("action", (areq, ares) => {
        ares.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "SomeAction",
          ActionArgs: { act: "args" },
          CallbackId: "123"
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ActionResponse",
        Success: false,
        CallbackId: "123",
        ErrorCode: "SOME_ERROR",
        ErrorData: { error: "data" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._appFeedOpenSuccess() function - via feedOpenResponse.success()", () => {
  describe("can return failure", () => {
    // N/A
  });

  describe("can return success", () => {
    // Events

    it("should emit events appropriately", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", (foreq, fores) => {
        serverListener.mockClear();
        fores.success({ feed: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update state appropriately - only feed-open underway by any client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", (foreq, fores) => {
        cid = foreq.clientId;
        newState = harn.getServerState();
        fores.success({ feed: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      newState._clientFeedStates[cid][feedSerial] = "open";
      newState._feedClientStates[feedSerial][cid] = "open";
      delete newState._feedOpenResponses[cid];
      delete newState._feedOpenResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another feed-open underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "other_feed",
          FeedArgs: { feed: "args" }
        })
      );

      harn.server.once("feedOpen", (foreq, fores) => {
        cid = foreq.clientId;
        newState = harn.getServerState();
        fores.success({ feed: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      newState._clientFeedStates[cid][feedSerial] = "open";
      newState._feedClientStates[feedSerial][cid] = "open";
      delete newState._feedOpenResponses[cid][feedSerial];
      delete newState._feedOpenResponseStates[cid][feedSerial];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another feed-open underway by another client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeClient("other_tcid");

      harn.server.once("feedOpen", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "other_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      harn.server.once("feedOpen", (foreq, fores) => {
        cid = foreq.clientId;
        newState = harn.getServerState();
        fores.success({ feed: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      newState._clientFeedStates[cid][feedSerial] = "open";
      newState._feedClientStates[feedSerial][cid] = "open";
      delete newState._feedOpenResponses[cid];
      delete newState._feedOpenResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should perform appropriate transport calls", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", (foreq, fores) => {
        fores.success({ feed: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedOpenResponse",
        Success: true,
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedData: { feed: "data" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._appFeedOpenFailure() function - via feedOpenResponse.failure()", () => {
  describe("can return failure", () => {
    // N/A
  });

  describe("can return success", () => {
    // Events

    it("should emit events appropriately", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", (foreq, fores) => {
        serverListener.mockClear();
        fores.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update state appropriately - only feed-open underway by any client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", (foreq, fores) => {
        cid = foreq.clientId;
        newState = harn.getServerState();
        fores.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial];
      delete newState._feedOpenResponses[cid];
      delete newState._feedOpenResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another feed-open underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "other_feed",
          FeedArgs: { feed: "args" }
        })
      );

      harn.server.once("feedOpen", (foreq, fores) => {
        cid = foreq.clientId;
        newState = harn.getServerState();
        fores.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid][feedSerial];
      delete newState._feedClientStates[feedSerial];
      delete newState._feedOpenResponses[cid][feedSerial];
      delete newState._feedOpenResponseStates[cid][feedSerial];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another feed-open underway by another client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeClient("other_tcid");

      harn.server.once("feedOpen", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "other_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      harn.server.once("feedOpen", (foreq, fores) => {
        cid = foreq.clientId;
        newState = harn.getServerState();
        fores.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial][cid];
      delete newState._feedOpenResponses[cid];
      delete newState._feedOpenResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should perform appropriate transport calls", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.server.once("feedOpen", (foreq, fores) => {
        fores.failure("SOME_ERROR", { error: "data" });
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedOpenResponse",
        Success: false,
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        ErrorCode: "SOME_ERROR",
        ErrorData: { error: "data" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._appFeedCloseSuccess() function - via feedCloseResponse.success()", () => {
  describe("can return failure", () => {
    // N/A
  });

  describe("can return success", () => {
    // Events

    it("should emit events appropriately", () => {
      const harn = harness();
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );

      harn.server.once("feedClose", (fcreq, fcres) => {
        serverListener.mockClear();
        fcres.success();
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update state appropriately - only feed-close underway by any client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );

      harn.server.once("feedClose", (fcreq, fcres) => {
        cid = fcreq.clientId;
        newState = harn.getServerState();
        fcres.success();
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial];
      delete newState._feedCloseResponses[cid];
      delete newState._feedCloseResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another feed-close underway by this client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      harn.makeFeedOpen(
        "some_tcid",
        "other_feed",
        { feed: "args" },
        { feed: "data" }
      );

      harn.server.once("feedClose", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "other_feed",
          FeedArgs: { feed: "args" }
        })
      );

      harn.server.once("feedClose", (fcreq, fcres) => {
        cid = fcreq.clientId;
        newState = harn.getServerState();
        fcres.success();
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid][feedSerial];
      delete newState._feedClientStates[feedSerial];
      delete newState._feedCloseResponses[cid][feedSerial];
      delete newState._feedCloseResponseStates[cid][feedSerial];
      expect(harn.server).toHaveState(newState);
    });

    it("should update state appropriately - another feed-close underway by another client", () => {
      let newState;
      let cid;
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeClient("other_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      harn.makeFeedOpen(
        "other_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );

      harn.server.once("feedClose", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "other_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      harn.server.once("feedClose", (fcreq, fcres) => {
        cid = fcreq.clientId;
        newState = harn.getServerState();
        fcres.success();
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial][cid];
      delete newState._feedCloseResponses[cid];
      delete newState._feedCloseResponseStates[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should perform appropriate transport calls", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );

      harn.server.once("feedClose", (fcreq, fcres) => {
        fcres.success();
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedCloseResponse",
        Success: true,
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

// Testing: transport-triggered state modifiers

describe("The server._processStarting() function", () => {
  // Events

  it("should emit appropriate events", () => {
    const harn = harness();
    harn.server.start();
    const serverListener = harn.createServerListener();

    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");

    expect(serverListener.starting.mock.calls.length).toBe(1);
    expect(serverListener.starting.mock.calls[0].length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state appropriately", () => {
    const harn = harness();
    harn.server.start();

    const newState = harn.getServerState();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");

    newState._transportWrapperState = "starting";
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should act appropriately on the transport", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.mockClear();

    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  // Return value - N/A
});

describe("The server._processStart() function", () => {
  // Events

  it("should emit appropriate events", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");

    const serverListener = harn.createServerListener();
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(1);
    expect(serverListener.start.mock.calls[0].length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state appropriately", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");

    const newState = harn.getServerState();
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");

    newState._transportWrapperState = "started";
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should act appropriately on the transport", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");

    harn.transport.mockClear();
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  // Return value - N/A
});

describe("The server._processStopping() function", () => {
  // Events

  it("should emit stopping - no error argument", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.server.stop();
    harn.transport.state.mockReturnValue("stopping");
    const serverListener = harn.createServerListener();
    harn.transport.emit("stopping");

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(1);
    expect(serverListener.stopping.mock.calls[0].length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  it("should emit stopping - with error argument", () => {
    const harn = harness();
    harn.makeServerStarted();

    const serverListener = harn.createServerListener();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(1);
    expect(serverListener.stopping.mock.calls[0].length).toBe(1);
    expect(serverListener.stopping.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(serverListener.stopping.mock.calls[0][0].message).toBe(
      "FAILURE: ..."
    );
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state appropriately", () => {
    const harn = harness();
    harn.makeServerStarted();

    const newState = harn.getServerState();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));

    newState._transportWrapperState = "stopping";
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.server.stop();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.mockClear();
    harn.transport.emit("stopping");

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  // Return value - N/A
});

describe("The server._processStop() function", () => {
  // Events

  it("should emit stop - no error argument", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.server.stop();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping");
    harn.transport.state.mockReturnValue("stopped");
    const serverListener = harn.createServerListener();
    harn.transport.emit("stop");

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(1);
    expect(serverListener.stop.mock.calls[0].length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  it("should emit stop - with error argument", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));
    harn.transport.state.mockReturnValue("stopped");
    const serverListener = harn.createServerListener();
    harn.transport.emit("stop", new Error("FAILURE: ..."));

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(1);
    expect(serverListener.stop.mock.calls[0].length).toBe(1);
    expect(serverListener.stop.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(serverListener.stop.mock.calls[0][0].message).toBe("FAILURE: ...");
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state appropriately", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.server.stop();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping");
    const newState = harn.getServerState();
    harn.transport.state.mockReturnValue("stopped");
    harn.transport.emit("stop");

    newState._transportWrapperState = "stopped";
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.server.stop();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping");
    harn.transport.state.mockReturnValue("stopped");
    harn.transport.mockClear();
    harn.transport.emit("stop");

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  // Return value - N/A
});

describe("The server._processConnect() function", () => {
  // Events

  it("should emit connect", () => {
    const harn = harness();
    harn.makeServerStarted();

    const serverListener = harn.createServerListener();
    harn.transport.emit("connect", "some_tcid");

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(1);
    expect(serverListener.connect.mock.calls[0].length).toBe(1);
    expect(check.string(serverListener.connect.mock.calls[0][0])).toBe(true);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state - handshake timeout enabled", () => {
    const harn = harness({ handshakeMs: 999 });
    harn.makeServerStarted();

    const newState = harn.getServerState();
    harn.transport.emit("connect", "some_tcid");

    const cid = harn.server._clientIds.some_tcid;
    newState._clientIds.some_tcid = cid;
    newState._transportClientIds[cid] = "some_tcid";
    newState._handshakeStatus[cid] = "waiting";
    newState._handshakeTimers[cid] = 999;
    expect(harn.server).toHaveState(newState);
  });

  it("should update the state - handshake timeout disabled", () => {
    const harn = harness({ handshakeMs: 0 });
    harn.makeServerStarted();

    const newState = harn.getServerState();
    harn.transport.emit("connect", "some_tcid");

    const cid = harn.server._clientIds.some_tcid;
    newState._clientIds.some_tcid = cid;
    newState._transportClientIds[cid] = "some_tcid";
    newState._handshakeStatus[cid] = "waiting";
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.transport.mockClear();
    harn.transport.emit("connect", "some_tcid");

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks)

  describe("the handshake timeout", () => {
    it("if disabled, it should not call transport.disconnect()", () => {
      const harn = harness({ handshakeMs: 0 });
      harn.makeServerStarted();

      harn.transport.emit("connect", "some_tcid");

      harn.transport.mockClear();
      jest.runAllTimers();

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    it("if enabled and client disconnects (no fire), it should not call transport.disconnect()", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();

      harn.transport.emit("connect", "some_tcid");
      harn.transport.emit("disconnect", "some_tcid");

      harn.transport.mockClear();
      jest.runAllTimers();

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    it("if enabled and client submits a valid handshake (no fire), it should not call transport.disconnect()", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();

      harn.transport.emit("connect", "some_tcid");
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      harn.transport.mockClear();
      jest.runAllTimers();

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    it("if enabled and fires, it should emit nothing (done via transport)", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();

      harn.transport.mockClear();
      harn.transport.emit("connect", "some_tcid");

      const serverListener = harn.createServerListener();
      jest.runAllTimers();

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    it("if enabled and fires, should not update state (done via transport)", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();

      harn.transport.mockClear();
      harn.transport.emit("connect", "some_tcid");

      const newState = harn.getServerState();
      jest.runAllTimers();

      expect(harn.server).toHaveState(newState);
    });

    it("if enabled and fires, should call transport.disconnect()", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();

      harn.transport.mockClear();
      harn.transport.emit("connect", "some_tcid");

      jest.runAllTimers();

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(1);
      expect(harn.transport.disconnect.mock.calls[0].length).toBe(2);
      expect(harn.transport.disconnect.mock.calls[0][0]).toBe("some_tcid");
      expect(harn.transport.disconnect.mock.calls[0][1]).toBeInstanceOf(Error);
      expect(harn.transport.disconnect.mock.calls[0][1].message).toBe(
        "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
      );
    });
  });

  // Return value - N/A
});

describe("The server._processDisconnect() function", () => {
  // Events

  it("should emit disconnect - no error", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");

    harn.server.disconnect(cid);
    const serverListener = harn.createServerListener();
    harn.transport.emit("disconnect", "some_tcid");

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(1);
    expect(serverListener.disconnect.mock.calls[0].length).toBe(1);
    expect(serverListener.disconnect.mock.calls[0][0]).toBe(cid);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  it("should emit disconnect - with error", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");

    const serverListener = harn.createServerListener();
    harn.transport.emit("disconnect", "some_tcid", new Error("FAILURE: ..."));

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(1);
    expect(serverListener.disconnect.mock.calls[0].length).toBe(2);
    expect(serverListener.disconnect.mock.calls[0][0]).toBe(cid);
    expect(serverListener.disconnect.mock.calls[0][1]).toBeInstanceOf(Error);
    expect(serverListener.disconnect.mock.calls[0][1].message).toBe(
      "FAILURE: ..."
    );
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update state and neutralize appropriately - HandshakeResponse", () => {
    // Two clients, leaver and stayer, both with handshakes processing
    const harn = harness();
    harn.makeServerStarted();

    // Leaver
    harn.transport.emit("connect", "tcid_leaver");
    let leaverCid;
    let leaverHandshakeRes;
    harn.server.once("handshake", (hsreq, hsres) => {
      leaverCid = hsreq.clientId;
      leaverHandshakeRes = hsres;
      // Sit on it
    });
    harn.transport.emit(
      "message",
      "tcid_leaver",
      JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      })
    );

    // Stayer
    harn.transport.emit("connect", "tcid_stayer");
    let stayerHandshakeRes;
    harn.server.once("handshake", (hreq, hres) => {
      stayerHandshakeRes = hres;
      // Sit on it
    });
    harn.transport.emit(
      "message",
      "tcid_stayer",
      JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      })
    );

    // Mock _neutralize() functions
    leaverHandshakeRes._neutralize = jest.fn();
    stayerHandshakeRes._neutralize = jest.fn();

    // Emit
    const newState = harn.getServerState();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    // Check that neutralize functions are called/not
    expect(leaverHandshakeRes._neutralize.mock.calls.length).toBe(1);
    expect(leaverHandshakeRes._neutralize.mock.calls[0].length).toBe(0);
    expect(stayerHandshakeRes._neutralize.mock.calls.length).toBe(0);

    // Check state
    delete newState._clientIds.tcid_leaver;
    delete newState._transportClientIds[leaverCid];
    delete newState._handshakeTimers[leaverCid];
    delete newState._handshakeStatus[leaverCid];
    delete newState._handshakeResponses[leaverCid];
    delete newState._handshakeResponseStates[leaverCid];
    expect(harn.server).toHaveState(newState);
  });

  it("should update state and neutralize appropriately - ActionResponse", () => {
    // Two clients, leaver with two actions processing, stayer with one
    const harn = harness();
    harn.makeServerStarted();

    // Leaver
    const leaverCid = harn.makeClient("tcid_leaver");
    let leaverActionRes1;
    harn.server.once("action", (areq, ares) => {
      leaverActionRes1 = ares;
      // Sit on it
    });
    harn.transport.emit(
      "message",
      "tcid_leaver",
      JSON.stringify({
        MessageType: "Action",
        ActionName: "SomeAction",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      })
    );
    let leaverActionRes2;
    harn.server.once("action", (areq, ares) => {
      leaverActionRes2 = ares;
      // Sit on it
    });
    harn.transport.emit(
      "message",
      "tcid_leaver",
      JSON.stringify({
        MessageType: "Action",
        ActionName: "SomeAction",
        ActionArgs: { action: "args" },
        CallbackId: "456"
      })
    );

    // Stayer
    harn.makeClient("tcid_stayer");
    let stayerActionRes;
    harn.server.once("action", (areq, ares) => {
      stayerActionRes = ares;
      // Sit on it
    });
    harn.transport.emit(
      "message",
      "tcid_stayer",
      JSON.stringify({
        MessageType: "Action",
        ActionName: "SomeAction",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      })
    );

    // Mock _neutralize() functions
    leaverActionRes1._neutralize = jest.fn();
    leaverActionRes2._neutralize = jest.fn();
    stayerActionRes._neutralize = jest.fn();

    // Emit
    const newState = harn.getServerState();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    // Check that neutralize functions are called/not
    expect(leaverActionRes1._neutralize.mock.calls.length).toBe(1);
    expect(leaverActionRes1._neutralize.mock.calls[0].length).toBe(0);
    expect(leaverActionRes2._neutralize.mock.calls.length).toBe(1);
    expect(leaverActionRes2._neutralize.mock.calls[0].length).toBe(0);
    expect(stayerActionRes._neutralize.mock.calls.length).toBe(0);

    // Check state
    delete newState._clientIds.tcid_leaver;
    delete newState._transportClientIds[leaverCid];
    delete newState._handshakeStatus[leaverCid];
    delete newState._actionResponses[leaverCid];
    delete newState._actionResponseStates[leaverCid];
    expect(harn.server).toHaveState(newState);
  });

  it("should update state and neutralize appropriately - FeedOpenResponse", () => {
    // Two clients, leaver with two feeds opening, stayer with one
    const harn = harness();
    harn.makeServerStarted();

    // Leaver
    const leaverCid = harn.makeClient("tcid_leaver");
    const leaverFeedOpenRes1 = harn.makeFeedOpening(
      "tcid_leaver",
      "some_feed",
      { feed: "args" }
    );
    const leaverFeedOpenRes2 = harn.makeFeedOpening(
      "tcid_leaver",
      "other_feed",
      { feed: "args" }
    );

    // Stayer
    harn.makeClient("tcid_stayer");
    const stayerFeedOpenRes = harn.makeFeedOpening("tcid_stayer", "some_feed", {
      feed: "args"
    });

    // Mock _neutralize() functions
    leaverFeedOpenRes1._neutralize = jest.fn();
    leaverFeedOpenRes2._neutralize = jest.fn();
    stayerFeedOpenRes._neutralize = jest.fn();

    // Emit
    const newState = harn.getServerState();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    // Check that neutralize functions are called/not
    expect(leaverFeedOpenRes1._neutralize.mock.calls.length).toBe(1);
    expect(leaverFeedOpenRes1._neutralize.mock.calls[0].length).toBe(0);
    expect(leaverFeedOpenRes2._neutralize.mock.calls.length).toBe(1);
    expect(leaverFeedOpenRes2._neutralize.mock.calls[0].length).toBe(0);
    expect(stayerFeedOpenRes._neutralize.mock.calls.length).toBe(0);

    // Check state
    delete newState._clientIds.tcid_leaver;
    delete newState._transportClientIds[leaverCid];
    delete newState._handshakeStatus[leaverCid];
    delete newState._clientFeedStates[leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("some_feed", { feed: "args" })
    ][leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("other_feed", { feed: "args" })
    ];
    delete newState._feedOpenResponses[leaverCid];
    delete newState._feedOpenResponseStates[leaverCid];
    expect(harn.server).toHaveState(newState);
  });

  it("should update state and neutralize appropriately - FeedCloseResponse", () => {
    // Two clients, leaver with two feeds closing, stayer with one
    const harn = harness();
    harn.makeServerStarted();

    // Leaver
    const leaverCid = harn.makeClient("tcid_leaver");
    const leaverFeedCloseRes1 = harn.makeFeedClosing(
      "tcid_leaver",
      "some_feed",
      { feed: "args" }
    );
    const leaverFeedCloseRes2 = harn.makeFeedClosing(
      "tcid_leaver",
      "other_feed",
      { feed: "args" }
    );

    // Stayer
    harn.makeClient("tcid_stayer");
    const stayerFeedCloseRes = harn.makeFeedClosing(
      "tcid_stayer",
      "some_feed",
      {
        feed: "args"
      }
    );

    // Mock _neutralize() functions
    leaverFeedCloseRes1._neutralize = jest.fn();
    leaverFeedCloseRes2._neutralize = jest.fn();
    stayerFeedCloseRes._neutralize = jest.fn();

    // Emit
    const newState = harn.getServerState();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    // Check that neutralize functions are called/not
    expect(leaverFeedCloseRes1._neutralize.mock.calls.length).toBe(1);
    expect(leaverFeedCloseRes1._neutralize.mock.calls[0].length).toBe(0);
    expect(leaverFeedCloseRes2._neutralize.mock.calls.length).toBe(1);
    expect(leaverFeedCloseRes2._neutralize.mock.calls[0].length).toBe(0);
    expect(stayerFeedCloseRes._neutralize.mock.calls.length).toBe(0);

    // Check state
    delete newState._clientIds.tcid_leaver;
    delete newState._transportClientIds[leaverCid];
    delete newState._handshakeStatus[leaverCid];
    delete newState._clientFeedStates[leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("some_feed", { feed: "args" })
    ][leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("other_feed", { feed: "args" })
    ];
    delete newState._feedCloseResponses[leaverCid];
    delete newState._feedCloseResponseStates[leaverCid];
    expect(harn.server).toHaveState(newState);
  });

  it("should update state appropriately - feeds open", () => {
    // Two client, leaver with two feeds open, stayer with one
    const harn = harness();
    harn.makeServerStarted();

    // Leaver
    const leaverCid = harn.makeClient("tcid_leaver");
    harn.makeFeedOpen(
      "tcid_leaver",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );
    harn.makeFeedOpen(
      "tcid_leaver",
      "other_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Stayer
    harn.makeClient("tcid_stayer");
    harn.makeFeedOpen(
      "tcid_stayer",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Emit
    const newState = harn.getServerState();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    // Check state
    delete newState._clientIds.tcid_leaver;
    delete newState._transportClientIds[leaverCid];
    delete newState._handshakeStatus[leaverCid];
    delete newState._clientFeedStates[leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("some_feed", { feed: "args" })
    ][leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("other_feed", { feed: "args" })
    ];
    expect(harn.server).toHaveState(newState);
  });

  it("should update state appropriately - feeds terminated", () => {
    // Two client, leaver with two feeds open, stayer with one
    const harn = harness();
    harn.makeServerStarted();

    // Leaver
    const leaverCid = harn.makeClient("tcid_leaver");
    harn.makeFeedTerminated("tcid_leaver", "some_feed", { feed: "args" });
    harn.makeFeedTerminated("tcid_leaver", "other_feed", { feed: "args" });

    // Stayer
    harn.makeClient("tcid_stayer");
    harn.makeFeedTerminated("tcid_stayer", "some_feed", { feed: "args" });

    // Emit
    const newState = harn.getServerState();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    // Check state
    delete newState._clientIds.tcid_leaver;
    delete newState._transportClientIds[leaverCid];
    delete newState._handshakeStatus[leaverCid];
    delete newState._clientFeedStates[leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("some_feed", { feed: "args" })
    ][leaverCid];
    delete newState._feedClientStates[
      feedSerializer.serialize("other_feed", { feed: "args" })
    ];
    delete newState._terminationTimers[leaverCid];
    expect(harn.server).toHaveState(newState);
  });

  it("should clear handshake timeouts appropriately - check on transport", () => {
    // Two clients, both awaiting Handshake messages
    const harn = harness({ handshakeMs: 1 });
    harn.makeServerStarted();

    harn.transport.emit("connect", "tcid_leaver");
    harn.transport.emit("connect", "tcid_stayer");

    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    harn.transport.mockClear();

    jest.runAllTimers();

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(1);
    expect(harn.transport.disconnect.mock.calls[0].length).toBe(2);
    expect(harn.transport.disconnect.mock.calls[0][0]).toBe("tcid_stayer");
    expect(harn.transport.disconnect.mock.calls[0][1]).toBeInstanceOf(Error);
    expect(harn.transport.disconnect.mock.calls[0][1].message).toBe(
      "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
    );
  });

  it("should clear termination timeouts appropriately - check state", () => {
    // There's no way to check that the timer doesn't run
    // When you disconnect, the leaver's state goes empty, and the
    // termination timer would just re-empty it (i.e. no effects)
    // Would need to create a named function for the timeout
    // But verified it doesn't run using console.log
  });

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.transport.emit("connect", "tcid_leaver");
    harn.transport.emit("connect", "tcid_stayer");

    harn.transport.mockClear();
    harn.transport.emit("disconnect", "tcid_leaver", new Error("FAILURE: ..."));

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  // Return value - N/A
});

describe("The server._processMessage() function", () => {
  describe("it may receive an invalid message", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();

      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", '"bad message"');

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "INVALID_MESSAGE: Invalid JSON or schema violation."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].parseError
      ).toBeInstanceOf(Error);
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe('"bad message"');
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();

      harn.transport.emit("connect", "some_tcid");

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", '"bad message"');

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();

      harn.transport.emit("connect", "some_tcid");

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", '"bad message"');

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Invalid JSON or schema violation.",
          Message: '"bad message"'
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an invalid Handshake message", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "INVALID_MESSAGE: Invalid JSON or schema violation."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].parseError
      ).toBeInstanceOf(Error);
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Invalid JSON or schema violation.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an invalid Action message", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "INVALID_MESSAGE: Invalid JSON or schema violation."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].parseError
      ).toBeInstanceOf(Error);
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Invalid JSON or schema violation.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an invalid FeedOpen message", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "INVALID_MESSAGE: Invalid JSON or schema violation."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].parseError
      ).toBeInstanceOf(Error);
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Invalid JSON or schema violation.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an invalid FeedClose message", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "INVALID_MESSAGE: Invalid JSON or schema violation."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].parseError
      ).toBeInstanceOf(Error);
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Invalid JSON or schema violation.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid Handshake message", () => {
    // Events

    it("should emit nothing directly", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processHandshake = () => {}; // No further processing
      harn.transport.emit("connect", "some_tcid");

      const serverListener = harn.createServerListener();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
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
      harn.server._processHandshake = () => {}; // No further processing
      harn.transport.emit("connect", "some_tcid");

      const newState = harn.getServerState();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processHandshake = () => {}; // No further processing
      harn.transport.emit("connect", "some_tcid");

      harn.transport.mockClear();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Function calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processHandshake = jest.fn();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = {
        MessageType: "Handshake",
        Versions: ["0.1"]
      };

      harn.transport.emit("message", "some_tcid", JSON.stringify(msg));

      expect(harn.server._processHandshake.mock.calls.length).toBe(1);
      expect(harn.server._processHandshake.mock.calls[0].length).toBe(3);
      expect(harn.server._processHandshake.mock.calls[0][0]).toBe(cid);
      expect(harn.server._processHandshake.mock.calls[0][1]).toEqual(msg);
      expect(harn.server._processHandshake.mock.calls[0][2]).toEqual(
        JSON.stringify(msg)
      );
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid Action message", () => {
    // Events

    it("should emit nothing directly", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processAction = () => {}; // No further processing
      harn.makeClient("some_tcid");

      const serverListener = harn.createServerListener();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
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
      harn.server._processAction = () => {}; // No further processing
      harn.makeClient("some_tcid");

      const newState = harn.getServerState();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
        })
      );

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processAction = () => {}; // No further processing
      harn.makeClient("some_tcid");

      harn.transport.mockClear();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Function calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processAction = jest.fn();
      const cid = harn.makeClient("some_tcid");
      const msg = {
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      };

      harn.transport.emit("message", "some_tcid", JSON.stringify(msg));

      expect(harn.server._processAction.mock.calls.length).toBe(1);
      expect(harn.server._processAction.mock.calls[0].length).toBe(3);
      expect(harn.server._processAction.mock.calls[0][0]).toBe(cid);
      expect(harn.server._processAction.mock.calls[0][1]).toEqual(msg);
      expect(harn.server._processAction.mock.calls[0][2]).toEqual(
        JSON.stringify(msg)
      );
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid FeedOpen message", () => {
    // Events

    it("should emit nothing directly", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processFeedOpen = () => {}; // No further processing
      harn.makeClient("some_tcid");

      const serverListener = harn.createServerListener();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
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
      harn.server._processFeedOpen = () => {}; // No further processing
      harn.makeClient("some_tcid");

      const newState = harn.getServerState();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processFeedOpen = () => {}; // No further processing
      harn.makeClient("some_tcid");

      harn.transport.mockClear();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Function calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processFeedOpen = jest.fn();
      const cid = harn.makeClient("some_tcid");
      const msg = {
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      };

      harn.transport.emit("message", "some_tcid", JSON.stringify(msg));

      expect(harn.server._processFeedOpen.mock.calls.length).toBe(1);
      expect(harn.server._processFeedOpen.mock.calls[0].length).toBe(3);
      expect(harn.server._processFeedOpen.mock.calls[0][0]).toBe(cid);
      expect(harn.server._processFeedOpen.mock.calls[0][1]).toEqual(msg);
      expect(harn.server._processFeedOpen.mock.calls[0][2]).toEqual(
        JSON.stringify(msg)
      );
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid FeedClose message", () => {
    // Events

    it("should emit nothing directly", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processFeedClose = () => {}; // No further processing
      harn.makeClient("some_tcid");

      const serverListener = harn.createServerListener();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
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
      harn.server._processFeedClose = () => {}; // No further processing
      harn.makeClient("some_tcid");

      const newState = harn.getServerState();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processFeedClose = () => {}; // No further processing
      harn.makeClient("some_tcid");

      harn.transport.mockClear();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Function calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server._processFeedClose = jest.fn();
      const cid = harn.makeClient("some_tcid");
      const msg = {
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      };

      harn.transport.emit("message", "some_tcid", JSON.stringify(msg));

      expect(harn.server._processFeedClose.mock.calls.length).toBe(1);
      expect(harn.server._processFeedClose.mock.calls[0].length).toBe(3);
      expect(harn.server._processFeedClose.mock.calls[0][0]).toBe(cid);
      expect(harn.server._processFeedClose.mock.calls[0][1]).toEqual(msg);
      expect(harn.server._processFeedClose.mock.calls[0][2]).toEqual(
        JSON.stringify(msg)
      );
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._processHandshake() function", () => {
  describe("it may receive an unexpected message - handshake processing", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server.once("handshake", () => {
        // Sit on it - processing
      });
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      harn.transport.emit("message", "some_tcid", msg);

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: Unexpected Handshake message."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.server.once("handshake", () => {
        // Sit on it - processing
      });
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      harn.transport.emit("message", "some_tcid", msg);

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse message", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.server.once("handshake", () => {
        // Sit on it - processing
      });
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      harn.transport.emit("message", "some_tcid", msg);

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected Handshake message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - handshake complete", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: Unexpected Handshake message."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should sent a ViolationResponse message", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected Handshake message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with no compatible version", () => {
    // Events

    it("should emit nothing", () => {
      const harn = harness();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["X.X"]
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
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
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["X.X"]
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should sent a HandshakeResponse message indicating failure", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["X.X"]
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "HandshakeResponse",
        Success: false
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a version-compatible message - no handshake timeout, no handshake listener", () => {
    // Events

    it("should emit nothing", () => {
      // Can't create a serverListener, since that registers a handshake event listener
      expect(1).toBe(1);
    });

    // State

    it("should update handshake status", () => {
      const harn = harness({ handshakeMs: 0 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      newState._handshakeStatus[cid] = "complete";
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit HandshakeResponse indicating success", () => {
      const harn = harness({ handshakeMs: 0 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "HandshakeResponse",
        Success: true,
        Version: "0.1",
        ClientId: cid
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a version-compatible message - no handshake timeout, with handshake listener", () => {
    // Events

    it("should emit a handshake event", () => {
      const harn = harness({ handshakeMs: 0 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(1);
      expect(serverListener.handshake.mock.calls[0].length).toBe(2);
      expect(serverListener.handshake.mock.calls[0][0]).toBeInstanceOf(Object);
      expect(serverListener.handshake.mock.calls[0][0].clientId).toBe(cid);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the handshake state", () => {
      const harn = harness({ handshakeMs: 0 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      let handshakeRequest;
      let handshakeResponse;
      harn.server.on("handshake", (hreq, hres) => {
        handshakeRequest = hreq;
        handshakeResponse = hres;
        // Sit on it
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      newState._handshakeStatus[cid] = "processing";
      newState._handshakeResponses[cid] = handshakeResponse;
      newState._handshakeResponseStates[cid] = {
        _server: harn.server,
        _handshakeRequest: handshakeRequest,
        _appResponded: false,
        _neutralized: false
      };
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness({ handshakeMs: 0 });
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      harn.server.on("handshake", () => {
        // Sit on it
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a version-compatible message - with handshake timeout, no handshake listener", () => {
    // Events

    it("should emit nothing", () => {
      // Can't create a serverListener, since that registers a handshake event listener
      expect(1).toBe(1);
    });

    // State

    it("should update handshake status", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      newState._handshakeStatus[cid] = "complete";
      delete newState._handshakeTimers[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit HandshakeResponse indicating success", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "HandshakeResponse",
        Success: true,
        Version: "0.1",
        ClientId: cid
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    it("should clear the handshake timeout", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      harn.transport.emit("message", "some_tcid", msg);
      harn.transport.mockClear();
      jest.runAllTimers();

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Return value - N/A
  });

  describe("it may receive a version-compatible message - with handshake timeout, with handshake listener", () => {
    // Events

    it("should emit a handshake event", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(1);
      expect(serverListener.handshake.mock.calls[0].length).toBe(2);
      expect(serverListener.handshake.mock.calls[0][0]).toBeInstanceOf(Object);
      expect(serverListener.handshake.mock.calls[0][0].clientId).toBe(cid);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the handshake state", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      let handshakeRequest;
      let handshakeResponse;
      harn.server.on("handshake", (hreq, hres) => {
        handshakeRequest = hreq;
        handshakeResponse = hres;
        // Sit on it
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      newState._handshakeStatus[cid] = "processing";
      delete newState._handshakeTimers[cid];
      newState._handshakeResponses[cid] = handshakeResponse;
      newState._handshakeResponseStates[cid] = {
        _server: harn.server,
        _handshakeRequest: handshakeRequest,
        _appResponded: false,
        _neutralized: false
      };
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      harn.server.on("handshake", () => {
        // Sit on it
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    it("should clear the handshake timeout", () => {
      const harn = harness({ handshakeMs: 1 });
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Handshake",
        Versions: ["0.1"]
      });
      harn.server.on("handshake", () => {
        // Sit on it
      });

      harn.transport.emit("message", "some_tcid", msg);
      harn.transport.mockClear();
      jest.runAllTimers();

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Return value - N/A
  });
});

describe("The server._processAction() function", () => {
  describe("it may receive an unexpected message - handshake waiting", () => {
    // Events

    it("should emit a badClientMessage event", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: Action message received before successful Handshake."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit a ViolationResponse indicating failure", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - handshake processing", () => {
    // Events

    it("should emit a badClientMessage event", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      let cid;
      harn.server.on("handshake", hreq => {
        cid = hreq.clientId;
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: Action message received before successful Handshake."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      harn.server.on("handshake", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit a ViolationResponse indicating error", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      harn.server.on("handshake", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - callback id in use", () => {
    // Events

    it("should emit a badClientMessage event", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });
      harn.server.on("action", () => {
        // Sit on it
      });
      harn.transport.emit("message", "some_tcid", msg);

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: Action message reused an outstanding CallbackId."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });
      harn.server.on("action", () => {
        // Sit on it
      });
      harn.transport.emit("message", "some_tcid", msg);

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should send a ViolationResponse message", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });
      harn.server.on("action", () => {
        // Sit on it
      });
      harn.transport.emit("message", "some_tcid", msg);

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Action message reused an outstanding CallbackId.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with no action event listener", () => {
    // Events

    it("should emit nothing", () => {
      // Can't check, since subscribing a listener changes the behavior
      expect(1).toBe(1);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ActionResponse indicating failure", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ActionResponse",
        Success: false,
        CallbackId: "123",
        ErrorCode: "INTERNAL_ERROR",
        ErrorData: {}
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with an action event listener", () => {
    // Events

    it("should emit an action event", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "123"
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(1);
      expect(serverListener.action.mock.calls[0].length).toBe(2);
      expect(serverListener.action.mock.calls[0][0]).toBeInstanceOf(Object);
      expect(serverListener.action.mock.calls[0][0].clientId).toBe(cid);
      expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
      expect(serverListener.action.mock.calls[0][1].success).toBeInstanceOf(
        Function
      );
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "abc"
      });
      let actionRequest;
      let actionResponse;
      harn.server.on("action", (areq, ares) => {
        actionRequest = areq;
        actionResponse = ares;
        // Sit on it
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      newState._actionResponses[cid] = {
        abc: actionResponse
      };
      newState._actionResponseStates[cid] = {
        abc: {
          _server: harn.server,
          _actionRequest: actionRequest,
          _appResponded: false,
          _neutralized: false
        }
      };
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "Action",
        ActionName: "some_action",
        ActionArgs: { action: "args" },
        CallbackId: "abc"
      });
      harn.server.on("action", () => {
        // Sit on it
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });
});

describe("The server._processFeedOpen() function", () => {
  describe("it may receive an unexpected message - handshake waiting", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedOpen message received before successful Handshake."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit a ViolationResponse indicating failure", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - handshake processing", () => {
    // Events

    it("should emit a badClientMessage event", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      let cid;
      harn.server.on("handshake", hreq => {
        cid = hreq.clientId;
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedOpen message received before successful Handshake."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      harn.server.on("handshake", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit a ViolationResponse indicating error", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      harn.server.on("handshake", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - feed opening", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedOpen message referenced a feed that was not closed or terminated."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ViolationResponse", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedOpen message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - feed open", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedOpen message referenced a feed that was not closed or terminated."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ViolationResponse", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedOpen message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - feed closing", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedOpen message referenced a feed that was not closed or terminated."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ViolationResponse", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedOpen message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with no feedOpen event listener - closed", () => {
    // Events

    it("should emit nothing", () => {
      // Can't test, since attaching a listener changes the behavior
      expect(1).toBe(1);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit FeedOpenResponse indicating internal error", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedOpenResponse",
        Success: false,
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        ErrorCode: "INTERNAL_ERROR",
        ErrorData: {}
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with no feedOpen event listener - terminated", () => {
    // Events

    it("should emit nothing", () => {
      // Can't test, since attaching a listener changes the behavior
      expect(1).toBe(1);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial];
      delete newState._terminationTimers[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit FeedOpenResponse indicating internal error", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedOpenResponse",
        Success: false,
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        ErrorCode: "INTERNAL_ERROR",
        ErrorData: {}
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    it("should clear the termination timeout", () => {
      // There's no way to check whether the termination timer is cleared or
      // not, because if it wasn't cleared there would be no impact on the
      // state and it would not emit or perform any actions on the transport
      // Verified using console.log
    });

    // Return value - N/A
  });

  describe("it may receive a valid message with a feedOpen event listener - closed", () => {
    // Events

    it("should emit feedOpen", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(1);
      expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
      expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(Object);
      expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
      expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(Object);
      expect(serverListener.feedOpen.mock.calls[0][1].success).toBeInstanceOf(
        Function
      );
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      let feedOpenRequest;
      let feedOpenResponse;
      harn.server.on("feedOpen", (foreq, fores) => {
        feedOpenRequest = foreq;
        feedOpenResponse = fores;
        // Sit on it
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      newState._clientFeedStates = {
        [cid]: {
          [feedSerial]: "opening"
        }
      };
      newState._feedClientStates = {
        [feedSerial]: {
          [cid]: "opening"
        }
      };
      newState._feedOpenResponses = {
        [cid]: {
          [feedSerial]: feedOpenResponse
        }
      };
      newState._feedOpenResponseStates = {
        [cid]: {
          [feedSerial]: {
            _server: harn.server,
            _feedOpenRequest: feedOpenRequest,
            _appResponded: false,
            _neutralized: false
          }
        }
      };
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      harn.server.on("feedOpen", () => {
        // Sit on it
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with a feedOpen event listener - terminated", () => {
    // Events

    it("should emit feedOpen", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(1);
      expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
      expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(Object);
      expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
      expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(Object);
      expect(serverListener.feedOpen.mock.calls[0][1].success).toBeInstanceOf(
        Function
      );
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      let feedOpenRequest;
      let feedOpenResponse;
      harn.server.on("feedOpen", (foreq, fores) => {
        feedOpenRequest = foreq;
        feedOpenResponse = fores;
        // Sit on it
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      newState._clientFeedStates = {
        [cid]: {
          [feedSerial]: "opening"
        }
      };
      newState._feedClientStates = {
        [feedSerial]: {
          [cid]: "opening"
        }
      };
      newState._feedOpenResponses = {
        [cid]: {
          [feedSerial]: feedOpenResponse
        }
      };
      newState._feedOpenResponseStates = {
        [cid]: {
          [feedSerial]: {
            _server: harn.server,
            _feedOpenRequest: feedOpenRequest,
            _appResponded: false,
            _neutralized: false
          }
        }
      };
      delete newState._terminationTimers[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedOpen",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      harn.server.on("feedOpen", () => {
        // Sit on it
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    it("should clear the termination timeout", () => {
      // There's no way to check whether the termination timer is cleared or
      // not, because if it wasn't cleared there would be no impact on the
      // state and it would not emit or perform any actions on the transport
      // Verified using console.log
    });

    // Return value - N/A
  });
});

describe("The server._processFeedClose() function", () => {
  describe("it may receive an unexpected message - handshake waiting", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const cid = harn.server._clientIds.some_tcid;
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedClose message received before successful Handshake."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit a ViolationResponse indicating failure", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - handshake processing", () => {
    // Events

    it("should emit a badClientMessage event", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      let cid;
      harn.server.on("handshake", hreq => {
        cid = hreq.clientId;
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedClose message received before successful Handshake."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      harn.server.on("handshake", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit a ViolationResponse indicating error", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");
      harn.server.on("handshake", () => {
        // Sit on it
      });
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Handshake required.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - feed closed", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedClose message referenced a feed that was not open or terminated."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ViolationResponse", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedClose message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - feed opening", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedClose message referenced a feed that was not open or terminated."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ViolationResponse", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedClose message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive an unexpected message - feed closing", () => {
    // Events

    it("should emit badClientMessage", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1);
      expect(serverListener.badClientMessage.mock.calls[0].length).toBe(2);
      expect(serverListener.badClientMessage.mock.calls[0][0]).toBe(cid);
      expect(serverListener.badClientMessage.mock.calls[0][1]).toBeInstanceOf(
        Error
      );
      expect(serverListener.badClientMessage.mock.calls[0][1].message).toBe(
        "UNEXPECTED_MESSAGE: FeedClose message referenced a feed that was not open or terminated."
      );
      expect(
        serverListener.badClientMessage.mock.calls[0][1].clientMessage
      ).toBe(msg);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit ViolationResponse", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Problem: "Unexpected FeedClose message.",
          Message: msg
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with no feedClose listener - open", () => {
    // Events

    it("should emit nothing", () => {
      // Can't test, since creating a listener changes the behavior
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit FeedCloseResponse indicating success", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedCloseResponse",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with no feedClose listener - terminated", () => {
    // Events

    it("should emit nothing", () => {
      // Can't test, since creating a listener changes the behavior
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial];
      delete newState._terminationTimers[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit FeedCloseResponse indicating success", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedCloseResponse",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    it("should clear the termination timeout", () => {
      // There's no way to check whether the termination timer is cleared or
      // not, because if it wasn't cleared there would be no impact on the
      // state and it would not emit or perform any actions on the transport
      // Verified using console.log
    });

    // Return value - N/A
  });

  describe("it may receive a valid message with a feedClose listener - open", () => {
    // Events

    it("should emit feedClose event", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(1);
      expect(serverListener.feedClose.mock.calls[0].length).toBe(2);
      expect(serverListener.feedClose.mock.calls[0][0]).toBeInstanceOf(Object);
      expect(serverListener.feedClose.mock.calls[0][0].clientId).toBe(cid);
      expect(serverListener.feedClose.mock.calls[0][1]).toBeInstanceOf(Object);
      expect(serverListener.feedClose.mock.calls[0][1].success).toBeInstanceOf(
        Function
      );
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      let feedCloseRequest;
      let feedCloseResponse;
      harn.server.on("feedClose", (fcreq, fcres) => {
        feedCloseRequest = fcreq;
        feedCloseResponse = fcres;
        // Sit on it
      });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      newState._clientFeedStates[cid][feedSerial] = "closing";
      newState._feedClientStates[feedSerial][cid] = "closing";
      newState._feedCloseResponses[cid] = {
        [feedSerial]: feedCloseResponse
      };
      newState._feedCloseResponseStates[cid] = {
        [feedSerial]: {
          _server: harn.server,
          _feedCloseRequest: feedCloseRequest,
          _appResponded: false,
          _neutralized: false
        }
      };
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should do nothing on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedOpen(
        "some_tcid",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );
      harn.server.on("feedClose", () => {
        // Sit on it
      });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value - N/A
  });

  describe("it may receive a valid message with a feedClose listener - terminated", () => {
    // Events

    it("should emit nothing", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const serverListener = harn.createServerListener();
      harn.transport.emit("message", "some_tcid", msg);

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should update the state", () => {
      const harn = harness();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      harn.server.on("feedClose", () => {
        // Sit on it
      });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      const newState = harn.getServerState();
      harn.transport.emit("message", "some_tcid", msg);

      const feedSerial = feedSerializer.serialize("some_feed", {
        feed: "args"
      });
      delete newState._clientFeedStates[cid];
      delete newState._feedClientStates[feedSerial];
      delete newState._terminationTimers[cid];
      expect(harn.server).toHaveState(newState);
    });

    // Transport calls

    it("should transmit FeedCloseResponse immediately on the transport", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
      harn.server.on("feedClose", () => {
        // Sit on it
      });
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });

      harn.transport.mockClear();
      harn.transport.emit("message", "some_tcid", msg);

      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "FeedCloseResponse",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    it("should clear the termination timeout", () => {
      // There's no way to check whether the termination timer is cleared or
      // not, because if it wasn't cleared there would be no impact on the
      // state and it would not emit or perform any actions on the transport
      // Verified using console.log
    });

    // Return value - N/A
  });
});

// Testing: internal state modifiers

describe("The server._terminateOpeningFeed() function", () => {
  // Events

  it("should emit nothing", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

    const serverListener = harn.createServerListener();
    harn.server._terminateOpeningFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

    const newState = harn.getServerState();
    harn.server._terminateOpeningFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    const feedSerial = feedSerializer.serialize("some_feed", { feed: "args" });
    delete newState._clientFeedStates[cid];
    delete newState._feedClientStates[feedSerial];
    delete newState._feedOpenResponses[cid];
    delete newState._feedOpenResponseStates[cid];
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should transmit a FeedOpenResponse message indicating failure", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

    harn.transport.mockClear();
    harn.server._terminateOpeningFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "FeedOpenResponse",
      Success: false,
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  // Return value - N/A
});

describe("The server._terminateOpenFeed() function", () => {
  // Events

  it("should emit nothing", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpen(
      "some_tcid",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    const serverListener = harn.createServerListener();
    harn.server._terminateOpenFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    expect(serverListener.starting.mock.calls.length).toBe(0);
    expect(serverListener.start.mock.calls.length).toBe(0);
    expect(serverListener.stopping.mock.calls.length).toBe(0);
    expect(serverListener.stop.mock.calls.length).toBe(0);
    expect(serverListener.connect.mock.calls.length).toBe(0);
    expect(serverListener.handshake.mock.calls.length).toBe(0);
    expect(serverListener.action.mock.calls.length).toBe(0);
    expect(serverListener.feedOpen.mock.calls.length).toBe(0);
    expect(serverListener.feedClose.mock.calls.length).toBe(0);
    expect(serverListener.disconnect.mock.calls.length).toBe(0);
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);
  });

  // State

  it("should update the state - no termination timer", () => {
    const harn = harness({ terminationMs: 0 });
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpen(
      "some_tcid",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    const newState = harn.getServerState();
    harn.server._terminateOpenFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    const feedSerial = feedSerializer.serialize("some_feed", { feed: "args" });
    newState._clientFeedStates[cid][feedSerial] = "terminated";
    newState._feedClientStates[feedSerial][cid] = "terminated";
    expect(harn.server).toHaveState(newState);
  });

  it("should update the state - with termination timer", () => {
    const harn = harness({ terminationMs: 1 });
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpen(
      "some_tcid",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    const newState = harn.getServerState();
    harn.server._terminateOpenFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    const feedSerial = feedSerializer.serialize("some_feed", { feed: "args" });
    newState._clientFeedStates[cid][feedSerial] = "terminated";
    newState._feedClientStates[feedSerial][cid] = "terminated";
    newState._terminationTimers[cid] = {
      [feedSerial]: 123
    };
    expect(harn.server).toHaveState(newState);
  });

  // Transport calls

  it("should transmit a FeedTermination message", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpen(
      "some_tcid",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    harn.transport.mockClear();
    harn.server._terminateOpenFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "FeedTermination",
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  // Outbound callbacks - N/A

  // Inbound callbacks (events, state, transport, outer callbacks) - N/A

  it("should update state when termination timer fires (if configured", () => {
    const harn = harness({ terminationMs: 1 });
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    harn.makeFeedOpen(
      "some_tcid",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    harn.server._terminateOpenFeed(
      cid,
      "some_feed",
      { feed: "args" },
      "SOME_ERROR",
      { error: "data" }
    );

    const newState = harn.getServerState();
    jest.runAllTimers();

    const feedSerial = feedSerializer.serialize("some_feed", { feed: "args" });
    delete newState._clientFeedStates[cid];
    delete newState._feedClientStates[feedSerial];
    delete newState._terminationTimers[cid];
    expect(harn.server).toHaveState(newState);
  });

  // Return value - N/A
});

describe("The server._set() function", () => {
  it("should work as expected", () => {
    const harn = harness();

    let obj = {};
    harn.server._set(obj, "key1", "key2", "value");
    expect(obj).toEqual({
      key1: {
        key2: "value"
      }
    });

    obj = { key1: {} };
    harn.server._set(obj, "key1", "key2", "value");
    expect(obj).toEqual({
      key1: {
        key2: "value"
      }
    });

    obj = { key1: { key2: "old_value" } };
    harn.server._set(obj, "key1", "key2", "value");
    expect(obj).toEqual({
      key1: {
        key2: "value"
      }
    });

    obj = { key1: { key2: "value2" } };
    harn.server._set(obj, "key1", "key3", "value3");
    expect(obj).toEqual({
      key1: {
        key2: "value2",
        key3: "value3"
      }
    });

    obj = { key1: { key2: "value2" } };
    harn.server._set(obj, "key3", "key4", "value4");
    expect(obj).toEqual({
      key1: {
        key2: "value2"
      },
      key3: {
        key4: "value4"
      }
    });
  });
});

describe("The server._delete() function", () => {
  it("should work as expected", () => {
    const harn = harness();

    let obj = { key1: { key2: "value2" } };
    harn.server._delete(obj, "key1", "key2");
    expect(obj).toEqual({});

    obj = { key1: { key2: "value2", key3: "value3" } };
    harn.server._delete(obj, "key1", "key2");
    expect(obj).toEqual({ key1: { key3: "value3" } });

    obj = { key1: { key2: "value2" }, key3: "value3" };
    harn.server._delete(obj, "key1", "key2");
    expect(obj).toEqual({ key3: "value3" });

    obj = {
      key1: { key2: "value2", key3: "value3" },
      key4: { key5: "value5" }
    };
    harn.server._delete(obj, "key1", "key2");
    expect(obj).toEqual({ key1: { key3: "value3" }, key4: { key5: "value5" } });
  });
});

// Testing: app-triggered state-getting functionality

describe("The server.state() function", () => {
  it("should return the state indicated by the transport", () => {
    const harn = harness();
    harn.makeServerStarted();
    harn.server.stop();
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping");
    expect(harn.server.state()).toBe("stopping");
  });
});

// Testing: internal state-getting functionality

describe("The server._get() function", () => {
  it("should work as expected", () => {
    const harn = harness();

    let obj = {};
    expect(harn.server._get(obj, "key1", "key1", "missing")).toBe("missing");

    obj = { key1: {} };
    expect(harn.server._get(obj, "key1", "key2", "missing")).toBe("missing");

    obj = { key1: { key2: "present" } };
    expect(harn.server._get(obj, "key1", "key2", "missing")).toBe("present");

    obj = { key1: { key2: "present" } };
    expect(harn.server._get(obj, "key1", "key3", "missing")).toBe("missing");

    obj = { key1: { key2: "present" } };
    expect(harn.server._get(obj, "key3", "key2", "missing")).toBe("missing");
  });
});

describe("The server._exists() function", () => {
  it("should work as expected", () => {
    const harn = harness();

    let obj = {};
    expect(harn.server._exists(obj, "key1", "key1", "missing")).toBe(false);

    obj = { key1: {} };
    expect(harn.server._exists(obj, "key1", "key2", "missing")).toBe(false);

    obj = { key1: { key2: "present" } };
    expect(harn.server._exists(obj, "key1", "key2", "missing")).toBe(true);

    obj = { key1: { key2: "present" } };
    expect(harn.server._exists(obj, "key1", "key3", "missing")).toBe(false);

    obj = { key1: { key2: "present" } };
    expect(harn.server._exists(obj, "key3", "key2", "missing")).toBe(false);
  });
});
