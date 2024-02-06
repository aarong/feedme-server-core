import _ from "lodash";
import check from "check-types";
import harness from "./server.harness";

expect.extend({
  toHaveState: harness.toHaveState
});

describe("The test harness", () => {
  describe("the factory function", () => {
    it("should return an appropriately structured object", () => {
      const harn = harness();
      expect(check.object(harn)).toBe(true);
      expect(check.object(harn.server)).toBe(true);
      expect(check.object(harn.transport)).toBe(true);
      expect(check.function(harn.transport.state)).toBe(true);
      expect(check.function(harn.transport.start)).toBe(true);
      expect(check.function(harn.transport.stop)).toBe(true);
      expect(check.function(harn.transport.send)).toBe(true);
      expect(check.function(harn.transport.disconnect)).toBe(true);
      expect(check.function(harn.transport.on)).toBe(true);
      expect(check.function(harn.transport.emit)).toBe(true);
      expect(check.function(harn.transport.mockClear)).toBe(true);
      expect(check.function(harn.createServerListener)).toBe(true);
      expect(check.function(harn.getServerState)).toBe(true);
    });

    it("should overlay options", () => {
      const harn = harness({ handshakeMs: 123, terminationMs: 456 });
      expect(harn.server._options.handshakeMs).toBe(123);
      expect(harn.server._options.terminationMs).toBe(456);
    });
  });

  describe("the harn.createServerListener() function", () => {
    it("should return a functioning listener object", () => {
      const harn = harness();
      const l = harn.createServerListener();

      harn.server.emit("starting", 123);
      expect(l.starting.mock.calls.length).toBe(1);
      expect(l.starting.mock.calls[0].length).toBe(1);
      expect(l.starting.mock.calls[0][0]).toBe(123);

      harn.server.emit("start", 123);
      expect(l.start.mock.calls.length).toBe(1);
      expect(l.start.mock.calls[0].length).toBe(1);
      expect(l.start.mock.calls[0][0]).toBe(123);

      harn.server.emit("stopping", 123);
      expect(l.stopping.mock.calls.length).toBe(1);
      expect(l.stopping.mock.calls[0].length).toBe(1);
      expect(l.stopping.mock.calls[0][0]).toBe(123);

      harn.server.emit("stop", 123);
      expect(l.stop.mock.calls.length).toBe(1);
      expect(l.stop.mock.calls[0].length).toBe(1);
      expect(l.stop.mock.calls[0][0]).toBe(123);

      harn.server.emit("connect", 123);
      expect(l.connect.mock.calls.length).toBe(1);
      expect(l.connect.mock.calls[0].length).toBe(1);
      expect(l.connect.mock.calls[0][0]).toBe(123);

      harn.server.emit("handshake", 123);
      expect(l.handshake.mock.calls.length).toBe(1);
      expect(l.handshake.mock.calls[0].length).toBe(1);
      expect(l.handshake.mock.calls[0][0]).toBe(123);

      harn.server.emit("action", 123);
      expect(l.action.mock.calls.length).toBe(1);
      expect(l.action.mock.calls[0].length).toBe(1);
      expect(l.action.mock.calls[0][0]).toBe(123);

      harn.server.emit("feedOpen", 123);
      expect(l.feedOpen.mock.calls.length).toBe(1);
      expect(l.feedOpen.mock.calls[0].length).toBe(1);
      expect(l.feedOpen.mock.calls[0][0]).toBe(123);

      harn.server.emit("feedClose", 123);
      expect(l.feedClose.mock.calls.length).toBe(1);
      expect(l.feedClose.mock.calls[0].length).toBe(1);
      expect(l.feedClose.mock.calls[0][0]).toBe(123);

      harn.server.emit("disconnect", 123);
      expect(l.disconnect.mock.calls.length).toBe(1);
      expect(l.disconnect.mock.calls[0].length).toBe(1);
      expect(l.disconnect.mock.calls[0][0]).toBe(123);

      harn.server.emit("badClientMessage", 123);
      expect(l.badClientMessage.mock.calls.length).toBe(1);
      expect(l.badClientMessage.mock.calls[0].length).toBe(1);
      expect(l.badClientMessage.mock.calls[0][0]).toBe(123);

      harn.server.emit("transportError", 123);
      expect(l.transportError.mock.calls.length).toBe(1);
      expect(l.transportError.mock.calls[0].length).toBe(1);
      expect(l.transportError.mock.calls[0][0]).toBe(123);

      // Check that clearing the listeners works
      l.mockClear();
      expect(l.starting.mock.calls.length).toBe(0);
      expect(l.start.mock.calls.length).toBe(0);
      expect(l.stopping.mock.calls.length).toBe(0);
      expect(l.stop.mock.calls.length).toBe(0);
      expect(l.handshake.mock.calls.length).toBe(0);
      expect(l.action.mock.calls.length).toBe(0);
      expect(l.feedOpen.mock.calls.length).toBe(0);
      expect(l.feedClose.mock.calls.length).toBe(0);
      expect(l.disconnect.mock.calls.length).toBe(0);
      expect(l.badClientMessage.mock.calls.length).toBe(0);
      expect(l.transportError.mock.calls.length).toBe(0);
    });
  });

  describe("the harn.getServerState() and expect(x).toHaveState(y) functions", () => {
    describe("should handle invalid root keys correctly", () => {
      it("should throw if root keys are invalid", () => {
        const harn = harness();
        const result = harness.toHaveState(harn.server, {});
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected root keys to be valid, but they weren't"
        );
      });
    });

    describe("should handle ._options correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness({
          handshakeMs: 123,
          terminationMs: 456
        });
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._options).toEqual({
          handshakeMs: 123,
          terminationMs: 456
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harn.getServerState();
        state._options.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._options to match, but they didn't"
        );
      });
    });

    describe("should handle ._transportWrapper (and state) correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._transportWrapper).toBe(harn.server._transportWrapper);
        expect(state._transportWrapperState).toBe("stopped");
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched object ref", () => {
        const state = harn.getServerState();
        state._transportWrapper = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected transport wrapper objects to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched transport state", () => {
        const state = harn.getServerState();
        state._transportWrapperState = "starting";
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected transport wrapper states to match, but they didn't"
        );
      });
    });

    describe("should handle ._clientIds correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._clientIds = {
          cid1: "tcid1",
          cid2: "tcid2"
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._clientIds).toEqual({
          cid1: "tcid1",
          cid2: "tcid2"
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harn.getServerState();
        state._clientIds.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._clientIds to match, but they didn't"
        );
      });
    });

    describe("should handle ._transportClientIds correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._transportClientIds = {
          tcid1: "cid1",
          tcid2: "cid2"
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._transportClientIds).toEqual({
          tcid1: "cid1",
          tcid2: "cid2"
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harn.getServerState();
        state._transportClientIds.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._transportClientIds to match, but they didn't"
        );
      });
    });

    describe("should handle ._handshakeTimers correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._handshakeTimers = {
          cid1: 123,
          cid2: 456
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._handshakeTimers).toEqual({
          cid1: 123,
          cid2: 456
        });
      });

      it("should compare the state correctly - match with identical timer ids", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - match with different timer ids", () => {
        const state = harn.getServerState();
        state._handshakeTimers = {
          cid1: 888,
          cid2: 999
        };
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched key", () => {
        const state = harn.getServerState();
        state._handshakeTimers.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeTimers keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched value", () => {
        const state = harn.getServerState();
        state._handshakeTimers.cid1 = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeTimers values to match, but they didn't"
        );
      });
    });

    describe("should handle ._handshakeStatus correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._handshakeStatus = {
          cid1: "waiting",
          cid2: "processing"
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._handshakeStatus).toEqual({
          cid1: "waiting",
          cid2: "processing"
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched key", () => {
        const state = harn.getServerState();
        state._handshakeStatus.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeStatus to match, but they didn't"
        );
      });
    });

    describe("should handle ._handshakeResponses (and state) correctly", () => {
      let harn;
      let hsr1;
      let hsr2;
      beforeEach(() => {
        harn = harness();
        hsr1 = {
          _server: {},
          _handshakeRequest: { clientId: "cid1" },
          _appResponded: true,
          _neutralized: false
        };
        hsr2 = {
          _server: {},
          _handshakeRequest: { clientId: "cid2" },
          _appResponded: false,
          _neutralized: true
        };
        harn.server._handshakeResponses = {
          cid1: hsr1,
          cid2: hsr2
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();

        expect(_.keys(state._handshakeResponses).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(state._handshakeResponses.cid1).toBe(hsr1);
        expect(state._handshakeResponses.cid2).toBe(hsr2);

        expect(_.keys(state._handshakeResponseStates).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(check.object(state._handshakeResponseStates.cid1)).toBe(true);
        expect(state._handshakeResponseStates.cid1._server).toBe(hsr1._server);
        expect(state._handshakeResponseStates.cid1._handshakeRequest).toEqual({
          clientId: "cid1"
        });
        expect(state._handshakeResponseStates.cid1._appResponded).toBe(true);
        expect(state._handshakeResponseStates.cid1._neutralized).toBe(false);
        expect(check.object(state._handshakeResponseStates.cid2)).toBe(true);
        expect(state._handshakeResponseStates.cid2._server).toBe(hsr2._server);
        expect(state._handshakeResponseStates.cid2._handshakeRequest).toEqual({
          clientId: "cid2"
        });
        expect(state._handshakeResponseStates.cid2._appResponded).toBe(false);
        expect(state._handshakeResponseStates.cid2._neutralized).toBe(true);
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._handshakeResponses key", () => {
        const state = harn.getServerState();
        state._handshakeResponses.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponses[cid] value", () => {
        const state = harn.getServerState();
        state._handshakeResponses.cid1 = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponses values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates key", () => {
        const state = harn.getServerState();
        state._handshakeResponseStates.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid] key", () => {
        const state = harn.getServerState();
        state._handshakeResponseStates.cid1.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._server", () => {
        const state = harn.getServerState();
        state._handshakeResponseStates.cid1._server = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._handshakeRequest", () => {
        const state = harn.getServerState();
        state._handshakeResponseStates.cid1._handshakeRequest = {
          clientId: "junk"
        };
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._appResponded", () => {
        const state = harn.getServerState();
        state._handshakeResponseStates.cid1._appResponded = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._neutralized", () => {
        const state = harn.getServerState();
        state._handshakeResponseStates.cid1._neutralized = true;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._actionResponses (and state) correctly", () => {
      let harn;
      let ar11;
      let ar12;
      let ar21;
      beforeEach(() => {
        harn = harness();
        ar11 = {
          _server: {},
          _actionRequest: {
            clientId: "cid1",
            _actionCallbackId: "acb11",
            actionName: "action11",
            actionArgs: { action: "args11" }
          },
          _appResponded: true,
          _neutralized: true
        };
        ar12 = {
          _server: {},
          _actionRequest: {
            clientId: "cid1",
            _actionCallbackId: "acb12",
            actionName: "action12",
            actionArgs: { action: "args12" }
          },
          _appResponded: true,
          _neutralized: false
        };
        ar21 = {
          _server: {},
          _actionRequest: {
            clientId: "cid2",
            _actionCallbackId: "acb21",
            actionName: "action21",
            actionArgs: { action: "args21" }
          },
          _appResponded: false,
          _neutralized: true
        };
        harn.server._actionResponses = {
          cid1: { acb11: ar11, acb12: ar12 },
          cid2: { acb21: ar21 }
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(_.keys(state._actionResponses).sort()).toEqual(["cid1", "cid2"]);
        expect(_.keys(state._actionResponses.cid1).sort()).toEqual([
          "acb11",
          "acb12"
        ]);
        expect(_.keys(state._actionResponses.cid2).sort()).toEqual(["acb21"]);
        expect(state._actionResponses.cid1.acb11).toBe(ar11);
        expect(state._actionResponses.cid1.acb12).toBe(ar12);
        expect(state._actionResponses.cid2.acb21).toBe(ar21);

        expect(_.keys(state._actionResponseStates).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(_.keys(state._actionResponseStates.cid1).sort()).toEqual([
          "acb11",
          "acb12"
        ]);
        expect(_.keys(state._actionResponseStates.cid2).sort()).toEqual([
          "acb21"
        ]);

        expect(state._actionResponseStates.cid1.acb11._server).toBe(
          ar11._server
        );
        expect(state._actionResponseStates.cid1.acb11._actionRequest).toEqual({
          clientId: "cid1",
          _actionCallbackId: "acb11",
          actionName: "action11",
          actionArgs: { action: "args11" }
        });
        expect(state._actionResponseStates.cid1.acb11._appResponded).toBe(true);
        expect(state._actionResponseStates.cid1.acb11._neutralized).toBe(true);

        expect(state._actionResponseStates.cid1.acb12._server).toBe(
          ar12._server
        );
        expect(state._actionResponseStates.cid1.acb12._actionRequest).toEqual({
          clientId: "cid1",
          _actionCallbackId: "acb12",
          actionName: "action12",
          actionArgs: { action: "args12" }
        });
        expect(state._actionResponseStates.cid1.acb12._appResponded).toBe(true);
        expect(state._actionResponseStates.cid1.acb12._neutralized).toBe(false);

        expect(state._actionResponseStates.cid2.acb21._server).toBe(
          ar21._server
        );
        expect(state._actionResponseStates.cid2.acb21._actionRequest).toEqual({
          clientId: "cid2",
          _actionCallbackId: "acb21",
          actionName: "action21",
          actionArgs: { action: "args21" }
        });
        expect(state._actionResponseStates.cid2.acb21._appResponded).toBe(
          false
        );
        expect(state._actionResponseStates.cid2.acb21._neutralized).toBe(true);
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._actionResponses key", () => {
        const state = harn.getServerState();
        state._actionResponses.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponses[cid] key", () => {
        const state = harn.getServerState();
        state._actionResponses.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponses[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponses[cid] value", () => {
        const state = harn.getServerState();
        state._actionResponses.cid1.acb11 = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponses[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates key", () => {
        const state = harn.getServerState();
        state._actionResponseStates.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid] key", () => {
        const state = harn.getServerState();
        state._actionResponseStates.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb] key", () => {
        const state = harn.getServerState();
        state._actionResponseStates.cid1.acb11.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._server", () => {
        const state = harn.getServerState();
        state._actionResponseStates.cid1.acb11._server = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._actionRequest", () => {
        const state = harn.getServerState();
        state._actionResponseStates.cid1.acb11._actionRequest = {
          clientId: "junk",
          _actionCallbackId: "junk",
          actionName: "junk",
          actionArgs: { action: "junk" }
        };
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._appResponded", () => {
        const state = harn.getServerState();
        state._actionResponseStates.cid1.acb11._appResponded = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._neutralized", () => {
        const state = harn.getServerState();
        state._actionResponseStates.cid1.acb11._neutralized = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._clientFeedStates correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._clientFeedStates = {
          cid1: {
            ser1: "opening",
            ser2: "open"
          },
          cid2: {
            ser1: "closing"
          }
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._clientFeedStates).toEqual({
          cid1: {
            ser1: "opening",
            ser2: "open"
          },
          cid2: {
            ser1: "closing"
          }
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harn.getServerState();
        state._clientFeedStates.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._clientFeedStates to match, but they didn't"
        );
      });
    });

    describe("should handle ._feedClientStates correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._feedClientStates = {
          ser1: {
            cid1: "opening",
            cid2: "closing"
          },
          ser2: {
            cid1: "open"
          }
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._feedClientStates).toEqual({
          ser1: {
            cid1: "opening",
            cid2: "closing"
          },
          ser2: {
            cid1: "open"
          }
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harn.getServerState();
        state._feedClientStates.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedClientStates to match, but they didn't"
        );
      });
    });

    describe("should handle ._terminationTimers correctly", () => {
      let harn;
      beforeEach(() => {
        harn = harness();
        harn.server._terminationTimers = {
          cid1: {
            ser1: 123,
            ser2: 456
          },
          cid2: {
            ser1: 789
          }
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(state._terminationTimers).toEqual({
          cid1: {
            ser1: 123,
            ser2: 456
          },
          cid2: {
            ser1: 789
          }
        });
      });

      it("should compare the state correctly - match with identical timer ids", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - match with different timer ids", () => {
        const state = harn.getServerState();
        state._terminationTimers.cid1.ser1 = 999;
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._terminationTimers key", () => {
        const state = harn.getServerState();
        state._terminationTimers.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._terminationTimers keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._terminationTimers[cid] key", () => {
        const state = harn.getServerState();
        state._terminationTimers.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._terminationTimers[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._terminationTimers[cid] value", () => {
        const state = harn.getServerState();
        state._terminationTimers.cid1.ser1 = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._terminationTimers[cid] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._feedOpenResponses (and state) correctly", () => {
      let harn;
      let for11;
      let for12;
      let for21;
      beforeEach(() => {
        harn = harness();
        for11 = {
          _server: {},
          _feedOpenRequest: {
            clientId: "cid1",
            feedName: "feed1",
            feedArgs: { feed: "args1" }
          },
          _appResponded: true,
          _neutralized: true
        };
        for12 = {
          _server: {},
          _feedOpenRequest: {
            clientId: "cid1",
            feedName: "feed2",
            feedArgs: { feed: "args2" }
          },
          _appResponded: true,
          _neutralized: false
        };
        for21 = {
          _server: {},
          _feedOpenRequest: {
            clientId: "cid2",
            feedName: "feed1",
            feedArgs: { feed: "args1" }
          },
          _appResponded: false,
          _neutralized: true
        };
        harn.server._feedOpenResponses = {
          cid1: { ser1: for11, ser2: for12 },
          cid2: { ser1: for21 }
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(_.keys(state._feedOpenResponses).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(_.keys(state._feedOpenResponses.cid1).sort()).toEqual([
          "ser1",
          "ser2"
        ]);
        expect(_.keys(state._feedOpenResponses.cid2).sort()).toEqual(["ser1"]);
        expect(state._feedOpenResponses.cid1.ser1).toBe(for11);
        expect(state._feedOpenResponses.cid1.ser2).toBe(for12);
        expect(state._feedOpenResponses.cid2.ser1).toBe(for21);

        expect(_.keys(state._feedOpenResponseStates).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(_.keys(state._feedOpenResponseStates.cid1).sort()).toEqual([
          "ser1",
          "ser2"
        ]);
        expect(_.keys(state._feedOpenResponseStates.cid2).sort()).toEqual([
          "ser1"
        ]);

        expect(state._feedOpenResponseStates.cid1.ser1._server).toBe(
          for11._server
        );
        expect(
          state._feedOpenResponseStates.cid1.ser1._feedOpenRequest
        ).toEqual({
          clientId: "cid1",
          feedName: "feed1",
          feedArgs: { feed: "args1" }
        });
        expect(state._feedOpenResponseStates.cid1.ser1._appResponded).toBe(
          true
        );
        expect(state._feedOpenResponseStates.cid1.ser1._neutralized).toBe(true);

        expect(state._feedOpenResponseStates.cid1.ser2._server).toBe(
          for12._server
        );
        expect(
          state._feedOpenResponseStates.cid1.ser2._feedOpenRequest
        ).toEqual({
          clientId: "cid1",
          feedName: "feed2",
          feedArgs: { feed: "args2" }
        });
        expect(state._feedOpenResponseStates.cid1.ser2._appResponded).toBe(
          true
        );
        expect(state._feedOpenResponseStates.cid1.ser2._neutralized).toBe(
          false
        );

        expect(state._feedOpenResponseStates.cid2.ser1._server).toBe(
          for21._server
        );
        expect(
          state._feedOpenResponseStates.cid2.ser1._feedOpenRequest
        ).toEqual({
          clientId: "cid2",
          feedName: "feed1",
          feedArgs: { feed: "args1" }
        });
        expect(state._feedOpenResponseStates.cid2.ser1._appResponded).toBe(
          false
        );
        expect(state._feedOpenResponseStates.cid2.ser1._neutralized).toBe(true);
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._feedOpenResponses key", () => {
        const state = harn.getServerState();
        state._feedOpenResponses.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponses[cid] key", () => {
        const state = harn.getServerState();
        state._feedOpenResponses.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponses[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponses[cid] value", () => {
        const state = harn.getServerState();
        state._feedOpenResponses.cid1.ser1 = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponses[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates key", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid] key", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser] key", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.cid1.ser1.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._server", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.cid1.ser1._server = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._actionRequest", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.cid1.ser1._feedOpenRequest = {
          clientId: "junk",
          feedName: "junk",
          feedArgs: { feed: "junk" }
        };
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._appResponded", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.cid1.ser1._appResponded = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._neutralized", () => {
        const state = harn.getServerState();
        state._feedOpenResponseStates.cid1.ser1._neutralized = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._feedCloseResponses (and state) correctly", () => {
      let harn;
      let fcr11;
      let fcr12;
      let fcr21;
      beforeEach(() => {
        harn = harness();
        fcr11 = {
          _server: {},
          _feedCloseRequest: {
            clientId: "cid1",
            feedName: "feed1",
            feedArgs: { feed: "args1" }
          },
          _appResponded: true,
          _neutralized: true
        };
        fcr12 = {
          _server: {},
          _feedCloseRequest: {
            clientId: "cid1",
            feedName: "feed2",
            feedArgs: { feed: "args2" }
          },
          _appResponded: true,
          _neutralized: false
        };
        fcr21 = {
          _server: {},
          _feedCloseRequest: {
            clientId: "cid2",
            feedName: "feed1",
            feedArgs: { feed: "args1" }
          },
          _appResponded: false,
          _neutralized: true
        };
        harn.server._feedCloseResponses = {
          cid1: { ser1: fcr11, ser2: fcr12 },
          cid2: { ser1: fcr21 }
        };
      });

      it("should represent the state correctly", () => {
        const state = harn.getServerState();
        expect(_.keys(state._feedCloseResponses).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(_.keys(state._feedCloseResponses.cid1).sort()).toEqual([
          "ser1",
          "ser2"
        ]);
        expect(_.keys(state._feedCloseResponses.cid2).sort()).toEqual(["ser1"]);
        expect(state._feedCloseResponses.cid1.ser1).toBe(fcr11);
        expect(state._feedCloseResponses.cid1.ser2).toBe(fcr12);
        expect(state._feedCloseResponses.cid2.ser1).toBe(fcr21);

        expect(_.keys(state._feedCloseResponses).sort()).toEqual([
          "cid1",
          "cid2"
        ]);
        expect(_.keys(state._feedCloseResponses.cid1).sort()).toEqual([
          "ser1",
          "ser2"
        ]);
        expect(_.keys(state._feedCloseResponses.cid2).sort()).toEqual(["ser1"]);

        expect(state._feedCloseResponses.cid1.ser1._server).toBe(fcr11._server);
        expect(state._feedCloseResponses.cid1.ser1._feedCloseRequest).toEqual({
          clientId: "cid1",
          feedName: "feed1",
          feedArgs: { feed: "args1" }
        });
        expect(state._feedCloseResponses.cid1.ser1._appResponded).toBe(true);
        expect(state._feedCloseResponses.cid1.ser1._neutralized).toBe(true);

        expect(state._feedCloseResponses.cid1.ser2._server).toBe(fcr12._server);
        expect(state._feedCloseResponses.cid1.ser2._feedCloseRequest).toEqual({
          clientId: "cid1",
          feedName: "feed2",
          feedArgs: { feed: "args2" }
        });
        expect(state._feedCloseResponses.cid1.ser2._appResponded).toBe(true);
        expect(state._feedCloseResponses.cid1.ser2._neutralized).toBe(false);

        expect(state._feedCloseResponses.cid2.ser1._server).toBe(fcr21._server);
        expect(state._feedCloseResponses.cid2.ser1._feedCloseRequest).toEqual({
          clientId: "cid2",
          feedName: "feed1",
          feedArgs: { feed: "args1" }
        });
        expect(state._feedCloseResponses.cid2.ser1._appResponded).toBe(false);
        expect(state._feedCloseResponses.cid2.ser1._neutralized).toBe(true);
      });

      it("should compare the state correctly - match", () => {
        const state = harn.getServerState();
        expect(harn.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._feedCloseResponses key", () => {
        const state = harn.getServerState();
        state._feedCloseResponses.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponses[cid] key", () => {
        const state = harn.getServerState();
        state._feedCloseResponses.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponses[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponses[cid] value", () => {
        const state = harn.getServerState();
        state._feedCloseResponses.cid1.ser1 = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponses[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates key", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid] key", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.cid1.junk = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser] key", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.cid1.ser1.junk = 123;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._server", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.cid1.ser1._server = {};
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._actionRequest", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.cid1.ser1._feedCloseRequest = {
          clientId: "junk",
          feedName: "junk",
          feedArgs: { feed: "junk" }
        };
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._appResponded", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.cid1.ser1._appResponded = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._neutralized", () => {
        const state = harn.getServerState();
        state._feedCloseResponseStates.cid1.ser1._neutralized = false;
        const result = harness.toHaveState(harn.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });
    });
  });
});
