import feedSerializer from "feedme-util/feedserializer";
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
    describe("usage 2 ({cid})", () => {
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

        describe("there is a non-target client", () => {
          describe("non-target client has all feeds closed", () => {
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

          describe("non-target client has a feed opening", () => {
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
          });

          describe("non-target client has a feed open", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

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
                clientId: "non_existent_cid",
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
          });

          describe("non-target client has a feed closing", () => {
            let harn;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedClosing("tcid_client_not_target", "some_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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
          });

          describe("non-target client has a feed terminated", () => {
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
          });
        });
      });

      describe("target client is connected with all feeds closed", () => {
        describe("there is no non-target client", () => {
          let harn;
          let cidTarget; // eslint-disable-line no-unused-vars
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: "non_existent_cid",
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

        describe("there is a non-target client", () => {
          describe("non-target client has all feeds closed", () => {
            let harn;
            let cidTarget; // eslint-disable-line no-unused-vars
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");

              cidNotTarget = harn.makeClient("tcid_client_not_target");
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: "non_existent_cid",
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

          describe("non-target client has a feed opening", () => {
            let harn;
            let cidTarget; // eslint-disable-line no-unused-vars
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
                clientId: "non_existent_cid",
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
          });

          describe("non-target client has a feed open", () => {
            let harn;
            let cidTarget; // eslint-disable-line no-unused-vars
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
                clientId: "non_existent_cid",
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
          });

          describe("non-target client has a feed closing", () => {
            let harn;
            let cidTarget; // eslint-disable-line no-unused-vars
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
                clientId: "non_existent_cid",
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
          });

          describe("non-target client has a feed terminated", () => {
            let harn;
            let cidTarget; // eslint-disable-line no-unused-vars
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
                clientId: "non_existent_cid",
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
          });
        });
      });

      describe("target client is connected with feeds in all states", () => {
        describe("there is no non-target client", () => {
          let harn;
          let cidTarget;
          beforeEach(() => {
            harn = harness();
            harn.makeServerStarted();

            cidTarget = harn.makeClient("tcid_client_target");

            harn.makeFeedOpening("tcid_client_target", "opening_feed", {
              feed: "args"
            });

            harn.makeFeedOpen(
              "tcid_client_target",
              "open_feed",
              {
                feed: "args"
              },
              { feed: "data" }
            );

            harn.makeFeedClosing("tcid_client_target", "closing_feed", {
              feed: "args"
            });

            harn.makeFeedTerminated("tcid_client_target", "terminated_feed", {
              feed: "args"
            });
          });
          const go = () =>
            harn.server.feedTermination({
              clientId: cidTarget,
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

            const wasOpeningSerial = feedSerializer.serialize("opening_feed", {
              feed: "args"
            });
            const wasOpenSerial = feedSerializer.serialize("open_feed", {
              feed: "args"
            });

            newState._clientFeedStates[cidTarget][wasOpenSerial] = "terminated";
            delete newState._clientFeedStates[cidTarget][wasOpeningSerial];
            newState._feedClientStates[wasOpenSerial][cidTarget] = "terminated";
            delete newState._feedClientStates[wasOpeningSerial];
            delete newState._feedOpenResponses[cidTarget];
            delete newState._feedOpenResponseStates[cidTarget];
            newState._terminationTimers[cidTarget][wasOpenSerial] = 123;
            expect(harn.server).toHaveState(newState);
          });

          // Transport calls

          it("should send appropriate messages on the transport", () => {
            go();

            const msg1 = {
              MessageType: "FeedOpenResponse",
              Success: false,
              FeedName: "opening_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            const msg2 = {
              MessageType: "FeedTermination",
              FeedName: "open_feed",
              FeedArgs: { feed: "args" },
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            };

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(2);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[1].length).toBe(2);

            expect(harn.transport.send.mock.calls[0][0]).toBe(
              "tcid_client_target"
            );
            expect(harn.transport.send.mock.calls[1][0]).toBe(
              "tcid_client_target"
            );

            expect(
              (_.isEqual(
                JSON.parse(harn.transport.send.mock.calls[0][1]),
                msg1
              ) &&
                _.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msg2
                )) ||
                (_.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[1][1]),
                  msg1
                ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[0][1]),
                    msg2
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

              const openSerial = feedSerializer.serialize("open_feed", {
                feed: "args"
              });
              const terminatedSerial = feedSerializer.serialize(
                "terminated_feed",
                {
                  feed: "args"
                }
              );

              delete newState._clientFeedStates[cidTarget][openSerial];
              delete newState._clientFeedStates[cidTarget][terminatedSerial];
              delete newState._feedClientStates[openSerial];
              delete newState._feedClientStates[terminatedSerial];
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

        describe("there is a non-target client", () => {
          describe("non-target client has all feeds closed", () => {
            let harn;
            let cidTarget;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");

              harn.makeFeedOpening("tcid_client_target", "opening_feed", {
                feed: "args"
              });

              harn.makeFeedOpen(
                "tcid_client_target",
                "open_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );

              harn.makeFeedClosing("tcid_client_target", "closing_feed", {
                feed: "args"
              });

              harn.makeFeedTerminated("tcid_client_target", "terminated_feed", {
                feed: "args"
              });

              cidNotTarget = harn.makeClient("tcid_client_not_target");
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              const wasOpeningSerial = feedSerializer.serialize(
                "opening_feed",
                {
                  feed: "args"
                }
              );
              const wasOpenSerial = feedSerializer.serialize("open_feed", {
                feed: "args"
              });

              newState._clientFeedStates[cidTarget][wasOpenSerial] =
                "terminated";
              delete newState._clientFeedStates[cidTarget][wasOpeningSerial];
              newState._feedClientStates[wasOpenSerial][cidTarget] =
                "terminated";
              delete newState._feedClientStates[wasOpeningSerial];
              delete newState._feedOpenResponses[cidTarget];
              delete newState._feedOpenResponseStates[cidTarget];
              newState._terminationTimers[cidTarget][wasOpenSerial] = 123;
              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send appropriate messages on the transport", () => {
              go();

              const msg1 = {
                MessageType: "FeedOpenResponse",
                Success: false,
                FeedName: "opening_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              const msg2 = {
                MessageType: "FeedTermination",
                FeedName: "open_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(2);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[1].length).toBe(2);

              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
              expect(harn.transport.send.mock.calls[1][0]).toBe(
                "tcid_client_target"
              );

              expect(
                (_.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msg1
                ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg2
                  )) ||
                  (_.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg1
                  ) &&
                    _.isEqual(
                      JSON.parse(harn.transport.send.mock.calls[0][1]),
                      msg2
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

                const openSerial = feedSerializer.serialize("open_feed", {
                  feed: "args"
                });
                const terminatedSerial = feedSerializer.serialize(
                  "terminated_feed",
                  {
                    feed: "args"
                  }
                );

                delete newState._clientFeedStates[cidTarget][openSerial];
                delete newState._clientFeedStates[cidTarget][terminatedSerial];
                delete newState._feedClientStates[openSerial];
                delete newState._feedClientStates[terminatedSerial];
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

          describe("non-target client has a feed opening", () => {
            let harn;
            let cidTarget;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");

              harn.makeFeedOpening("tcid_client_target", "opening_feed", {
                feed: "args"
              });

              harn.makeFeedOpen(
                "tcid_client_target",
                "open_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );

              harn.makeFeedClosing("tcid_client_target", "closing_feed", {
                feed: "args"
              });

              harn.makeFeedTerminated("tcid_client_target", "terminated_feed", {
                feed: "args"
              });

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedOpening("tcid_client_not_target", "opening_feed", {
                feed: "args"
              });
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              const wasOpeningSerial = feedSerializer.serialize(
                "opening_feed",
                {
                  feed: "args"
                }
              );
              const wasOpenSerial = feedSerializer.serialize("open_feed", {
                feed: "args"
              });

              newState._clientFeedStates[cidTarget][wasOpenSerial] =
                "terminated";
              delete newState._clientFeedStates[cidTarget][wasOpeningSerial];
              newState._feedClientStates[wasOpenSerial][cidTarget] =
                "terminated";
              delete newState._feedClientStates[wasOpeningSerial][cidTarget];
              delete newState._feedOpenResponses[cidTarget];
              delete newState._feedOpenResponseStates[cidTarget];
              newState._terminationTimers[cidTarget][wasOpenSerial] = 123;

              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send appropriate messages on the transport", () => {
              go();

              const msg1 = {
                MessageType: "FeedOpenResponse",
                Success: false,
                FeedName: "opening_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              const msg2 = {
                MessageType: "FeedTermination",
                FeedName: "open_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(2);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[1].length).toBe(2);

              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
              expect(harn.transport.send.mock.calls[1][0]).toBe(
                "tcid_client_target"
              );

              expect(
                (_.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msg1
                ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg2
                  )) ||
                  (_.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg1
                  ) &&
                    _.isEqual(
                      JSON.parse(harn.transport.send.mock.calls[0][1]),
                      msg2
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

                const openSerial = feedSerializer.serialize("open_feed", {
                  feed: "args"
                });
                const terminatedSerial = feedSerializer.serialize(
                  "terminated_feed",
                  {
                    feed: "args"
                  }
                );

                delete newState._clientFeedStates[cidTarget][openSerial];
                delete newState._clientFeedStates[cidTarget][terminatedSerial];
                delete newState._feedClientStates[openSerial];
                delete newState._feedClientStates[terminatedSerial];
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

          describe("non-target client has a feed open", () => {
            let harn;
            let cidTarget;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");

              harn.makeFeedOpening("tcid_client_target", "opening_feed", {
                feed: "args"
              });

              harn.makeFeedOpen(
                "tcid_client_target",
                "open_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );

              harn.makeFeedClosing("tcid_client_target", "closing_feed", {
                feed: "args"
              });

              harn.makeFeedTerminated("tcid_client_target", "terminated_feed", {
                feed: "args"
              });

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedOpen(
                "tcid_client_not_target",
                "open_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              const wasOpeningSerial = feedSerializer.serialize(
                "opening_feed",
                {
                  feed: "args"
                }
              );
              const wasOpenSerial = feedSerializer.serialize("open_feed", {
                feed: "args"
              });

              newState._clientFeedStates[cidTarget][wasOpenSerial] =
                "terminated";
              delete newState._clientFeedStates[cidTarget][wasOpeningSerial];
              newState._feedClientStates[wasOpenSerial][cidTarget] =
                "terminated";
              delete newState._feedClientStates[wasOpeningSerial];
              delete newState._feedOpenResponses[cidTarget];
              delete newState._feedOpenResponseStates[cidTarget];
              newState._terminationTimers[cidTarget][wasOpenSerial] = 123;
              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send appropriate messages on the transport", () => {
              go();

              const msg1 = {
                MessageType: "FeedOpenResponse",
                Success: false,
                FeedName: "opening_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              const msg2 = {
                MessageType: "FeedTermination",
                FeedName: "open_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(2);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[1].length).toBe(2);

              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
              expect(harn.transport.send.mock.calls[1][0]).toBe(
                "tcid_client_target"
              );

              expect(
                (_.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msg1
                ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg2
                  )) ||
                  (_.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg1
                  ) &&
                    _.isEqual(
                      JSON.parse(harn.transport.send.mock.calls[0][1]),
                      msg2
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

                const openSerial = feedSerializer.serialize("open_feed", {
                  feed: "args"
                });
                const terminatedSerial = feedSerializer.serialize(
                  "terminated_feed",
                  {
                    feed: "args"
                  }
                );

                delete newState._clientFeedStates[cidTarget][openSerial];
                delete newState._clientFeedStates[cidTarget][terminatedSerial];
                delete newState._feedClientStates[openSerial][cidTarget];
                delete newState._feedClientStates[terminatedSerial];
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

          describe("non-target client has a feed closing", () => {
            let harn;
            let cidTarget;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");

              harn.makeFeedOpening("tcid_client_target", "opening_feed", {
                feed: "args"
              });

              harn.makeFeedOpen(
                "tcid_client_target",
                "open_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );

              harn.makeFeedClosing("tcid_client_target", "closing_feed", {
                feed: "args"
              });

              harn.makeFeedTerminated("tcid_client_target", "terminated_feed", {
                feed: "args"
              });

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedClosing(
                "tcid_client_not_target",
                "closing_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              const wasOpeningSerial = feedSerializer.serialize(
                "opening_feed",
                {
                  feed: "args"
                }
              );
              const wasOpenSerial = feedSerializer.serialize("open_feed", {
                feed: "args"
              });

              newState._clientFeedStates[cidTarget][wasOpenSerial] =
                "terminated";
              delete newState._clientFeedStates[cidTarget][wasOpeningSerial];
              newState._feedClientStates[wasOpenSerial][cidTarget] =
                "terminated";
              delete newState._feedClientStates[wasOpeningSerial];
              delete newState._feedOpenResponses[cidTarget];
              delete newState._feedOpenResponseStates[cidTarget];
              newState._terminationTimers[cidTarget][wasOpenSerial] = 123;
              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send appropriate messages on the transport", () => {
              go();

              const msg1 = {
                MessageType: "FeedOpenResponse",
                Success: false,
                FeedName: "opening_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              const msg2 = {
                MessageType: "FeedTermination",
                FeedName: "open_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(2);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[1].length).toBe(2);

              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
              expect(harn.transport.send.mock.calls[1][0]).toBe(
                "tcid_client_target"
              );

              expect(
                (_.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msg1
                ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg2
                  )) ||
                  (_.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg1
                  ) &&
                    _.isEqual(
                      JSON.parse(harn.transport.send.mock.calls[0][1]),
                      msg2
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

                const openSerial = feedSerializer.serialize("open_feed", {
                  feed: "args"
                });
                const terminatedSerial = feedSerializer.serialize(
                  "terminated_feed",
                  {
                    feed: "args"
                  }
                );

                delete newState._clientFeedStates[cidTarget][openSerial];
                delete newState._clientFeedStates[cidTarget][terminatedSerial];
                delete newState._feedClientStates[openSerial];
                delete newState._feedClientStates[terminatedSerial];
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

          describe("non-target client has a feed terminated", () => {
            let harn;
            let cidTarget;
            let cidNotTarget; // eslint-disable-line no-unused-vars
            beforeEach(() => {
              harn = harness();
              harn.makeServerStarted();

              cidTarget = harn.makeClient("tcid_client_target");

              harn.makeFeedOpening("tcid_client_target", "opening_feed", {
                feed: "args"
              });

              harn.makeFeedOpen(
                "tcid_client_target",
                "open_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );

              harn.makeFeedClosing("tcid_client_target", "closing_feed", {
                feed: "args"
              });

              harn.makeFeedTerminated("tcid_client_target", "terminated_feed", {
                feed: "args"
              });

              cidNotTarget = harn.makeClient("tcid_client_not_target");
              harn.makeFeedTerminated(
                "tcid_client_not_target",
                "terminated_feed",
                {
                  feed: "args"
                },
                { feed: "data" }
              );
            });
            const go = () =>
              harn.server.feedTermination({
                clientId: cidTarget,
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

              const wasOpeningSerial = feedSerializer.serialize(
                "opening_feed",
                {
                  feed: "args"
                }
              );
              const wasOpenSerial = feedSerializer.serialize("open_feed", {
                feed: "args"
              });

              newState._clientFeedStates[cidTarget][wasOpenSerial] =
                "terminated";
              delete newState._clientFeedStates[cidTarget][wasOpeningSerial];
              newState._feedClientStates[wasOpenSerial][cidTarget] =
                "terminated";
              delete newState._feedClientStates[wasOpeningSerial];
              delete newState._feedOpenResponses[cidTarget];
              delete newState._feedOpenResponseStates[cidTarget];
              newState._terminationTimers[cidTarget][wasOpenSerial] = 123;
              expect(harn.server).toHaveState(newState);
            });

            // Transport calls

            it("should send appropriate messages on the transport", () => {
              go();

              const msg1 = {
                MessageType: "FeedOpenResponse",
                Success: false,
                FeedName: "opening_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              const msg2 = {
                MessageType: "FeedTermination",
                FeedName: "open_feed",
                FeedArgs: { feed: "args" },
                ErrorCode: "SOME_ERROR",
                ErrorData: { error: "data" }
              };

              expect(harn.transport.start.mock.calls.length).toBe(0);
              expect(harn.transport.stop.mock.calls.length).toBe(0);
              expect(harn.transport.send.mock.calls.length).toBe(2);
              expect(harn.transport.send.mock.calls[0].length).toBe(2);
              expect(harn.transport.send.mock.calls[1].length).toBe(2);

              expect(harn.transport.send.mock.calls[0][0]).toBe(
                "tcid_client_target"
              );
              expect(harn.transport.send.mock.calls[1][0]).toBe(
                "tcid_client_target"
              );

              expect(
                (_.isEqual(
                  JSON.parse(harn.transport.send.mock.calls[0][1]),
                  msg1
                ) &&
                  _.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg2
                  )) ||
                  (_.isEqual(
                    JSON.parse(harn.transport.send.mock.calls[1][1]),
                    msg1
                  ) &&
                    _.isEqual(
                      JSON.parse(harn.transport.send.mock.calls[0][1]),
                      msg2
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

                const openSerial = feedSerializer.serialize("open_feed", {
                  feed: "args"
                });
                const terminatedSerial = feedSerializer.serialize(
                  "terminated_feed",
                  {
                    feed: "args"
                  }
                );

                delete newState._clientFeedStates[cidTarget][openSerial];
                delete newState._clientFeedStates[cidTarget][terminatedSerial];
                delete newState._clientFeedStates[cidNotTarget];
                delete newState._feedClientStates[openSerial];
                delete newState._feedClientStates[terminatedSerial];
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
        });
      });
    });
  });
});
