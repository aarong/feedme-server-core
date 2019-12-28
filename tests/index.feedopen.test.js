import harness from "./index.harness";

describe("When the transport emits a valid FeedOpen message", () => {
  describe("if there is no feedOpen listener", () => {
    describe("if the feed is closed", () => {
      // Events

      it("should emit nothing", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        harn.server.emit = jest.fn(); // Can't create server listener
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "FeedOpen",
            FeedName: "some_feed",
            FeedArgs: { feed: "args" }
          })
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should return FeedOpenResponse indicating failure", () => {
        const harn = harness();
        harn.makeServerStarted();
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
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "FeedOpenResponse",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" },
          Success: false,
          ErrorCode: "INTERNAL_ERROR",
          ErrorData: {}
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });

      // Errors and return values - N/A
    });

    describe("if the feed is terminated", () => {
      // Events

      it("should emit nothing", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

        harn.server.emit = jest.fn(); // Can't create server listener
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "FeedOpen",
            FeedName: "some_feed",
            FeedArgs: { feed: "args" }
          })
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should return FeedOpenResponse indicating failure", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "FeedOpenResponse",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" },
          Success: false,
          ErrorCode: "INTERNAL_ERROR",
          ErrorData: {}
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });

      // Errors and return values - N/A
    });
  });

  describe("if there is a feedOpen listener", () => {
    describe("if the feed is closed", () => {
      describe("if there is no disconnect/stoppage during processing", () => {
        describe("if next the app calls fores.success() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.success({ feed: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: true,
              FeedData: { feed: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.success() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: true,
              FeedData: { feed: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.success({ feed: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: false,
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: false,
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });
      });

      describe("if next the client disconnects", () => {
        describe("if next the app calls fores.success() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.success({ feed: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.success() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.success({ feed: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
                FeedName: "some_feed",
                FeedArgs: { feed: "args" }
              })
            );

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });
      });

      describe("if next the server becomes stopping", () => {
        describe("if next the app calls fores.success() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.success({ feed: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
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

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.success() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
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

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.success({ feed: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
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

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });
            harn.makeServerStarted();
            harn.makeClient("some_tcid");

            harn.transport.emit(
              "message",
              "some_tcid",
              JSON.stringify({
                MessageType: "FeedOpen",
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

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });
      });
    });

    describe("if the feed is terminated", () => {
      describe("if there is no disconnect/stoppage during processing", () => {
        describe("if next the app calls fores.success() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.success({ feed: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: true,
              FeedData: { feed: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.success() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: true,
              FeedData: { feed: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.success({ feed: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: false,
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(1);
            expect(harn.transport.send.mock.calls[0].length).toBe(2);
            expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
            expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
              MessageType: "FeedOpenResponse",
              FeedName: "some_feed",
              FeedArgs: { feed: "args" },
              Success: false,
              ErrorCode: "SOME_ERROR",
              ErrorData: { error: "data" }
            });
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });
      });

      describe("if next the client disconnects", () => {
        describe("if next the app calls fores.success() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.success({ feed: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.success() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.success({ feed: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("FAILURE: ...")
            );

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });
      });

      describe("if next the server becomes stopping", () => {
        describe("if next the app calls fores.success() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.success({ feed: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.success() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.success({ feed: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            let fores;
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.success({ feed: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            expect(fores.success({ feed: "data" })).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.success()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.success({ feed: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.success({ feed: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.success({ feed: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });

        describe("if next the app calls fores.failure() and then fores.failure()", () => {
          // Events

          it("should emit appropriately", () => {
            const harn = harness();
            harn.makeServerStarted();
            const cid = harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

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
            expect(serverListener.feedOpen.mock.calls.length).toBe(1);
            expect(serverListener.feedOpen.mock.calls[0].length).toBe(2);
            expect(serverListener.feedOpen.mock.calls[0][0]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedOpen.mock.calls[0][0].clientId).toBe(cid);
            expect(serverListener.feedOpen.mock.calls[0][0].feedName).toBe(
              "some_feed"
            );
            expect(serverListener.feedOpen.mock.calls[0][0].feedArgs).toEqual({
              feed: "args"
            });
            expect(serverListener.feedOpen.mock.calls[0][1]).toBeInstanceOf(
              Object
            );
            expect(serverListener.feedClose.mock.calls.length).toBe(0);
            expect(serverListener.disconnect.mock.calls.length).toBe(0);
            expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
            expect(serverListener.transportError.mock.calls.length).toBe(0);

            const fores = serverListener.feedOpen.mock.calls[0][1];

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            serverListener.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

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
              fores.failure("SOME_ERROR", { error: "data" });
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
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
            });

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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            harn.transport.mockClear();
            fores.failure("SOME_ERROR", { error: "data" });

            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);

            harn.transport.mockClear();
            try {
              fores.failure("SOME_ERROR", { error: "data" });
            } catch (e) {} // eslint-disable-line no-empty
            expect(harn.transport.start.mock.calls.length).toBe(0);
            expect(harn.transport.stop.mock.calls.length).toBe(0);
            expect(harn.transport.send.mock.calls.length).toBe(0);
            expect(harn.transport.disconnect.mock.calls.length).toBe(0);
          });

          // Errors and return values

          it("should have appropriate return values/errors", () => {
            const harn = harness();
            harn.makeServerStarted();
            harn.makeClient("some_tcid");
            harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });
            let fores;
            harn.server.once("feedOpen", (req, res) => {
              fores = res;
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

            harn.transport.emit(
              "disconnect",
              "some_tcid",
              new Error("STOPPING: ...")
            );
            harn.transport.state.mockReturnValue("stopping");
            harn.transport.emit("stopping", new Error("FAILURE: ..."));

            expect(
              fores.failure("SOME_ERROR", { error: "data" })
            ).toBeUndefined();

            expect(() => {
              fores.failure("SOME_ERROR", { error: "data" });
            }).toThrow(
              "ALREADY_RESPONDED: The success() or failure() method has already been called."
            );
          });
        });
      });
    });
  });
});
