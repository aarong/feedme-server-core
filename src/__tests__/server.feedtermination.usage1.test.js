import feedSerializer from "feedme-util/feedserializer";
import config from "../config";
import harness from "./server.harness";

jest.useFakeTimers();
const epsilon = 1;

expect.extend({
  toHaveState: harness.toHaveState
});

describe("The server.feedTermination() function", () => {
  describe("can return success", () => {
    describe("usage 1 ({cid, fn, fa})", () => {
      describe("target client is not connected", () => {
        describe("there is no non-target client", () => {
          let harn;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: "non_existent_cid",
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("there is a non-target client", () => {
          describe("non-target client has target feed closed", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidNotTarget = harn.makeClient("tcid_client_not_target");
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("non-target client has target feed opening", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedOpening("tcid_client_not_target", "some_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("non-target client has target feed open", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedOpen(
                "tcid_client_not_target",
                "some_feed",
                { feed: "args" },
                { feed: "data" }
              );
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("non-target client has target feed closing", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedClosing(
                "tcid_client_not_target",
                "some_feed",
                { feed: "args" },
                { feed: "data" }
              );
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("non-target client has target feed terminated", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedTerminated("tcid_client_not_target", "some_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });
        });
      });

      describe("target client is connected and has all other feeds closed", () => {
        describe("there is no non-target client", () => {
          describe("target client has target feed closed", () => {
            let harn;
            let cidTarget;
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("target client has target feed opening", () => {
            let harn;
            let cidTarget;
            const feedSerial = feedSerializer.serialize("some_feed", {
              feed: "args"
            });
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");
              harn.makeFeedOpening("tcid_client_target", "some_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              delete newState._clientFeedStates[cidTarget];
              delete newState._feedClientStates[feedSerial];
              delete newState._feedOpenResponses[cidTarget];
              delete newState._feedOpenResponseStates[cidTarget];

              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send FeedOpenResponse on the transport", () => {
              go();

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(1);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
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

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("target client has target feed open", () => {
            let harn;
            let cidTarget;
            const feedSerial = feedSerializer.serialize("some_feed", {
              feed: "args"
            });
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");
              harn.makeFeedOpen(
                "tcid_client_target",
                "some_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              newState._clientFeedStates[cidTarget][feedSerial] = "terminated";
              newState._feedClientStates[feedSerial][cidTarget] = "terminated";
              newState._terminationTimers[cidTarget] = {
                [feedSerial]: 123
              };

              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send FeedTermination on the transport", () => {
              go();

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(1);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
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

            // Inbound callbacks (events, state, transport, outer callbacks)

            describe("on termination timer fire", () => {
              it("should emit nothing", () => {
                go();

                const serverListener = harn.createServerListener();

                jest.runAllTimers(); // Fire the termination timer

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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              it("should update the state appropriately", () => {
                go();

                const newState = harn.getServerState();

                jest.advanceTimersByTime(
                  config.defaults.terminationMs - epsilon
                );

                expect(harn.server).toHaveState(newState);

                jest.advanceTimersByTime(epsilon); // Fire the termination timer

                delete newState._clientFeedStates[cidTarget];
                delete newState._feedClientStates[feedSerial];
                delete newState._terminationTimers[cidTarget];
                expect(harn.server).toHaveState(newState);
              });

              it("should do nothing on the transport", () => {
                go();

                harn.transport.mockClear();

                jest.runAllTimers(); // Fire the termination timer

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(0);
                expect(harn.transport.disconnect.mock.calls.length).toBe(0);
              });
            });
          });

          describe("target client has target feed closing", () => {
            let harn;
            let cidTarget;
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");
              harn.makeFeedClosing("tcid_client_target", "some_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });

          describe("target client has target feed terminated", () => {
            let harn;
            let cidTarget;
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");
              harn.makeFeedTerminated("tcid_client_target", "some_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

            // Outbound callbacks - N/A

            // Inbound callbacks (events, state, transport, outer callbacks) - N/A

            // Return value

            it("should return void", () => {
              expect(go()).toBe(undefined);
            });
          });
        });

        describe("there is a non-target client", () => {
          describe("non-target client has target feed closed", () => {
            describe("target client has target feed closed", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");

                cidNotTarget = harn.makeClient("tcid_client_not_target");
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed opening", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpening("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                delete newState._clientFeedStates[cidTarget];
                delete newState._feedClientStates[feedSerial];
                delete newState._feedOpenResponses[cidTarget];
                delete newState._feedOpenResponseStates[cidTarget];

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedOpenResponse on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
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

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed open", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpen(
                  "tcid_client_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );

                cidNotTarget = harn.makeClient("tcid_client_not_target");
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                newState._clientFeedStates[cidTarget][feedSerial] =
                  "terminated";
                newState._feedClientStates[feedSerial][cidTarget] =
                  "terminated";
                newState._terminationTimers[cidTarget] = {
                  [feedSerial]: 123
                };

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedTermination on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
                  MessageType: "FeedTermination",
                  FeedName: "some_feed",
                  FeedArgs: { feed: "args" },
                  ErrorCode: "SOME_ERROR",
                  ErrorData: { error: "data" }
                });
                expect(harn.transport.disconnect.mock.calls.length).toBe(0);
              });

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks)

              describe("on termination timer fire", () => {
                it("should emit nothing", () => {
                  go();

                  const serverListener = harn.createServerListener();

                  jest.runAllTimers(); // Fire the termination timer

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
                  expect(
                    serverListener.badClientMessage.mock.calls.length
                  ).toBe(0);
                  expect(serverListener.transportError.mock.calls.length).toBe(
                    0
                  );
                });

                it("should update the state appropriately", () => {
                  go();

                  const newState = harn.getServerState();

                  jest.advanceTimersByTime(
                    config.defaults.terminationMs - epsilon
                  );

                  expect(harn.server).toHaveState(newState);

                  jest.advanceTimersByTime(epsilon); // Fire the termination timer

                  delete newState._clientFeedStates[cidTarget];
                  delete newState._feedClientStates[feedSerial];
                  delete newState._terminationTimers[cidTarget];
                  expect(harn.server).toHaveState(newState);
                });

                it("should do nothing on the transport", () => {
                  go();

                  harn.transport.mockClear();

                  jest.runAllTimers(); // Fire the termination timer

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

            describe("target client has target feed closing", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedClosing("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed terminated", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedTerminated("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });
          });

          describe("non-target client has target feed opening", () => {
            describe("target client has target feed closed", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpening("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed opening", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpening("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpening("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                delete newState._clientFeedStates[cidTarget];
                delete newState._feedClientStates[feedSerial][cidTarget];
                delete newState._feedOpenResponses[cidTarget];
                delete newState._feedOpenResponseStates[cidTarget];

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedOpenResponse on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
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

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed open", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpen(
                  "tcid_client_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpening("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                newState._clientFeedStates[cidTarget][feedSerial] =
                  "terminated";
                newState._feedClientStates[feedSerial][cidTarget] =
                  "terminated";
                newState._terminationTimers[cidTarget] = {
                  [feedSerial]: 123
                };

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedTermination on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
                  MessageType: "FeedTermination",
                  FeedName: "some_feed",
                  FeedArgs: { feed: "args" },
                  ErrorCode: "SOME_ERROR",
                  ErrorData: { error: "data" }
                });
                expect(harn.transport.disconnect.mock.calls.length).toBe(0);
              });

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks)

              describe("on termination timer fire", () => {
                it("should emit nothing", () => {
                  go();

                  const serverListener = harn.createServerListener();

                  jest.runAllTimers(); // Fire the termination timer

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
                  expect(
                    serverListener.badClientMessage.mock.calls.length
                  ).toBe(0);
                  expect(serverListener.transportError.mock.calls.length).toBe(
                    0
                  );
                });

                it("should update the state appropriately", () => {
                  go();

                  const newState = harn.getServerState();

                  jest.advanceTimersByTime(
                    config.defaults.terminationMs - epsilon
                  );

                  expect(harn.server).toHaveState(newState);

                  jest.advanceTimersByTime(epsilon); // Fire the termination timer

                  delete newState._clientFeedStates[cidTarget];
                  delete newState._feedClientStates[feedSerial][cidTarget];
                  delete newState._terminationTimers[cidTarget];
                  expect(harn.server).toHaveState(newState);
                });

                it("should do nothing on the transport", () => {
                  go();

                  harn.transport.mockClear();

                  jest.runAllTimers(); // Fire the termination timer

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

            describe("target client has target feed closing", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedClosing("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpening("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed terminated", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedTerminated("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpening("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });
          });

          describe("non-target client has target feed open", () => {
            describe("target client has target feed closed", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpen(
                  "tcid_client_not_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed opening", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpening("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpen(
                  "tcid_client_not_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                delete newState._clientFeedStates[cidTarget];
                delete newState._feedClientStates[feedSerial][cidTarget];
                delete newState._feedOpenResponses[cidTarget];
                delete newState._feedOpenResponseStates[cidTarget];

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedOpenResponse on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
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

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed open", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpen(
                  "tcid_client_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpen(
                  "tcid_client_not_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                newState._clientFeedStates[cidTarget][feedSerial] =
                  "terminated";
                newState._feedClientStates[feedSerial][cidTarget] =
                  "terminated";
                newState._terminationTimers[cidTarget] = {
                  [feedSerial]: 123
                };

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedTermination on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
                  MessageType: "FeedTermination",
                  FeedName: "some_feed",
                  FeedArgs: { feed: "args" },
                  ErrorCode: "SOME_ERROR",
                  ErrorData: { error: "data" }
                });
                expect(harn.transport.disconnect.mock.calls.length).toBe(0);
              });

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks)

              describe("on termination timer fire", () => {
                it("should emit nothing", () => {
                  go();

                  const serverListener = harn.createServerListener();

                  jest.runAllTimers(); // Fire the termination timer

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
                  expect(
                    serverListener.badClientMessage.mock.calls.length
                  ).toBe(0);
                  expect(serverListener.transportError.mock.calls.length).toBe(
                    0
                  );
                });

                it("should update the state appropriately", () => {
                  go();

                  const newState = harn.getServerState();

                  jest.advanceTimersByTime(
                    config.defaults.terminationMs - epsilon
                  );

                  expect(harn.server).toHaveState(newState);

                  jest.advanceTimersByTime(epsilon); // Fire the termination timer

                  delete newState._clientFeedStates[cidTarget];
                  delete newState._feedClientStates[feedSerial][cidTarget];
                  delete newState._terminationTimers[cidTarget];
                  expect(harn.server).toHaveState(newState);
                });

                it("should do nothing on the transport", () => {
                  go();

                  harn.transport.mockClear();

                  jest.runAllTimers(); // Fire the termination timer

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

            describe("target client has target feed closing", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedClosing("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpen(
                  "tcid_client_not_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed terminated", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedTerminated("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedOpen(
                  "tcid_client_not_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });
          });

          describe("non-target client has target feed closing", () => {
            describe("target client has target feed closed", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedClosing("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed opening", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpening("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedClosing("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                delete newState._clientFeedStates[cidTarget];
                delete newState._feedClientStates[feedSerial][cidTarget];
                delete newState._feedOpenResponses[cidTarget];
                delete newState._feedOpenResponseStates[cidTarget];

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedOpenResponse on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
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

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed open", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpen(
                  "tcid_client_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedClosing("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                newState._clientFeedStates[cidTarget][feedSerial] =
                  "terminated";
                newState._feedClientStates[feedSerial][cidTarget] =
                  "terminated";
                newState._terminationTimers[cidTarget] = {
                  [feedSerial]: 123
                };

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedTermination on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
                  MessageType: "FeedTermination",
                  FeedName: "some_feed",
                  FeedArgs: { feed: "args" },
                  ErrorCode: "SOME_ERROR",
                  ErrorData: { error: "data" }
                });
                expect(harn.transport.disconnect.mock.calls.length).toBe(0);
              });

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks)

              describe("on termination timer fire", () => {
                it("should emit nothing", () => {
                  go();

                  const serverListener = harn.createServerListener();

                  jest.runAllTimers(); // Fire the termination timer

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
                  expect(
                    serverListener.badClientMessage.mock.calls.length
                  ).toBe(0);
                  expect(serverListener.transportError.mock.calls.length).toBe(
                    0
                  );
                });

                it("should update the state appropriately", () => {
                  go();

                  const newState = harn.getServerState();

                  jest.advanceTimersByTime(
                    config.defaults.terminationMs - epsilon
                  );

                  expect(harn.server).toHaveState(newState);

                  jest.advanceTimersByTime(epsilon); // Fire the termination timer

                  delete newState._clientFeedStates[cidTarget];
                  delete newState._feedClientStates[feedSerial][cidTarget];
                  delete newState._terminationTimers[cidTarget];
                  expect(harn.server).toHaveState(newState);
                });

                it("should do nothing on the transport", () => {
                  go();

                  harn.transport.mockClear();

                  jest.runAllTimers(); // Fire the termination timer

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

            describe("target client has target feed closing", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedClosing("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedClosing("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed terminated", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedTerminated("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedClosing("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });
          });

          describe("non-target client has target feed terminated", () => {
            describe("target client has target feed closed", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedTerminated("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed opening", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpening("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedTerminated("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                delete newState._clientFeedStates[cidTarget];
                delete newState._feedClientStates[feedSerial][cidTarget];
                delete newState._feedOpenResponses[cidTarget];
                delete newState._feedOpenResponseStates[cidTarget];

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedOpenResponse on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
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

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed open", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              const feedSerial = feedSerializer.serialize("some_feed", {
                feed: "args"
              });
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedOpen(
                  "tcid_client_target",
                  "some_feed",
                  {
                    feed: "args"
                  },
                  { feed: "data" }
                );

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedTerminated("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
                const newState = harn.getServerState();

                go();

                newState._clientFeedStates[cidTarget][feedSerial] =
                  "terminated";
                newState._feedClientStates[feedSerial][cidTarget] =
                  "terminated";
                newState._terminationTimers[cidTarget] = {
                  [feedSerial]: 123
                };

                expect(harn.server).toHaveState(newState);
              });

              // Transport calls

              it("should send FeedTermination on the transport", () => {
                go();

                expect(harn.transport.start.mock.calls.length).toBe(0);
                expect(harn.transport.stop.mock.calls.length).toBe(0);
                expect(harn.transport.send.mock.calls.length).toBe(1);
                expect(harn.transport.send.mock.calls[0].length).toBe(2);
                expect(harn.transport.send.mock.calls[0][0]).toBe(
                  "tcid_client_target"
                );
                expect(
                  JSON.parse(harn.transport.send.mock.calls[0][1])
                ).toEqual({
                  MessageType: "FeedTermination",
                  FeedName: "some_feed",
                  FeedArgs: { feed: "args" },
                  ErrorCode: "SOME_ERROR",
                  ErrorData: { error: "data" }
                });
                expect(harn.transport.disconnect.mock.calls.length).toBe(0);
              });

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks)

              describe("on termination timer fire", () => {
                it("should emit nothing", () => {
                  go();

                  const serverListener = harn.createServerListener();

                  jest.runAllTimers(); // Fire the termination timer

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
                  expect(
                    serverListener.badClientMessage.mock.calls.length
                  ).toBe(0);
                  expect(serverListener.transportError.mock.calls.length).toBe(
                    0
                  );
                });

                it("should update the state appropriately", () => {
                  go();

                  const newState = harn.getServerState();

                  jest.advanceTimersByTime(
                    config.defaults.terminationMs - epsilon
                  );

                  expect(harn.server).toHaveState(newState);

                  jest.advanceTimersByTime(epsilon); // Fire the termination timer

                  delete newState._clientFeedStates[cidTarget];
                  delete newState._clientFeedStates[cidNotTarget];
                  delete newState._feedClientStates[feedSerial];
                  delete newState._terminationTimers[cidTarget];
                  delete newState._terminationTimers[cidNotTarget];
                  expect(harn.server).toHaveState(newState);
                });

                it("should do nothing on the transport", () => {
                  go();

                  harn.transport.mockClear();

                  jest.runAllTimers(); // Fire the termination timer

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

            describe("target client has target feed closing", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedClosing("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedTerminated("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });

            describe("target client has target feed terminated", () => {
              let harn;
              let cidTarget;
              let cidNotTarget; // eslint-disable-line no-unused-vars
              beforeEach(() => {
                harn = harness();
                harn.makeServerStarted();

                cidTarget = harn.makeClient("tcid_client_target");
                harn.makeFeedTerminated("tcid_client_target", "some_feed", {
                  feed: "args"
                });

                cidNotTarget = harn.makeClient("tcid_client_not_target");
                harn.makeFeedTerminated("tcid_client_not_target", "some_feed", {
                  feed: "args"
                });
              });
              const go = () =>
                harn.server.feedTermination({
                  clientId: cidTarget,
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
                expect(serverListener.badClientMessage.mock.calls.length).toBe(
                  0
                );
                expect(serverListener.transportError.mock.calls.length).toBe(0);
              });

              // State

              it("should update the state appropriately", () => {
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

              // Outbound callbacks - N/A

              // Inbound callbacks (events, state, transport, outer callbacks) - N/A

              // Return value

              it("should return void", () => {
                expect(go()).toBe(undefined);
              });
            });
          });
        });
      });

      describe("target client is connected and has a non-target feed-arg open; no non-target client", () => {
        describe("target client has target feed closed", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              { feed: "other_arg" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("target client has target feed opening", () => {
          let harn;
          let cidTarget;
          const feedSerial = feedSerializer.serialize("some_feed", {
            feed: "args"
          });
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedOpening("tcid_client_target", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              { feed: "other_arg" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

            delete newState._clientFeedStates[cidTarget][feedSerial];
            delete newState._feedClientStates[feedSerial];
            delete newState._feedOpenResponses[cidTarget];
            delete newState._feedOpenResponseStates[cidTarget];

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should send FeedOpenResponse on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe(
              "tcid_client_target"
            );
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

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("target client has target feed open", () => {
          let harn;
          let cidTarget;
          const feedSerial = feedSerializer.serialize("some_feed", {
            feed: "args"
          });
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              { feed: "other_arg" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

            newState._clientFeedStates[cidTarget][feedSerial] = "terminated";
            newState._feedClientStates[feedSerial][cidTarget] = "terminated";
            newState._terminationTimers[cidTarget] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should send FeedTermination on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe(
              "tcid_client_target"
            );
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

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.runAllTimers(); // Fire the termination timer

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

              delete newState._clientFeedStates[cidTarget][feedSerial];
              delete newState._feedClientStates[feedSerial];
              delete newState._terminationTimers[cidTarget];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.runAllTimers(); // Fire the termination timer

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

        describe("target client has target feed closing", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedClosing("tcid_client_target", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              { feed: "other_arg" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("target client has target feed terminated", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedTerminated("tcid_client_target", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              { feed: "other_arg" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });
      });

      describe("target client is connected and has a non-target feed-name open; no non-target client", () => {
        describe("target client has target feed closed", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedOpen(
              "tcid_client_target",
              "other_feed",
              { feed: "args" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("target client has target feed opening", () => {
          let harn;
          let cidTarget;
          const feedSerial = feedSerializer.serialize("some_feed", {
            feed: "args"
          });
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedOpening("tcid_client_target", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_target",
              "other_feed",
              { feed: "args" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

            delete newState._clientFeedStates[cidTarget][feedSerial];
            delete newState._feedClientStates[feedSerial];
            delete newState._feedOpenResponses[cidTarget];
            delete newState._feedOpenResponseStates[cidTarget];

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should send FeedOpenResponse on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe(
              "tcid_client_target"
            );
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

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("target client has target feed open", () => {
          let harn;
          let cidTarget;
          const feedSerial = feedSerializer.serialize("some_feed", {
            feed: "args"
          });
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedOpen(
              "tcid_client_target",
              "some_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );
            harn.makeFeedOpen(
              "tcid_client_target",
              "other_feed",
              { feed: "args" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

            newState._clientFeedStates[cidTarget][feedSerial] = "terminated";
            newState._feedClientStates[feedSerial][cidTarget] = "terminated";
            newState._terminationTimers[cidTarget] = {
              [feedSerial]: 123
            };

            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should send FeedTermination on the transport", () => {
            go();

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe(
              "tcid_client_target"
            );
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

          // Inbound callbacks (events, state, transport, outer callbacks)

          describe("on termination timer fire", () => {
            it("should emit nothing", () => {
              go();

              const serverListener = harn.createServerListener();

              jest.runAllTimers(); // Fire the termination timer

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

              delete newState._clientFeedStates[cidTarget][feedSerial];
              delete newState._feedClientStates[feedSerial];
              delete newState._terminationTimers[cidTarget];
              expect(harn.server).toHaveState(newState);
            });

            it("should do nothing on the transport", () => {
              go();

              harn.transport.mockClear();

              jest.runAllTimers(); // Fire the termination timer

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

        describe("target client has target feed closing", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedClosing("tcid_client_target", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_target",
              "other_feed",
              { feed: "args" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });

        describe("target client has target feed terminated", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
            harn.makeFeedTerminated("tcid_client_target", "some_feed", {
              feed: "args"
            });
            harn.makeFeedOpen(
              "tcid_client_target",
              "other_feed",
              { feed: "args" },
              { feed: "data" }
            );
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

          // Outbound callbacks - N/A

          // Inbound callbacks (events, state, transport, outer callbacks) - N/A

          // Return value

          it("should return void", () => {
            expect(go()).toBe(undefined);
          });
        });
      });
    });
  });
});
