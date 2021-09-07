import FeedNameArgs from "feedme-util/feednameargs";
import _ from "lodash";
import config from "../config";
import harness from "./server.harness";

jest.useFakeTimers();
const epsilon = 1;

expect.extend({
  toHaveState: harness.toHaveState
});

describe("The server.feedTermination() function", () => {
  describe("can return success", () => {
    describe("usage 3 ({fn, fa})", () => {
      describe("all clients have target feed closed", () => {
        describe("no clients are connected", () => {
          let harn;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("all non-target feeds are closed", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-arg opening", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedOpening("tcid_client_1", "some_feed", {
              other: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-arg open", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedOpen(
              "tcid_client_1",
              "some_feed",
              {
                other: "args"
              },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-arg closing", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedClosing("tcid_client_1", "some_feed", {
              other: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-arg terminated", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedTerminated("tcid_client_1", "some_feed", {
              other: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-name opening", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedOpening("tcid_client_1", "other_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-name open", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedOpen(
              "tcid_client_1",
              "other_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-name closing", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedClosing("tcid_client_1", "other_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("a client has a non-target feed-name terminated", () => {
          let harn;
          let cidClient1; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClient1 = harn.makeClient("tcid_client_1");
            harn.makeFeedTerminated("tcid_client_1", "other_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

            go();

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should do nothing on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });
      });

      describe("clients have the target feed in all states", () => {
        describe("clients have all non-target feeds closed", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen];
              delete newState._clientFeedStates[cidTerminated];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-arg opening", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedOpening("tcid_client_closed", "some_feed", {
              other: "arg"
            });

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              other: "arg"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedOpening("tcid_client_open", "some_feed", {
              other: "arg"
            });

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpening("tcid_client_closing", "some_feed", {
              other: "arg"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpening("tcid_client_terminated", "some_feed", {
              other: "arg"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening][feedSerial];
            delete newState._feedOpenResponseStates[cidOpening][feedSerial];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen][feedSerial];
              delete newState._clientFeedStates[cidTerminated][feedSerial];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-arg open", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedOpen(
              "tcid_client_closed",
              "some_feed",
              {
                other: "arg"
              },
              { feed: "data" }
            );

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_opening",
              "some_feed",
              {
                other: "arg"
              },
              { feed: "data" }
            );

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              {
                other: "arg"
              },
              { feed: "data" }
            );

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_closing",
              "some_feed",
              {
                other: "arg"
              },
              { feed: "data" }
            );

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_terminated",
              "some_feed",
              {
                other: "arg"
              },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen][feedSerial];
              delete newState._clientFeedStates[cidTerminated][feedSerial];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-arg closing", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedClosing("tcid_client_closed", "some_feed", {
              other: "arg"
            });

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedClosing("tcid_client_opening", "some_feed", {
              other: "arg"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedClosing("tcid_client_open", "some_feed", {
              other: "arg"
            });

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              other: "arg"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedClosing("tcid_client_terminated", "some_feed", {
              other: "arg"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen][feedSerial];
              delete newState._clientFeedStates[cidTerminated][feedSerial];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-arg terminated", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedTerminated("tcid_client_closed", "some_feed", {
              other: "arg"
            });

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedTerminated("tcid_client_opening", "some_feed", {
              other: "arg"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedTerminated("tcid_client_open", "some_feed", {
              other: "arg"
            });

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedTerminated("tcid_client_closing", "some_feed", {
              other: "arg"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              other: "arg"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen][feedSerial] = 123;

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              newState._clientFeedStates = {
                [cidClosing]: {
                  [feedSerial]: "closing"
                }
              };
              newState._feedClientStates = {
                [feedSerial]: {
                  [cidClosing]: "closing"
                }
              };
              newState._terminationTimers = {};
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-name opening", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedOpening("tcid_client_closed", "other_feed", {
              feed: "args"
            });

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpening("tcid_client_opening", "other_feed", {
              feed: "args"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedOpening("tcid_client_open", "other_feed", {
              feed: "args"
            });

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpening("tcid_client_closing", "other_feed", {
              feed: "args"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpening("tcid_client_terminated", "other_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening][feedSerial];
            delete newState._feedOpenResponseStates[cidOpening][feedSerial];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen][feedSerial];
              delete newState._clientFeedStates[cidTerminated][feedSerial];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-name open", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedOpen(
              "tcid_client_closed",
              "other_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_opening",
              "other_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedOpen(
              "tcid_client_open",
              "other_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_closing",
              "other_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_terminated",
              "other_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen][feedSerial];
              delete newState._clientFeedStates[cidTerminated][feedSerial];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-name closing", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedClosing("tcid_client_closed", "other_feed", {
              feed: "args"
            });

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedClosing("tcid_client_opening", "other_feed", {
              feed: "args"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedClosing("tcid_client_open", "other_feed", {
              feed: "args"
            });

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedClosing("tcid_client_closing", "other_feed", {
              feed: "args"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedClosing("tcid_client_terminated", "other_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              delete newState._clientFeedStates[cidOpen][feedSerial];
              delete newState._clientFeedStates[cidTerminated][feedSerial];
              delete newState._feedClientStates[feedSerial][cidOpen];
              delete newState._feedClientStates[feedSerial][cidTerminated];
              delete newState._terminationTimers[cidOpen];
              delete newState._terminationTimers[cidTerminated];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("clients have a non-target feed-name terminated", () => {
          let harn;
          let cidClosed; // eslint-disable-line no-unused-vars
          let cidOpening;
          let cidOpen;
          let cidClosing; // eslint-disable-line no-unused-vars
          let cidTerminated; // eslint-disable-line no-unused-vars
          const feedSerial = FeedNameArgs("some_feed", {
            feed: "args"
          }).serial();
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidClosed = harn.makeClient("tcid_client_closed");
            harn.makeFeedTerminated("tcid_client_closed", "other_feed", {
              feed: "args"
            });

            cidOpening = harn.makeClient("tcid_client_opening");
            harn.makeFeedOpening("tcid_client_opening", "some_feed", {
              feed: "args"
            });
            harn.makeFeedTerminated("tcid_client_opening", "other_feed", {
              feed: "args"
            });

            cidOpen = harn.makeClient("tcid_client_open");
            harn.makeFeedOpen(
              "tcid_client_open",
              "some_feed",
              { feed: "args" },
              { feed: "data" }
            );
            harn.makeFeedTerminated("tcid_client_open", "other_feed", {
              feed: "args"
            });

            cidClosing = harn.makeClient("tcid_client_closing");
            harn.makeFeedClosing("tcid_client_closing", "some_feed", {
              feed: "args"
            });
            harn.makeFeedTerminated("tcid_client_closing", "other_feed", {
              feed: "args"
            });

            cidTerminated = harn.makeClient("tcid_client_terminated");
            harn.makeFeedTerminated("tcid_client_terminated", "some_feed", {
              feed: "args"
            });
            harn.makeFeedTerminated("tcid_client_terminated", "other_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              feedName: "some_feed",
              feedArgs: { feed: "args" },
              errorCode: "SOME_ERROR",
              errorData: { error: "data" }
            });

          // Events

          it("should emit nothing", () => {
            const serverListener = harn.createServerListener();

            go();

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

          it("should update the state appropriately", () => {
            const newState = harn.getServerState();

            go();

            delete newState._clientFeedStates[cidOpening][feedSerial];
            newState._clientFeedStates[cidOpen][feedSerial] = "terminated";
            delete newState._feedClientStates[feedSerial][cidOpening];
            newState._feedClientStates[feedSerial][cidOpen] = "terminated";
            delete newState._feedOpenResponses[cidOpening];
            delete newState._feedOpenResponseStates[cidOpening];
            newState._terminationTimers[cidOpen][feedSerial] = 123;

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should operate appropriately on the transport", () => {
            go();

            const msgOpening = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msgOpen = {
              MessageType: "FeedTermination",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(
              (harn.transport.send.mock.calls[0][0] === "tcid_client_opening" &&
                harn.transport.send.mock.calls[1][0] === "tcid_client_open" &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msgOpening
                ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msgOpen
                )) ||
                (harn.transport.send.mock.calls[1][0] ===
                  "tcid_client_opening" &&
                  harn.transport.send.mock.calls[0][0] === "tcid_client_open" &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msgOpening
                  ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msgOpen
                  ))
            ).toBe(true);

            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Function calls - N/A

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

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

            it("should update the state appropriately", () => {
              go();

              const newState = harn.getServerState();

              jest.advanceTimersByTime(config.defaults.terminationMs - epsilon);

              expect(harn.server).toHaveState(newState);

              jest.advanceTimersByTime(epsilon); // Fire the termination timer

              newState._clientFeedStates = {
                [cidClosing]: {
                  [feedSerial]: "closing"
                }
              };
              newState._feedClientStates = {
                [feedSerial]: {
                  [cidClosing]: "closing"
                }
              };
              newState._terminationTimers = {};
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.advanceTimersByTime(config.defaults.terminationMs); // Fire the termination timer

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(0);
              expect(harn.transport.disconnect.mock.calls.length).toBe(0);
            });
          });

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });
      });
    });
  });
});
