import harness from "./index.harness";

describe("When the transport emits a valid Handshake message", () => {
  describe("if there is no handshake listener", () => {
    describe("if the version is incompatible", () => {
      // Events

      it("should emit no events", () => {
        const harn = harness({
          handshakeMs: 0, // Don't leave a pending timer (Jest warns)
        });
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.server.emit = jest.fn(); // Can't listen
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["X.X"],
          }),
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should return HandshakeResponse indicating failure", () => {
        const harn = harness({
          handshakeMs: 0, // Don't leave a pending timer (Jest warns)
        });
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.transport.mockClear();
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["X.X"],
          }),
        );

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "HandshakeResponse",
          Success: false,
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("if the version is compatible", () => {
      // Events

      it("should emit no events", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.server.emit = jest.fn(); // Can't listen
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["0.1"],
          }),
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should return HandshakeResponse indicating success", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.transport.mockClear();
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["0.1"],
          }),
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
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("if the version is incompatible and then later compatible", () => {
      // Events

      it("should emit no events", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["X.X"],
          }),
        );

        harn.server.emit = jest.fn(); // Can't listen
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["0.1"],
          }),
        );

        expect(harn.server.emit.mock.calls.length).toBe(0);
      });

      // Transport

      it("should return HandshakeResponse indicating success", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["X.X"],
          }),
        );

        harn.transport.mockClear();
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["0.1"],
          }),
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
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });
  });

  describe("if there is a handshake listener", () => {
    describe("if the version is incompatible", () => {
      // Events

      it("should emit no events", () => {
        const harn = harness({
          handshakeMs: 0, // Don't leave a pending timer (Jest warns)
        });
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        const serverListener = harn.createServerListener();
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["X.X"],
          }),
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

      it("should return HandshakeResponse indicating failure", () => {
        const harn = harness({
          handshakeMs: 0, // Don't leave a pending timer (Jest warns)
        });
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        harn.transport.mockClear();
        harn.transport.emit(
          "message",
          "some_tcid",
          JSON.stringify({
            MessageType: "Handshake",
            Versions: ["X.X"],
          }),
        );

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "HandshakeResponse",
          Success: false,
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("if the version is compatible", () => {
      describe("if next the app calls hres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let cid;
          harn.server.once("connect", (c) => {
            cid = c;
          });
          harn.transport.emit("connect", "some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(serverListener.starting.mock.calls.length).toBe(0);
          expect(serverListener.start.mock.calls.length).toBe(0);
          expect(serverListener.stopping.mock.calls.length).toBe(0);
          expect(serverListener.stop.mock.calls.length).toBe(0);
          expect(serverListener.connect.mock.calls.length).toBe(0);
          expect(serverListener.handshake.mock.calls.length).toBe(1);
          expect(serverListener.handshake.mock.calls[0].length).toBe(2);
          expect(serverListener.handshake.mock.calls[0][0]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.handshake.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.handshake.mock.calls[0][1]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.action.mock.calls.length).toBe(0);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const hres = serverListener.handshake.mock.calls[0][1];

          serverListener.mockClear();
          hres.success();

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
            hres.success();
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

        it("should make appropriate transport calls", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          hres.success();

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "HandshakeResponse",
            Success: true,
            Version: "0.1",
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            hres.success();
          } catch (e) {} // eslint-disable-line no-empty

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("response object should behave appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(hres.success()).toBeUndefined();

          expect(() => {
            hres.success();
          }).toThrow(
            "ALREADY_RESPONDED: The success() method has already been called.",
          );
        });
      });

      describe("if next the client disconnects and then the app calls hres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let cid;
          harn.server.once("connect", (c) => {
            cid = c;
          });
          harn.transport.emit("connect", "some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(serverListener.starting.mock.calls.length).toBe(0);
          expect(serverListener.start.mock.calls.length).toBe(0);
          expect(serverListener.stopping.mock.calls.length).toBe(0);
          expect(serverListener.stop.mock.calls.length).toBe(0);
          expect(serverListener.connect.mock.calls.length).toBe(0);
          expect(serverListener.handshake.mock.calls.length).toBe(1);
          expect(serverListener.handshake.mock.calls[0].length).toBe(2);
          expect(serverListener.handshake.mock.calls[0][0]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.handshake.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.handshake.mock.calls[0][1]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.action.mock.calls.length).toBe(0);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const hres = serverListener.handshake.mock.calls[0][1];

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ..."),
          );

          serverListener.mockClear();
          hres.success();

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
            hres.success();
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

        it("should make appropriate transport calls", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ..."),
          );

          harn.transport.mockClear();
          hres.success();

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            hres.success();
          } catch (e) {} // eslint-disable-line no-empty

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("response object should behave appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("FAILURE: ..."),
          );

          expect(hres.success()).toBeUndefined();

          expect(() => {
            hres.success();
          }).toThrow(
            "ALREADY_RESPONDED: The success() method has already been called.",
          );
        });
      });

      describe("if next the server stops and then the app calls hres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let cid;
          harn.server.once("connect", (c) => {
            cid = c;
          });
          harn.transport.emit("connect", "some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(serverListener.starting.mock.calls.length).toBe(0);
          expect(serverListener.start.mock.calls.length).toBe(0);
          expect(serverListener.stopping.mock.calls.length).toBe(0);
          expect(serverListener.stop.mock.calls.length).toBe(0);
          expect(serverListener.connect.mock.calls.length).toBe(0);
          expect(serverListener.handshake.mock.calls.length).toBe(1);
          expect(serverListener.handshake.mock.calls[0].length).toBe(2);
          expect(serverListener.handshake.mock.calls[0][0]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.handshake.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.handshake.mock.calls[0][1]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.action.mock.calls.length).toBe(0);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const hres = serverListener.handshake.mock.calls[0][1];

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ..."),
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          serverListener.mockClear();
          hres.success();

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
            hres.success();
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

        it("should make appropriate transport calls", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ..."),
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          harn.transport.mockClear();
          hres.success();

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            hres.success();
          } catch (e) {} // eslint-disable-line no-empty

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("response object should behave appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          harn.transport.emit(
            "disconnect",
            "some_tcid",
            new Error("STOPPING: ..."),
          );
          harn.transport.state.mockReturnValue("stopping");
          harn.transport.emit("stopping", new Error("FAILURE: ..."));

          expect(hres.success()).toBeUndefined();

          expect(() => {
            hres.success();
          }).toThrow(
            "ALREADY_RESPONDED: The success() method has already been called.",
          );
        });
      });
    });

    describe("if the version is incompatible and then later compatible", () => {
      describe("if next the app calls hres.success() and then again", () => {
        // Events

        it("should emit appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let cid;
          harn.server.once("connect", (c) => {
            cid = c;
          });
          harn.transport.emit("connect", "some_tcid");

          const serverListener = harn.createServerListener();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["X.X"],
            }),
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

          serverListener.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(serverListener.starting.mock.calls.length).toBe(0);
          expect(serverListener.start.mock.calls.length).toBe(0);
          expect(serverListener.stopping.mock.calls.length).toBe(0);
          expect(serverListener.stop.mock.calls.length).toBe(0);
          expect(serverListener.connect.mock.calls.length).toBe(0);
          expect(serverListener.handshake.mock.calls.length).toBe(1);
          expect(serverListener.handshake.mock.calls[0].length).toBe(2);
          expect(serverListener.handshake.mock.calls[0][0]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.handshake.mock.calls[0][0].clientId).toBe(cid);
          expect(serverListener.handshake.mock.calls[0][1]).toBeInstanceOf(
            Object,
          );
          expect(serverListener.action.mock.calls.length).toBe(0);
          expect(serverListener.feedOpen.mock.calls.length).toBe(0);
          expect(serverListener.feedClose.mock.calls.length).toBe(0);
          expect(serverListener.disconnect.mock.calls.length).toBe(0);
          expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
          expect(serverListener.transportError.mock.calls.length).toBe(0);

          const hres = serverListener.handshake.mock.calls[0][1];

          serverListener.mockClear();
          hres.success();

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
            hres.success();
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

        it("should make appropriate transport calls", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["X.X"],
            }),
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "HandshakeResponse",
            Success: false,
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          hres.success();

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(1);
          expect(harn.transport.send.mock.calls[0].length).toBe(2);
          expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
          expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
            MessageType: "HandshakeResponse",
            Success: true,
            Version: "0.1",
          });
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);

          harn.transport.mockClear();
          try {
            hres.success();
          } catch (e) {} // eslint-disable-line no-empty

          expect(harn.transport.start.mock.calls.length).toBe(0);
          expect(harn.transport.stop.mock.calls.length).toBe(0);
          expect(harn.transport.send.mock.calls.length).toBe(0);
          expect(harn.transport.disconnect.mock.calls.length).toBe(0);
        });

        // Errors and return values

        it("response object should behave appropriately", () => {
          const harn = harness();
          harn.makeServerStarted();
          let hres;
          harn.server.once("handshake", (req, res) => {
            hres = res;
          });
          harn.transport.emit("connect", "some_tcid");

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["X.X"],
            }),
          );

          harn.transport.emit(
            "message",
            "some_tcid",
            JSON.stringify({
              MessageType: "Handshake",
              Versions: ["0.1"],
            }),
          );

          expect(hres.success()).toBeUndefined();

          expect(() => {
            hres.success();
          }).toThrow(
            "ALREADY_RESPONDED: The success() method has already been called.",
          );
        });
      });

      // No need to test disconnect/stopping during handshake processing again
    });
  });
});
