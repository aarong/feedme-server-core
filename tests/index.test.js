import _ from "lodash";
import check from "check-types";
import harness from "./index.harness";
import feedmeServerCore from "../build";
import config from "../src/config";

/*
Build integration/functional tests.

Tests API promises in the user documentation, ensures that the server
interacts appropriately with the transport, and ensures that messages
sent via the transport abide by the Feedme spec.

1. Do configuration options work as documented?

2. Do app-initiated operations work as documented?

3. Do transport-initiated operations work as documented?

*/

jest.useFakeTimers();
const epsilon = 1;

/*

Configuration options.

*/

describe("The handshakeMs option", () => {
  describe("if set to 0", () => {
    it("should not time out if no message/disconnect/stoppage", () => {
      const handshakeMs = 0;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should not time out if failed handshake messages", () => {
      const handshakeMs = 0;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Failed handshakes
      harn.transport.emit("message", "some_tcid", "junk");

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1); // Details irrelevant
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if there is a successful handshake - processing", () => {
      // serverListener will leave handshake in processing state
      const handshakeMs = 0;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client handshake
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if there is a successful handshake - complete", () => {
      // serverListener would leave handshake in processing state, so attach
      // another listener to return success to make it complete
      const handshakeMs = 0;
      const harn = harness({ handshakeMs });
      harn.server.on("handshake", (hsreq, hres) => {
        hres.success();
      });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client handshake
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1); // Details irrelevant
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if client disconnects", () => {
      const handshakeMs = 0;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client disconnect
      harn.transport.emit("disconnect", "some_tcid", new Error("FAILURE: ..."));

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if server becomes stopping", () => {
      const handshakeMs = 0;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Server stopping (transport required to emit disconnect)
      harn.transport.emit("disconnect", "some_tcid", new Error("FAILURE: ..."));
      harn.transport.emit("stopping", new Error("FAILURE: ..."));

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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
  });

  describe("if set greater than zero", () => {
    it("should time out if no message/disconnect/stoppage", () => {
      const handshakeMs = 123;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      let cid;
      harn.server.once("connect", c => {
        cid = c;
      });
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock to just before the timeout
      jest.advanceTimersByTime(handshakeMs - epsilon);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock to just after the timeout
      jest.advanceTimersByTime(2 * epsilon);

      // Check transport calls
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

      // Transport required to emit a disconnect event
      harn.transport.emit(
        "disconnect",
        "some_tcid",
        new Error(
          "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
        )
      );

      // Check server events
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
        "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
      );
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run to the end of time
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should time out if failed handshake messages", () => {
      const handshakeMs = 123;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      let cid;
      harn.server.once("connect", c => {
        cid = c;
      });
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Failed handshakes
      harn.transport.emit("message", "some_tcid", "junk");

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1); // Details irrelevant
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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
      expect(serverListener.badClientMessage.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock to just before the timeout
      jest.advanceTimersByTime(handshakeMs - epsilon);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock to just after the timeout
      jest.advanceTimersByTime(2 * epsilon);

      // Check transport calls
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

      // Transport required to emit a disconnect event
      harn.transport.emit(
        "disconnect",
        "some_tcid",
        new Error(
          "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
        )
      );

      // Check server events
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
        "HANDSHAKE_TIMEOUT: The client did not complete a handshake within the configured amount of time."
      );
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run to the end of time
      jest.advanceTimersByTime(Math.MAX_SAFE_INTEGER);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if there is a successful handshake within the window - processing", () => {
      // serverListener will leave handshake in processing state
      const handshakeMs = 123;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client handshake
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if there is a successful handshake within the window - complete", () => {
      // serverListener would leave handshake in processing state, so attach
      // another listener to return success to make it complete
      const handshakeMs = 123;
      const harn = harness({ handshakeMs });
      harn.server.on("handshake", (hsreq, hres) => {
        hres.success();
      });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client handshake
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "Handshake",
          Versions: ["0.1"]
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1); // Details irrelevant
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if client disconnects", () => {
      const handshakeMs = 123;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client disconnect
      harn.transport.emit("disconnect", "some_tcid", new Error("FAILURE: ..."));

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

    it("should do nothing if server becomes stopping", () => {
      const handshakeMs = 123;
      const harn = harness({ handshakeMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.transport.emit("connect", "some_tcid");

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Server stopping (transport required to emit disconnect)
      harn.transport.emit("disconnect", "some_tcid", new Error("FAILURE: ..."));
      harn.transport.emit("stopping", new Error("FAILURE: ..."));

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.handshakeMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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
  });
});

describe("The terminationMs option", () => {
  describe("if set to 0", () => {
    it("should accept FeedClose messages indefinitely after termination", () => {
      const harn = harness({ terminationMs: 0 });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.terminationMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client submits a FeedClose message
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      // Check transport calls
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

      // Check server events
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

    it("should accept FeedOpen messages indefinitely after termination", () => {
      const harn = harness({ terminationMs: 0 });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.terminationMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client submits a FeedOpen message
      const feedOpenListener = jest.fn();
      harn.server.once("feedOpen", feedOpenListener);
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Return success on fores
      const fores = feedOpenListener.mock.calls[0][1];
      fores.success({ feed: "data" });

      // Check transport calls
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

      // Check server events
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
  });
  describe("if set greater than 0", () => {
    it("should accept FeedClose messages up to termination", () => {
      const terminationMs = 123;
      const harn = harness({ terminationMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(terminationMs - epsilon);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client submits a FeedClose message
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      // Check transport calls
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

      // Check server events
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

    it("should reject FeedClose messages after termination", () => {
      const terminationMs = 123;
      const harn = harness({ terminationMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      const cid = harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(terminationMs + epsilon);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client submits a FeedClose message
      const msg = JSON.stringify({
        MessageType: "FeedClose",
        FeedName: "some_feed",
        FeedArgs: { feed: "args" }
      });
      harn.transport.emit("message", "some_tcid", msg);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(1);
      expect(harn.transport.send.mock.calls[0].length).toBe(2);
      expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
        MessageType: "ViolationResponse",
        Diagnostics: {
          Message: msg,
          Problem: "Unexpected FeedClose message."
        }
      });
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    it("should accept FeedOpen messages up to termination", () => {
      const terminationMs = 123;
      const harn = harness({ terminationMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(terminationMs - epsilon);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client submits a FeedOpen message
      const feedOpenListener = jest.fn();
      harn.server.once("feedOpen", feedOpenListener);
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Return success on fores
      const fores = feedOpenListener.mock.calls[0][1];
      fores.success({ feed: "data" });

      // Check transport calls
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

      // Check server events
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

    it("should accept FeedOpen messages after termination", () => {
      const terminationMs = 123;
      const harn = harness({ terminationMs });
      const serverListener = harn.createServerListener();
      harn.makeServerStarted();
      harn.makeClient("some_tcid");
      harn.makeFeedTerminated("some_tcid", "some_feed", { feed: "args" });

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Run the clock
      jest.advanceTimersByTime(config.defaults.terminationMs);

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
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

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Client submits a FeedOpen message
      const feedOpenListener = jest.fn();
      harn.server.once("feedOpen", feedOpenListener);
      harn.transport.emit(
        "message",
        "some_tcid",
        JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        })
      );

      // Check transport calls
      expect(harn.transport.start.mock.calls.length).toBe(0);
      expect(harn.transport.stop.mock.calls.length).toBe(0);
      expect(harn.transport.send.mock.calls.length).toBe(0);
      expect(harn.transport.disconnect.mock.calls.length).toBe(0);

      // Check server events
      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.connect.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(1); // Details irrelevant
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);

      // Reset mock transport and server listener
      harn.transport.mockClear();
      serverListener.mockClear();

      // Return success on fores
      const fores = feedOpenListener.mock.calls[0][1];
      fores.success({ feed: "data" });

      // Check transport calls
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

      // Check server events
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
  });
});

/*

App-initiated operations.

Tested only under the default configuration.

For each result path, check
  - Errors and return values
      Don't test for invalid arguments - that's in the unit tests
  - State function return values/errors (none - server.state() is trivial)
  - Events
  - Transport calls
  - Callbacks (none)

*/

describe("The factory function", () => {
  // Errors and return values

  it("should throw on invalid options (missing)", () => {
    expect(() => {
      feedmeServerCore();
    }).toThrow("INVALID_ARGUMENT: Invalid options argument.");
  });

  it("should throw on invalid options (type)", () => {
    expect(() => {
      feedmeServerCore("junk");
    }).toThrow("INVALID_ARGUMENT: Invalid options argument.");
  });

  it("should throw on invalid transport (missing)", () => {
    expect(() => {
      feedmeServerCore({});
    }).toThrow("INVALID_ARGUMENT: Invalid options.transport.");
  });

  it("should throw on invalid transport (type)", () => {
    expect(() => {
      feedmeServerCore({ transport: "junk" });
    }).toThrow("INVALID_ARGUMENT: Invalid options.transport.");
  });

  it("should throw on invalid transport (API)", () => {
    expect(() => {
      feedmeServerCore({ transport: {} });
    }).toThrow(
      "INVALID_ARGUMENT: The supplied transport does not implement the required API."
    );
  });

  it("should throw on invalid transport (not stopped)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "starting",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        handshakeMs: {}
      });
    }).toThrow("INVALID_ARGUMENT: The supplied transport is not stopped.");
  });

  it("should throw on invalid handshakeMs (type)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "stopped",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        handshakeMs: {}
      });
    }).toThrow("INVALID_ARGUMENT: Invalid options.handshakeMs.");
  });

  it("should throw on invalid handshakeMs (decimal)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "stopped",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        handshakeMs: 1.5
      });
    }).toThrow("INVALID_ARGUMENT: Invalid options.handshakeMs.");
  });

  it("should throw on invalid handshakeMs (negative)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "stopped",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        handshakeMs: -1
      });
    }).toThrow("INVALID_ARGUMENT: Invalid options.handshakeMs.");
  });

  it("should throw on invalid feedTerminationMs (type)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "stopped",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        terminationMs: {}
      });
    }).toThrow("INVALID_ARGUMENT: Invalid options.terminationMs.");
  });

  it("should throw on invalid feedTerminationMs (decimal)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "stopped",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        terminationMs: 1.5
      });
    }).toThrow("INVALID_ARGUMENT: Invalid options.terminationMs.");
  });

  it("should throw on invalid feedTerminationMs (negative)", () => {
    expect(() => {
      feedmeServerCore({
        transport: {
          on: () => {},
          emit: () => {},
          state: () => "stopped",
          start: () => {},
          stop: () => {},
          send: () => {},
          disconnect: () => {}
        },
        terminationMs: -1
      });
    }).toThrow("INVALID_ARGUMENT: Invalid options.terminationMs.");
  });

  it("should return an object", () => {
    expect(
      check.object(
        feedmeServerCore({
          transport: {
            on: () => {},
            emit: () => {},
            state: () => "stopped",
            start: () => {},
            stop: () => {},
            send: () => {},
            disconnect: () => {}
          }
        })
      )
    ).toBe(true);
  });

  // Events - N/A

  // Transport calls

  it("should do nothing on the transport", () => {
    const t = {
      on: () => {},
      emit: () => {},
      state: () => "stopped",
      start: jest.fn(),
      stop: jest.fn(),
      send: jest.fn(),
      disconnect: jest.fn()
    };
    feedmeServerCore({
      transport: t
    });
    expect(t.start.mock.calls.length).toBe(0);
    expect(t.stop.mock.calls.length).toBe(0);
    expect(t.send.mock.calls.length).toBe(0);
    expect(t.disconnect.mock.calls.length).toBe(0);
  });
});

describe("The server.start() function", () => {
  // Errors and return values

  it("should throw if the server is starting", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    expect(() => {
      harn.server.start();
    }).toThrow("INVALID_STATE: The server is not stopped.");
  });

  it("should throw if the server is started", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    expect(() => {
      harn.server.start();
    }).toThrow("INVALID_STATE: The server is not stopped.");
  });

  it("should throw if the server is stopping", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping");
    expect(() => {
      harn.server.start();
    }).toThrow("INVALID_STATE: The server is not stopped.");
  });

  it("should return success if the server is stopped (never started)", () => {
    const harn = harness();
    harn.server.start();
    expect(harn.server.start()).toBeUndefined();
  });

  it("should return success if the server is stopped (previously started)", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping");
    harn.transport.state.mockReturnValue("stopped");
    harn.transport.emit("stop");
    expect(harn.server.start()).toBeUndefined();
  });

  // Events

  it("should make correct emissions through the stopped/starting/started/stopping/starting cycle", () => {
    const harn = harness();

    // Starting
    const serverListener = harn.createServerListener();
    harn.server.start();
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

    // Start
    serverListener.mockClear();
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

    // Stopping
    serverListener.mockClear();
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

    // Stop
    serverListener.mockClear();
    harn.transport.state.mockReturnValue("stopped");
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

    // Starting
    harn.server.start();
    serverListener.mockClear();
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
});

describe("The server.stop() function", () => {
  // Errors and return values

  it("should throw if the server is stopped", () => {
    const harn = harness();
    expect(() => {
      harn.server.stop();
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should throw if the server is starting", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    expect(() => {
      harn.server.stop();
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should throw if the server is stopping", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));
    expect(() => {
      harn.server.stop();
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should return success if the server is started", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    expect(harn.server.stop()).toBeUndefined();
  });

  // Events - Emissions through the cycle are tested above for server.start()

  // Transport calls

  it("should call transport.stop()", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");

    harn.transport.mockClear();
    harn.server.stop();

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(1);
    expect(harn.transport.stop.mock.calls[0].length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

describe("The server.actionRevelation() function", () => {
  // Errors and return values

  it("should throw if the server is stopped", () => {
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

  it("should throw if the server is starting", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
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

  it("should throw if the server is stopping", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));
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

  it("should return success if the server is started", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    expect(
      harn.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: []
      })
    ).toBeUndefined();
  });

  // Events - N/A

  // Transport calls

  it("should send an ActionRevelation message to appropriate clients - no MD5/data", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Feed closed - different feed name open
    harn.makeClient("closed_name");
    harn.makeFeedOpen(
      "closed_name",
      "other_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Feed closed - different feed arg open
    harn.makeClient("closed_args");
    harn.makeFeedOpen(
      "closed_args",
      "some_feed",
      { other: "args" },
      { feed: "data" }
    );

    // Feed opening
    harn.makeClient("opening");
    harn.makeFeedOpening("opening", "some_feed", { feed: "args" });

    // Feed open
    harn.makeClient("open");
    harn.makeFeedOpen("open", "some_feed", { feed: "args" }, { feed: "data" });

    // Feed closing
    harn.makeClient("closing");
    harn.makeFeedClosing("closing", "some_feed", { feed: "args" });

    // Feed terminated
    harn.makeClient("terminated");
    harn.makeFeedTerminated("terminated", "some_feed", { feed: "args" });

    // Revelation
    harn.server.actionRevelation({
      actionName: "some_action",
      actionData: { action: "data" },
      feedName: "some_feed",
      feedArgs: { feed: "args" },
      feedDeltas: [
        {
          Operation: "Set",
          Path: [],
          Value: {
            new: "data"
          }
        }
      ]
    });

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("open");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "ActionRevelation",
      ActionName: "some_action",
      ActionData: { action: "data" },
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      FeedDeltas: [
        {
          Operation: "Set",
          Path: [],
          Value: {
            new: "data"
          }
        }
      ]
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  it("should send an ActionRevelation message to appropriate clients - data", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Feed closed - different feed name open
    harn.makeClient("closed_name");
    harn.makeFeedOpen(
      "closed_name",
      "other_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Feed closed - different feed arg open
    harn.makeClient("closed_args");
    harn.makeFeedOpen(
      "closed_args",
      "some_feed",
      { other: "args" },
      { feed: "data" }
    );

    // Feed opening
    harn.makeClient("opening");
    harn.makeFeedOpening("opening", "some_feed", { feed: "args" });

    // Feed open
    harn.makeClient("open");
    harn.makeFeedOpen("open", "some_feed", { feed: "args" }, { feed: "data" });

    // Feed closing
    harn.makeClient("closing");
    harn.makeFeedClosing("closing", "some_feed", { feed: "args" });

    // Feed terminated
    harn.makeClient("terminated");
    harn.makeFeedTerminated("terminated", "some_feed", { feed: "args" });

    // Revelation
    harn.server.actionRevelation({
      actionName: "some_action",
      actionData: { action: "data" },
      feedName: "some_feed",
      feedArgs: { feed: "args" },
      feedDeltas: [
        {
          Operation: "Set",
          Path: [],
          Value: {
            new: "data"
          }
        }
      ],
      feedData: { new: "data" }
    });

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("open");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "ActionRevelation",
      ActionName: "some_action",
      ActionData: { action: "data" },
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      FeedDeltas: [
        {
          Operation: "Set",
          Path: [],
          Value: {
            new: "data"
          }
        }
      ],
      FeedMd5: "pBTE+QEe33IXncYf8DOPgA==" // Hashing checked in unit tests
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  it("should send an ActionRevelation message to appropriate clients - MD5", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Feed closed - different feed name open
    harn.makeClient("closed_name");
    harn.makeFeedOpen(
      "closed_name",
      "other_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Feed closed - different feed arg open
    harn.makeClient("closed_args");
    harn.makeFeedOpen(
      "closed_args",
      "some_feed",
      { other: "args" },
      { feed: "data" }
    );

    // Feed opening
    harn.makeClient("opening");
    harn.makeFeedOpening("opening", "some_feed", { feed: "args" });

    // Feed open
    harn.makeClient("open");
    harn.makeFeedOpen("open", "some_feed", { feed: "args" }, { feed: "data" });

    // Feed closing
    harn.makeClient("closing");
    harn.makeFeedClosing("closing", "some_feed", { feed: "args" });

    // Feed terminated
    harn.makeClient("terminated");
    harn.makeFeedTerminated("terminated", "some_feed", { feed: "args" });

    // Revelation
    harn.server.actionRevelation({
      actionName: "some_action",
      actionData: { action: "data" },
      feedName: "some_feed",
      feedArgs: { feed: "args" },
      feedDeltas: [
        {
          Operation: "Set",
          Path: [],
          Value: {
            new: "data"
          }
        }
      ],
      feedMd5: "pBTE+QEe33IXncYf8DOPgA=="
    });

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("open");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "ActionRevelation",
      ActionName: "some_action",
      ActionData: { action: "data" },
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      FeedDeltas: [
        {
          Operation: "Set",
          Path: [],
          Value: {
            new: "data"
          }
        }
      ],
      FeedMd5: "pBTE+QEe33IXncYf8DOPgA=="
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

describe("The server.feedTermination() function", () => {
  // Errors and return values

  it("should throw if the server is stopped", () => {
    const harn = harness();
    expect(() => {
      harn.server.feedTermination({
        clientId: "some_client",
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        errorCode: "SOME_ERROR",
        errorData: { error: "data" }
      });
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should throw if the server is starting", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    expect(() => {
      harn.server.feedTermination({
        clientId: "some_client",
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        errorCode: "SOME_ERROR",
        errorData: { error: "data" }
      });
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should throw if the server is stopping", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));
    expect(() => {
      harn.server.feedTermination({
        clientId: "some_client",
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        errorCode: "SOME_ERROR",
        errorData: { error: "data" }
      });
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should return success if the server is started", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    expect(
      harn.server.feedTermination({
        clientId: "some_client",
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        errorCode: "SOME_ERROR",
        errorData: { error: "data" }
      })
    ).toBeUndefined();
  });

  // Events - N/A

  // Transport calls

  it("should send a FeedTermination message to appropriate clients - usage 1, opening", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Target client and feed
    const cidTarget = harn.makeClient("target");
    harn.makeFeedOpening("target", "some_feed", { feed: "args" });

    // Other feeds on target client
    harn.makeFeedOpening("target", "other_feed", { feed: "args" });
    harn.makeFeedOpening("target", "some_feed", { other: "args" });

    // Other client on target feed: feed opening
    harn.makeClient("opening");
    harn.makeFeedOpening("opening", "some_feed", { feed: "args" });

    // Other client on target feed: feed open
    harn.makeClient("open");
    harn.makeFeedOpen("open", "some_feed", { feed: "args" }, { feed: "data" });

    // Other client on target feed: feed closing
    harn.makeClient("closing");
    harn.makeFeedClosing("closing", "some_feed", { feed: "args" });

    // Other client on target feed: feed terminated
    harn.makeClient("terminated");
    harn.makeFeedTerminated("terminated", "some_feed", { feed: "args" });

    // Termination
    harn.server.feedTermination({
      clientId: cidTarget,
      feedName: "some_feed",
      feedArgs: { feed: "args" },
      errorCode: "SOME_ERROR",
      errorData: { error: "data" }
    });

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("target");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "FeedOpenResponse",
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      Success: false,
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  it("should send a FeedTermination message to appropriate clients - usage 1, open", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Target client and feed
    const cidTarget = harn.makeClient("target");
    harn.makeFeedOpen(
      "target",
      "some_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Other feeds on target client
    harn.makeFeedOpen(
      "target",
      "other_feed",
      { feed: "args" },
      { feed: "data" }
    );
    harn.makeFeedOpen(
      "target",
      "some_feed",
      { other: "args" },
      { feed: "data" }
    );

    // Other client on target feed: feed opening
    harn.makeClient("opening");
    harn.makeFeedOpening("opening", "some_feed", { feed: "args" });

    // Other client on target feed: feed open
    harn.makeClient("open");
    harn.makeFeedOpen("open", "some_feed", { feed: "args" }, { feed: "data" });

    // Other client on target feed: feed closing
    harn.makeClient("closing");
    harn.makeFeedClosing("closing", "some_feed", { feed: "args" });

    // Other client on target feed: feed terminated
    harn.makeClient("terminated");
    harn.makeFeedTerminated("terminated", "some_feed", { feed: "args" });

    // Termination
    harn.server.feedTermination({
      clientId: cidTarget,
      feedName: "some_feed",
      feedArgs: { feed: "args" },
      errorCode: "SOME_ERROR",
      errorData: { error: "data" }
    });

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(1);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("target");
    expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
      MessageType: "FeedTermination",
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    });
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  it("should send a FeedTermination message to appropriate clients - usage 2", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Target client
    const cidTarget = harn.makeClient("target");
    harn.makeFeedOpening("target", "opening_feed", { feed: "args" });
    harn.makeFeedOpen(
      "target",
      "open_feed",
      { feed: "args" },
      { feed: "data" }
    );
    harn.makeFeedClosing("target", "closing_feed", { feed: "args" });
    harn.makeFeedTerminated("target", "terminated_feed", { feed: "args" });

    // Other client
    harn.makeClient("other");
    harn.makeFeedOpening("other", "opening_feed", { feed: "args" });
    harn.makeFeedOpen("other", "open_feed", { feed: "args" }, { feed: "data" });
    harn.makeFeedClosing("other", "closing_feed", { feed: "args" });
    harn.makeFeedTerminated("other", "terminated_feed", { feed: "args" });

    // Termination
    harn.server.feedTermination({
      clientId: cidTarget,
      errorCode: "SOME_ERROR",
      errorData: { error: "data" }
    });

    const feedTerminationExpected = {
      MessageType: "FeedTermination",
      FeedName: "open_feed",
      FeedArgs: { feed: "args" },
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    };
    const feedOpenResponseExpected = {
      MessageType: "FeedOpenResponse",
      FeedName: "opening_feed",
      FeedArgs: { feed: "args" },
      Success: false,
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    };

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(2);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[0][0]).toBe("target");
    expect(harn.transport.send.mock.calls[1].length).toBe(2);
    expect(harn.transport.send.mock.calls[1][0]).toBe("target");
    const received1 = JSON.parse(harn.transport.send.mock.calls[0][1]);
    const received2 = JSON.parse(harn.transport.send.mock.calls[1][1]);
    expect(
      (_.isEqual(received1, feedTerminationExpected) &&
        _.isEqual(received2, feedOpenResponseExpected)) ||
        (_.isEqual(received2, feedTerminationExpected) &&
          _.isEqual(received1, feedOpenResponseExpected))
    ).toBe(true);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });

  it("should send a FeedTermination message to appropriate clients - usage 3", () => {
    const harn = harness();
    harn.makeServerStarted();

    // Feed closed - different feed name open
    harn.makeClient("closed_name");
    harn.makeFeedOpen(
      "closed_name",
      "other_feed",
      { feed: "args" },
      { feed: "data" }
    );

    // Feed closed - different feed arg open
    harn.makeClient("closed_args");
    harn.makeFeedOpen(
      "closed_args",
      "some_feed",
      { other: "args" },
      { feed: "data" }
    );

    // Feed opening
    harn.makeClient("opening");
    harn.makeFeedOpening("opening", "some_feed", { feed: "args" });

    // Feed open
    harn.makeClient("open");
    harn.makeFeedOpen("open", "some_feed", { feed: "args" }, { feed: "data" });

    // Feed closing
    harn.makeClient("closing");
    harn.makeFeedClosing("closing", "some_feed", { feed: "args" });

    // Feed terminated
    harn.makeClient("terminated");
    harn.makeFeedTerminated("terminated", "some_feed", { feed: "args" });

    // Termination
    harn.server.feedTermination({
      feedName: "some_feed",
      feedArgs: { feed: "args" },
      errorCode: "SOME_ERROR",
      errorData: { error: "data" }
    });

    const feedTerminationExpected = {
      MessageType: "FeedTermination",
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    };
    const feedOpenResponseExpected = {
      MessageType: "FeedOpenResponse",
      FeedName: "some_feed",
      FeedArgs: { feed: "args" },
      Success: false,
      ErrorCode: "SOME_ERROR",
      ErrorData: { error: "data" }
    };

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(2);
    expect(harn.transport.send.mock.calls[0].length).toBe(2);
    expect(harn.transport.send.mock.calls[1].length).toBe(2);
    if (harn.transport.send.mock.calls[0][0] === "opening") {
      expect(harn.transport.send.mock.calls[0][0]).toBe("opening");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual(
        feedOpenResponseExpected
      );
      expect(harn.transport.send.mock.calls[1][0]).toBe("open");
      expect(JSON.parse(harn.transport.send.mock.calls[1][1])).toEqual(
        feedTerminationExpected
      );
    } else {
      expect(harn.transport.send.mock.calls[0][0]).toBe("open");
      expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual(
        feedTerminationExpected
      );
      expect(harn.transport.send.mock.calls[1][0]).toBe("opening");
      expect(JSON.parse(harn.transport.send.mock.calls[1][1])).toEqual(
        feedOpenResponseExpected
      );
    }
  });
});

describe("The server.disconnect() function", () => {
  // Errors and return values

  it("should throw if the server is stopped", () => {
    const harn = harness();
    expect(() => {
      harn.server.disconnect("some_client");
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should throw if the server is starting", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    expect(() => {
      harn.server.disconnect("some_client");
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should throw if the server is stopping", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    harn.transport.state.mockReturnValue("stopping");
    harn.transport.emit("stopping", new Error("FAILURE: ..."));
    expect(() => {
      harn.server.disconnect("some_client");
    }).toThrow(new Error("INVALID_STATE: The server is not started."));
  });

  it("should return success if the server is started", () => {
    const harn = harness();
    harn.server.start();
    harn.transport.state.mockReturnValue("starting");
    harn.transport.emit("starting");
    harn.transport.state.mockReturnValue("started");
    harn.transport.emit("start");
    expect(harn.server.disconnect("some_client")).toBeUndefined();
  });

  // Events

  it("if connected, should emit a disconnect event when the transport does", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    const serverListener = harn.createServerListener();

    harn.server.disconnect(cid);
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

  it("if not connected, should emit nothing (transport won't)", () => {
    const harn = harness();
    harn.makeServerStarted();
    const serverListener = harn.createServerListener();

    harn.server.disconnect("not_connected");

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

  // Transport calls

  it("if connected, should call transport.disconnect()", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");

    harn.server.disconnect(cid);

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(1);
    expect(harn.transport.disconnect.mock.calls[0].length).toBe(1);
    expect(harn.transport.disconnect.mock.calls[0][0]).toBe("some_tcid");
  });

  it("if not connected, should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();

    harn.server.disconnect("not_connected");

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

/*

Transport-initiated operations.

Tested only under the default configuration.

Transport-initiated operations tested here include:
 
  - Transport violates a library requirement
  - Transport stopping/stop events (failure)
  - Transport connect event
  - Transport disconnect event (failure)
  - Transport message event
    - Violates the spec
    - Valid Handshake
    - Valid Action
    - Valid FeedOpen
    - Valid FeedClose

For each result path, test:

  - Errors and return values (only relevant for xres.success() and xres.failure())
  - State function return values/errors (none - server.state() is trivial)
  - Events
  - Transport calls
  - Callbacks (none)

*/

describe("When the transport violates a library requirement", () => {
  // Events

  it("should emit transportError", () => {
    const harn = harness();
    const serverListener = harn.createServerListener();
    harn.transport.emit("message", "cid", "msg");

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
    expect(serverListener.transportError.mock.calls.length).toBe(1);
    expect(serverListener.transportError.mock.calls[0].length).toBe(1);
    expect(serverListener.transportError.mock.calls[0][0]).toBeInstanceOf(
      Error
    );
  });

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.transport.emit("message", "cid", "msg");
    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

describe("When the transport emits stopping/stop events (failure)", () => {
  // Events

  it("should emit a stopping/stop events", () => {
    const harn = harness();
    harn.makeServerStarted();
    const cid = harn.makeClient("some_tcid");
    const serverListener = harn.createServerListener();

    harn.transport.emit("disconnect", "some_tcid", new Error("STOPPING: ..."));

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
      "STOPPING: ..."
    );
    expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
    expect(serverListener.transportError.mock.calls.length).toBe(0);

    serverListener.mockClear();
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

    serverListener.mockClear();
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

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();
    harn.makeClient("some_tcid");

    harn.transport.emit("disconnect", "some_tcid", new Error("STOPPING: ..."));

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);

    harn.transport.mockClear();
    harn.transport.emit("stopping", new Error("FAILURE: ..."));

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);

    harn.transport.mockClear();
    harn.transport.emit("stop", new Error("FAILURE: ..."));

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

describe("When the transport emits a connect event", () => {
  // Events

  it("should emit a connect event", () => {
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

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();
    harn.transport.emit("connect", "some_tcid");
    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

describe("When the transport emits a disconnect event (failure)", () => {
  // Events

  it("should emit a disconnect event", () => {
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

  // Transport calls

  it("should do nothing on the transport", () => {
    const harn = harness();
    harn.makeServerStarted();
    harn.makeClient("some_tcid");

    harn.transport.emit("disconnect", "some_tcid", new Error("FAILURE: ..."));

    expect(harn.transport.start.mock.calls.length).toBe(0);
    expect(harn.transport.stop.mock.calls.length).toBe(0);
    expect(harn.transport.send.mock.calls.length).toBe(0);
    expect(harn.transport.disconnect.mock.calls.length).toBe(0);
  });
});

describe("When the transport emits an invalid message event", () => {
  describe("When the transport emits a structurally invalid message", () => {
    describe("Bad JSON", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msg = "junk";
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
          "INVALID_MESSAGE: Invalid JSON."
        );
        expect(
          serverListener.badClientMessage.mock.calls[0][1].parseError
        ).toBeInstanceOf(Error);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toBe(msg);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = "junk";
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Invalid JSON."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Not an object", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msg = "123";
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
          "INVALID_MESSAGE: Schema violation."
        );
        expect(
          check.string(
            serverListener.badClientMessage.mock.calls[0][1].schemaViolation
          )
        ).toBe(true);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toBe(JSON.parse(msg));
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = "123";
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Schema violation."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Bad MessageType", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msgObject = {
          MessageType: "junk"
        };
        const msg = JSON.stringify(msgObject);
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
          "INVALID_MESSAGE: Schema violation."
        );
        expect(
          check.string(
            serverListener.badClientMessage.mock.calls[0][1].schemaViolation
          )
        ).toBe(true);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toEqual(msgObject);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "junk"
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Schema violation."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Bad Handshake", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msgObject = {
          MessageType: "Handshake"
        };
        const msg = JSON.stringify(msgObject);
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
          "INVALID_MESSAGE: Schema violation."
        );
        expect(
          check.string(
            serverListener.badClientMessage.mock.calls[0][1].schemaViolation
          )
        ).toBe(true);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toEqual(msgObject);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "Handshake"
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Schema violation."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Bad Action", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msgObject = {
          MessageType: "Action"
        };
        const msg = JSON.stringify(msgObject);
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
          "INVALID_MESSAGE: Schema violation."
        );
        expect(
          check.string(
            serverListener.badClientMessage.mock.calls[0][1].schemaViolation
          )
        ).toBe(true);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toEqual(msgObject);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "Action"
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Schema violation."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Bad FeedOpen", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msgObject = {
          MessageType: "FeedOpen"
        };
        const msg = JSON.stringify(msgObject);
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
          "INVALID_MESSAGE: Schema violation."
        );
        expect(
          check.string(
            serverListener.badClientMessage.mock.calls[0][1].schemaViolation
          )
        ).toBe(true);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toEqual(msgObject);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "FeedOpen"
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Schema violation."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Bad FeedClose", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        const serverListener = harn.createServerListener();

        const msgObject = {
          MessageType: "FeedClose"
        };
        const msg = JSON.stringify(msgObject);
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
          "INVALID_MESSAGE: Schema violation."
        );
        expect(
          check.string(
            serverListener.badClientMessage.mock.calls[0][1].schemaViolation
          )
        ).toBe(true);
        expect(
          serverListener.badClientMessage.mock.calls[0][1].clientMessage
        ).toEqual(msgObject);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "FeedClose"
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Schema violation."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });
  });

  describe("When the transport emits a sequentially invalid message", () => {
    describe("Double Handshake", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");

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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

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
            Message: msg,
            Problem: "Unexpected Handshake message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Action before Handshake", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        let cid;
        harn.server.once("connect", c => {
          cid = c;
        });
        harn.transport.emit("connect", "some_tcid");

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        const msg = JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Handshake required."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("Action reuses CallbackId", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.server.on("action", () => {});
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.server.on("action", () => {});
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "Action",
          ActionName: "some_action",
          ActionArgs: { action: "args" },
          CallbackId: "123"
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
            Message: msg,
            Problem: "Action message reused an outstanding CallbackId."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedOpen before Handshake", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        let cid;
        harn.server.once("connect", c => {
          cid = c;
        });
        harn.transport.emit("connect", "some_tcid");

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Handshake required."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedOpen on opening feed", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Unexpected FeedOpen message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedOpen on open feed", () => {
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

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
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
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Unexpected FeedOpen message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedOpen on closing feed", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });

        const msg = JSON.stringify({
          MessageType: "FeedOpen",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Unexpected FeedOpen message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedClose before Handshake", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        let cid;
        harn.server.once("connect", c => {
          cid = c;
        });
        harn.transport.emit("connect", "some_tcid");

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.transport.emit("connect", "some_tcid");

        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Handshake required."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedClose on closed feed", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");

        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Unexpected FeedClose message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedClose on opening feed", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedOpening("some_tcid", "some_feed", { feed: "args" });

        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Unexpected FeedClose message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });

    describe("FeedClose on closing feed", () => {
      // Events

      it("should emit badClientMessage", () => {
        const harn = harness();
        harn.makeServerStarted();
        const cid = harn.makeClient("some_tcid");
        harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });

        const serverListener = harn.createServerListener();
        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
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

      // Transport calls

      it("should send ViolationResponse on the transport", () => {
        const harn = harness();
        harn.makeServerStarted();
        harn.makeClient("some_tcid");
        harn.makeFeedClosing("some_tcid", "some_feed", { feed: "args" });

        const msg = JSON.stringify({
          MessageType: "FeedClose",
          FeedName: "some_feed",
          FeedArgs: { feed: "args" }
        });
        harn.transport.emit("message", "some_tcid", msg);

        expect(harn.transport.start.mock.calls.length).toBe(0);
        expect(harn.transport.stop.mock.calls.length).toBe(0);
        expect(harn.transport.send.mock.calls.length).toBe(1);
        expect(harn.transport.send.mock.calls[0].length).toBe(2);
        expect(harn.transport.send.mock.calls[0][0]).toBe("some_tcid");
        expect(JSON.parse(harn.transport.send.mock.calls[0][1])).toEqual({
          MessageType: "ViolationResponse",
          Diagnostics: {
            Message: msg,
            Problem: "Unexpected FeedClose message."
          }
        });
        expect(harn.transport.disconnect.mock.calls.length).toBe(0);
      });
    });
  });
});
