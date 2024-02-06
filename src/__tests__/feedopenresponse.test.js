import FeedNameArgs from "feedme-util/feednameargs";
import feedOpenRequest from "../feedopenrequest";
import feedOpenResponse from "../feedopenresponse";

describe("The feedOpenResponse() factory function", () => {
  it("should return a properly structured object", () => {
    const s = {};
    const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
    const foreq = feedOpenRequest("some_client", feedNameArgs);
    const fores = feedOpenResponse(s, foreq);
    expect(fores._server).toBe(s);
    expect(fores._feedOpenRequest).toBe(foreq);
    expect(fores._appResponded).toBe(false);
    expect(fores._neutralized).toBe(false);
  });
});

/*

The .success(), .failure(), and ._neutralize() functions are tested together.
State changes, return values, and calls to server._appFeedOpenSuccess()
and server._appFeedOpenFailure() are verified.

*/

describe("The success(), failure(), and _neutralize() functions", () => {
  it("should throw on invalid arguments", () => {
    // Create the object
    const s = {
      _appFeedOpenSuccess: jest.fn(),
      _appFeedOpenFailure: jest.fn(),
    };
    const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
    const foreq = feedOpenRequest("some_client", feedNameArgs);
    const fores = feedOpenResponse(s, foreq);

    // Success - throw on invalid feedData type
    expect(() => {
      fores.success(123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid feed data."));

    // Success - throw on non-JSON-expressible feedData
    expect(() => {
      fores.success({ something: undefined });
    }).toThrow(
      new Error("INVALID_ARGUMENT: Feed data is not JSON-expressible."),
    );

    // Failure - throw on invalid errorCode - type
    expect(() => {
      fores.failure(123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));

    // Failure - throw on invalid errorData type
    expect(() => {
      fores.failure("SOME_ERROR", 123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));

    // Failure - throw on non-JSON-expressible errorData
    expect(() => {
      fores.failure("SOME_ERROR", { something: undefined });
    }).toThrow(
      new Error("INVALID_ARGUMENT: Error data is not JSON-expressible."),
    );
  });

  describe("should work correctly on", () => {
    it("success (server fn), success (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call success() - check return value, check state, app call
      const fd1 = { feed: "data" };
      expect(fores.success(fd1)).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(1);
      expect(s._appFeedOpenSuccess.mock.calls[0].length).toBe(3);
      expect(s._appFeedOpenSuccess.mock.calls[0][0]).toBe("some_client");
      expect(s._appFeedOpenSuccess.mock.calls[0][1]).toBe(feedNameArgs);
      expect(s._appFeedOpenSuccess.mock.calls[0][2]).toEqual({ feed: "data" });
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(() => {
        fores.success({ feed: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        fores._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });

    it("success (server fn), failure (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call success() - check return value, check state, app call
      const fd1 = { feed: "data" };
      expect(fores.success(fd1)).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(1);
      expect(s._appFeedOpenSuccess.mock.calls[0].length).toBe(3);
      expect(s._appFeedOpenSuccess.mock.calls[0][0]).toBe("some_client");
      expect(s._appFeedOpenSuccess.mock.calls[0][1]).toBe(feedNameArgs);
      expect(s._appFeedOpenSuccess.mock.calls[0][2]).toEqual({ feed: "data" });
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(() => {
        fores.failure("SOME_ERROR", { error: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        fores._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });

    it("failure (server fn), success (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call failure() - check return value, check state, app call
      const ed1 = { error: "data" };
      expect(fores.failure("SOME_ERROR", ed1)).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(1);
      expect(s._appFeedOpenFailure.mock.calls[0].length).toBe(4);
      expect(s._appFeedOpenFailure.mock.calls[0][0]).toBe("some_client");
      expect(s._appFeedOpenFailure.mock.calls[0][1]).toBe(feedNameArgs);
      expect(s._appFeedOpenFailure.mock.calls[0][2]).toBe("SOME_ERROR");
      expect(s._appFeedOpenFailure.mock.calls[0][3]).toEqual({ error: "data" });

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(() => {
        fores.success({ feed: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        fores._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });

    it("failure (server fn), failure (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call failure() - check return value, check state, app call
      const ed1 = { error: "data" };
      expect(fores.failure("SOME_ERROR", ed1)).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(1);
      expect(s._appFeedOpenFailure.mock.calls[0].length).toBe(4);
      expect(s._appFeedOpenFailure.mock.calls[0][0]).toBe("some_client");
      expect(s._appFeedOpenFailure.mock.calls[0][1]).toBe(feedNameArgs);
      expect(s._appFeedOpenFailure.mock.calls[0][2]).toBe("SOME_ERROR");
      expect(s._appFeedOpenFailure.mock.calls[0][3]).toEqual({ error: "data" });

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(() => {
        fores.failure("SOME_ERROR", { error: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        fores._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(false);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });

    it("neutralize (success), success (success no server fn), success (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call _neutralize() - check return value, check state, app call
      expect(fores._neutralize()).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(false);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(fores.success({ feed: "data " })).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(() => {
        fores.success({ feed: "data " });
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });

    it("neutralize (success), failure (success no server fn), failure (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call _neutralize() - check return value, check state, app call
      expect(fores._neutralize()).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(false);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(fores.failure("SOME_ERROR", { error: "data" })).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(() => {
        fores.failure("SOME_ERROR", { error: "data" });
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(true);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });

    it("neutralize (success), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appFeedOpenSuccess: jest.fn(),
        _appFeedOpenFailure: jest.fn(),
      };
      const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
      const foreq = feedOpenRequest("some_client", feedNameArgs);
      const fores = feedOpenResponse(s, foreq);

      // Call _neutralize() - check return value, check state, app call
      expect(fores._neutralize()).toBe(undefined);
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(false);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);

      s._appFeedOpenSuccess.mockClear();
      s._appFeedOpenFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        fores._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_NEUTRALIZED: The object has already been neutralized.",
        ),
      );
      expect(fores._server).toBe(null);
      expect(fores._feedOpenRequest).toBe(foreq);
      expect(fores._appResponded).toBe(false);
      expect(fores._neutralized).toBe(true);
      expect(s._appFeedOpenSuccess.mock.calls.length).toBe(0);
      expect(s._appFeedOpenFailure.mock.calls.length).toBe(0);
    });
  });
});
