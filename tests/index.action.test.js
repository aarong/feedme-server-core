import harness from "./index.harness";

describe("When the transport emits a valid Action message", () => {
  describe("if there is no action listener", () => {
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
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "abc"
        })
      );

      expect(harn.server.emit.mock.calls.length).toBe(0);
    });

    // Transport

    it("should return ActionResponse indicating failure", () => {
      const harn = harness();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");

      harn.transport.mockClear();
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "abc"
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
        ErrorCode: "INTERNAL_ERROR",
        ErrorData: {},
        CallbackId: "abc"
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);
    });

    // Errors and return values - N/A
  });

  describe("if there is an action listener", () => {
    describe("if there is no disconnect/stoppage during processing", () => {
      describe("if next the app calls ares.success() and then ares.success()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          serverListener.mockClear();
          ares.success({ action: "data" });

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
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          ares.success({ action: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "ActionResponse",
            Success: true,
            ActionData: { action: "data" },
            CallbackId: "abc"
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(ares.success({ action: "data" })).toBeUndefined();

          expect(() => {
            ares.success({ action: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.success() and then ares.failure()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          serverListener.mockClear();
          ares.success({ action: "data" });

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
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          ares.success({ action: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "ActionResponse",
            Success: true,
            ActionData: { action: "data" },
            CallbackId: "abc"
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(ares.success({ action: "data" })).toBeUndefined();

          expect(() => {
            ares.failure("SOME_ERROR", { error: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.failure() and then ares.success()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          serverListener.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

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
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "ActionResponse",
            Success: false,
            ErrorCode: "SOME_ERROR",
            ErrorData: { error: "data" },
            CallbackId: "abc"
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(ares.failure("SOME_ERROR", { error: "data" })).toBeUndefined();

          expect(() => {
            ares.success({ action: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.failure() and then ares.failure()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          serverListener.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

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
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "ActionResponse",
            Success: false,
            ErrorCode: "SOME_ERROR",
            ErrorData: { error: "data" },
            CallbackId: "abc"
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          expect(ares.failure("SOME_ERROR", { error: "data" })).toBeUndefined();

          expect(() => {
            ares.failure("SOME_ERROR", { error: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });
    });

    describe("if next the client disconnects", () => {
      describe("if next the app calls ares.success() and then ares.success()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          serverListener.mockClear();
          ares.success({ action: "data" });

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
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.success({ action: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          expect(ares.success({ action: "data" })).toBeUndefined();

          expect(() => {
            ares.success({ action: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.success() and then ares.failure()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          serverListener.mockClear();
          ares.success({ action: "data" });

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
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.success({ action: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          expect(ares.success({ action: "data" })).toBeUndefined();

          expect(() => {
            ares.failure("SOME_ERROR", { error: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.failure() and then ares.success()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          serverListener.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

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
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.failure("SOME_ERROR", { error: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          expect(ares.failure("SOME_ERROR", { error: "data" })).toBeUndefined();

          expect(() => {
            ares.success({ action: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.failure() and then ares.failure()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          serverListener.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

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
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.failure("SOME_ERROR", { error: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ...")
          );

          expect(ares.failure("SOME_ERROR", { error: "data" })).toBeUndefined();

          expect(() => {
            ares.failure("SOME_ERROR", { error: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });
    });

    describe("if next the server becomes stopping", () => {
      describe("if next the app calls ares.success() and then ares.success()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          serverListener.mockClear();
          ares.success({ action: "data" });

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
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.success({ action: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          expect(ares.success({ action: "data" })).toBeUndefined();

          expect(() => {
            ares.success({ action: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.success() and then ares.failure()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          serverListener.mockClear();
          ares.success({ action: "data" });

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
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.success({ action: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          expect(ares.success({ action: "data" })).toBeUndefined();

          expect(() => {
            ares.failure("SOME_ERROR", { error: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.failure() and then ares.success()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          serverListener.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

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
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.failure("SOME_ERROR", { error: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.success({ action: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          expect(ares.failure("SOME_ERROR", { error: "data" })).toBeUndefined();

          expect(() => {
            ares.success({ action: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });

      describe("if next the app calls ares.failure() and then ares.failure()", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          const cid = harn.makeClient("some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

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
          expect(serverListener.action.mock.calls[0][0].actionName).toBe(
            "some_action"
          );
          expect(serverListener.action.mock.calls[0][0].actionArgs).toEqual({
            action: "args"
          });
          expect(serverListener.action.mock.calls[0][1]).toBeInstanceOf(Object);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          serverListener.mockClear();
          ares.failure("SOME_ERROR", { error: "data" });

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
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
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
          ares.failure("SOME_ERROR", { error: "data" });

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            ares.failure("SOME_ERROR", { error: "data" });
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
          let ares;
          harn.server.on("action", (req, res) => {
            ares = res;
          });
          harn.makeClient("some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Action",
              ActionName: "some_action",
              ActionArgs: { action: "args" },
              CallbackId: "abc"
            })
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ...")
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          expect(ares.failure("SOME_ERROR", { error: "data" })).toBeUndefined();

          expect(() => {
            ares.failure("SOME_ERROR", { error: "data" });
          }).toThrow(
            new Error(
              "ALREADY_RESPONDED: The actionResponse.success() or actionResponse.failure() method has already been called."
            )
          );
        });
      });
    });
  });
});
