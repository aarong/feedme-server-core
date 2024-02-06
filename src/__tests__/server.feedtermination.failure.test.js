import harness from "./server.harness";

expect.extend({
  toHaveState: harness.toHaveState,
});

describe("The server.feedTermination() function", () => {
  describe("can return failure", () => {
    it("should throw if server not started", () => {
      const harn = harness();
      expect(() => {
        harn.server.feedTermination({ clientId: "some_client" });
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });

    it("should throw if non-object argument", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.feedTermination(null);
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid params."));
    });

    it("should throw if invalid usage", () => {
      const harn = harness();
      harn.makeServerStarted();
      expect(() => {
        harn.server.feedTermination({});
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid usage."));
    });

    describe("usage 1 ({cid, fn, fa})", () => {
      it("should throw if invalid params.clientId - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: null,
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
      });

      it("should throw if invalid params.feedName", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: 123,
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid feed name."));
      });

      it("should throw if invalid params.feedArgs", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: 1 },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" },
          });
        }).toThrow(
          new Error("INVALID_ARGUMENT: Invalid feed arguments object."),
        );
      });

      it("should throw if invalid params.errorCode - missing", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: null,
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorData - missing", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: [],
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - not JSON-expressible", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { problem: undefined },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });
    });

    describe("usage 2 ({cid})", () => {
      it("should throw if invalid params.clientId - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: 1,
            errorCode: "SOME_ERROR",
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
      });

      it("should throw if invalid params.errorCode - missing", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            errorCode: true,
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorData - missing", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            errorCode: "SOME_ERROR",
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            errorCode: "SOME_ERROR",
            errorData: "junk",
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - not JSON-expressible", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            clientId: "some_client",
            errorCode: "SOME_ERROR",
            errorData: { problem: NaN },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });
    });

    describe("usage 3 ({fn, fa})", () => {
      it("should throw if invalid params.feedName", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: 123,
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid feed name."));
      });

      it("should throw if invalid params.feedArgs", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: 1 },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" },
          });
        }).toThrow(
          new Error("INVALID_ARGUMENT: Invalid feed arguments object."),
        );
      });

      it("should throw if invalid params.errorCode - missing", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: 123,
            errorData: { error: "data" },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorData - missing", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - bad type", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: "junk",
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - not JSON-expressible", () => {
        const harn = harness();
        harn.makeServerStarted();
        expect(() => {
          harn.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { problem: NaN },
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });
    });
  });
});
