import harness from "./index.harness";

describe("When the transport emits a valid FeedClose message", () => {
  describe("if there is no feedClose listener", () => {
    describe("if the feed is open", () => {
      // Events

      it("should emit no events", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedOpen(
          "some_tcid",
          "some_feed",
          { feed: "args" },
          { feed: "data" }
        );

        harn.server.emit = jest.fn(); // Can't create a listener
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "FeedClose",
            FeedName: "some_feed",
            FeedArgs: { feed: "args" }
          })
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should send a FeedCloseResponse indicating success", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedOpen(
          "some_tcid",
          "some_feed",
          { feed: "args" },
          { feed: "data" }
        );

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

      // Errors and return values - N/A
    });

    describe("if the feed is terminated", () => {
      // Events

      it("should emit no events", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

        harn.server.emit = jest.fn(); // Can't create a listener
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "FeedClose",
            FeedName: "some_feed",
            FeedArgs: { feed: "args" }
          })
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should send a FeedCloseResponse indicating success", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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

      // Errors and return values - N/A
    });
  });

  describe("if there is a feedClose listener", () => {
    describe("if the feed is open", () => {
      describe("if next the app calls fcres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
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
          expect(serverListener.feedClose.mock.calls.length).toBe(1);
          expect(serverListener.feedClose.mock.calls[0].length).toBe(2);
          expect(serverListener.feedClose.mock.calls[0][0]).toBeInstanceOf(
            Object
          );
          expect(serverListener.feedClose.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.feedClose.mock.calls[0][0].feedName).toBe(
            "some_feed"
          );
          expect(serverListener.feedClose.mock.calls[0][0].feedArgs).toEqual({
            feed: "args"
          });
          expect(serverListener.feedClose.mock.calls[0][1]).toBeInstanceOf(
            Object
          );
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const fcres = serverListener.feedClose.mock.calls[0][1];

          serverListener.mockClear();
          fcres.success();

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

          serverListener.mockClear();
          try {
            fcres.success();
          } catch (e) {} // eslint-disable-line no-empty
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

        // Transport

        it("should operate appropriately on the transport", () => {
          const harn = harness();
          harn.makeServerStarted();
          harn.makeClient("some_tcid");
          harn.makeFeedOpen(
            "some_tcid",
            "some_feed",
            { feed: "args" },
            { feed: "data" }
          );
          let fcres;
          harn.server.once("feedClose", (req, res) => {
            fcres = res;
          });

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

          harn.transport.mockClear();
          fcres.success();

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

          harn.transport.mockClear();
          try {
            fcres.success();
          } catch (e) {} // eslint-disable-line no-empty
          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("should have appropriate errors and return values", () => {
          const harn = harness();
          harn.makeServerStarted();
          harn.makeClient("some_tcid");
          harn.makeFeedOpen(
            "some_tcid",
            "some_feed",
            { feed: "args" },
            { feed: "data" }
          );
          let fcres;
          harn.server.once("feedClose", (req, res) => {
            fcres = res;
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

          expect(fcres.success()).toBeUndefined();

          expect(() => {
            fcres.success();
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The feedCloseResponse.success() method has already been called."
            )
          );
        });
      });

      describe("if next the client disconnects and then the app calls fcres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
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
          expect(serverListener.feedClose.mock.calls.length).toBe(1);
          expect(serverListener.feedClose.mock.calls[0].length).toBe(2);
          expect(serverListener.feedClose.mock.calls[0][0]).toBeInstanceOf(
            Object
          );
          expect(serverListener.feedClose.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.feedClose.mock.calls[0][0].feedName).toBe(
            "some_feed"
          );
          expect(serverListener.feedClose.mock.calls[0][0].feedArgs).toEqual({
            feed: "args"
          });
          expect(serverListener.feedClose.mock.calls[0][1]).toBeInstanceOf(
            Object
          );
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const fcres = serverListener.feedClose.mock.calls[0][1];

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          serverListener.mockClear();
          fcres.success();

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

          serverListener.mockClear();
          try {
            fcres.success();
          } catch (e) {} // eslint-disable-line no-empty
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

        // Transport

        it("should operate appropriately on the transport", () => {
          const harn = harness();
          harn.makeServerStarted();
          harn.makeClient("some_tcid");
          harn.makeFeedOpen(
            "some_tcid",
            "some_feed",
            { feed: "args" },
            { feed: "data" }
          );
          let fcres;
          harn.server.once("feedClose", (req, res) => {
            fcres = res;
          });

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

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          harn.transport.mockClear();
          fcres.success();

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            fcres.success();
          } catch (e) {} // eslint-disable-line no-empty
          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("should have appropriate errors and return values", () => {
          const harn = harness();
          harn.makeServerStarted();
          harn.makeClient("some_tcid");
          harn.makeFeedOpen(
            "some_tcid",
            "some_feed",
            { feed: "args" },
            { feed: "data" }
          );
          let fcres;
          harn.server.once("feedClose", (req, res) => {
            fcres = res;
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

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          expect(fcres.success()).toBeUndefined();

          expect(() => {
            fcres.success();
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The feedCloseResponse.success() method has already been called."
            )
          );
        });
      });

      describe("if next the server becomes stopping and then the app calls fcres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
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
          expect(serverListener.feedClose.mock.calls.length).toBe(1);
          expect(serverListener.feedClose.mock.calls[0].length).toBe(2);
          expect(serverListener.feedClose.mock.calls[0][0]).toBeInstanceOf(
            Object
          );
          expect(serverListener.feedClose.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.feedClose.mock.calls[0][0].feedName).toBe(
            "some_feed"
          );
          expect(serverListener.feedClose.mock.calls[0][0].feedArgs).toEqual({
            feed: "args"
          });
          expect(serverListener.feedClose.mock.calls[0][1]).toBeInstanceOf(
            Object
          );
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const fcres = serverListener.feedClose.mock.calls[0][1];

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          serverListener.mockClear();
          fcres.success();

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

          serverListener.mockClear();
          try {
            fcres.success();
          } catch (e) {} // eslint-disable-line no-empty
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

        // Transport

        it("should operate appropriately on the transport", () => {
          const harn = harness();
          harn.makeServerStarted();
          harn.makeClient("some_tcid");
          harn.makeFeedOpen(
            "some_tcid",
            "some_feed",
            { feed: "args" },
            { feed: "data" }
          );
          let fcres;
          harn.server.once("feedClose", (req, res) => {
            fcres = res;
          });

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

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          harn.transport.mockClear();
          fcres.success();

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            fcres.success();
          } catch (e) {} // eslint-disable-line no-empty
          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("should have appropriate errors and return values", () => {
          const harn = harness();
          harn.makeServerStarted();
          harn.makeClient("some_tcid");
          harn.makeFeedOpen(
            "some_tcid",
            "some_feed",
            { feed: "args" },
            { feed: "data" }
          );
          let fcres;
          harn.server.once("feedClose", (req, res) => {
            fcres = res;
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

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          expect(fcres.success()).toBeUndefined();

          expect(() => {
            fcres.success();
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The feedCloseResponse.success() method has already been called."
            )
          );
        });
      });
    });

    describe("if the feed is terminated (no emission)", () => {
      // Events

      it("should emit appropriately", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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

      // Transport

      it("should operate appropriately on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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

      // Errors and return values - N/A
    });
  });
});
