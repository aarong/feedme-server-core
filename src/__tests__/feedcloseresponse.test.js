import feedCloseRequest from "../feedcloserequest";
import feedCloseResponse from "../feedcloseresponse";

describe("The feedCloseResponse() factory function", () => {
  it("should return a properly structured object", () => {
    const s = {};
    const fcreq = feedCloseRequest("some_client", "some_feed", { feed: "arg" });
    const fcres = feedCloseResponse(s, fcreq);
    expect(fcres._server).toBe(s);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(false);
    expect(fcres._neutralized).toBe(false);
  });
});

/*

The .success() and ._neutralize() functions are tested together. State
changes, return values, and calls to server._appFeedCloseSuccess() are verified.

*/

describe("The success() and _neutralize() functions should work correctly on", () => {
  it("success (server fn), success (throw)", () => {
    // Create the object
    const s = { _appFeedCloseSuccess: jest.fn() };
    const fcreq = feedCloseRequest("some_client", "some_feed", { feed: "arg" });
    const fcres = feedCloseResponse(s, fcreq);

    // Call success() - check return value, check state, app call
    expect(fcres.success()).toBe(undefined);
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(true);
    expect(fcres._neutralized).toBe(false);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(1);
    expect(s._appFeedCloseSuccess.mock.calls[0].length).toBe(3);
    expect(s._appFeedCloseSuccess.mock.calls[0][0]).toBe("some_client");
    expect(s._appFeedCloseSuccess.mock.calls[0][1]).toBe("some_feed");
    expect(s._appFeedCloseSuccess.mock.calls[0][2]).toEqual({ feed: "arg" });

    s._appFeedCloseSuccess.mockClear();

    // Call success() - check return value, check state, app call
    expect(() => {
      fcres.success();
    }).toThrow(
      new Error(
        "ALREADY_RESPONDED: The success() method has already been called."
      )
    );
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(true);
    expect(fcres._neutralized).toBe(false);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);
  });

  it("success (server fn), neutralize (throw)", () => {
    // Create the object
    const s = { _appFeedCloseSuccess: jest.fn() };
    const fcreq = feedCloseRequest("some_client", "some_feed", { feed: "arg" });
    const fcres = feedCloseResponse(s, fcreq);

    // Call success() - check return value, check state, app call
    expect(fcres.success()).toBe(undefined);
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(true);
    expect(fcres._neutralized).toBe(false);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(1);
    expect(s._appFeedCloseSuccess.mock.calls[0].length).toBe(3);
    expect(s._appFeedCloseSuccess.mock.calls[0][0]).toBe("some_client");
    expect(s._appFeedCloseSuccess.mock.calls[0][1]).toBe("some_feed");
    expect(s._appFeedCloseSuccess.mock.calls[0][2]).toEqual({ feed: "arg" });

    s._appFeedCloseSuccess.mockClear();

    // Call _neutralize() - check return value, check state, app call
    expect(() => {
      fcres._neutralize();
    }).toThrow(
      new Error(
        "ALREADY_RESPONDED: The success() method has already been called."
      )
    );
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(true);
    expect(fcres._neutralized).toBe(false);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);
  });

  it("neutralize (succeed), success (succeed but no server fn), success (throw)", () => {
    // Create the object
    const s = { _appFeedCloseSuccess: jest.fn() };
    const fcreq = feedCloseRequest("some_client", "some_feed", { feed: "arg" });
    const fcres = feedCloseResponse(s, fcreq);

    // Call _neutralize() - check return value, check state, app call
    expect(fcres._neutralize()).toBe(undefined);
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(false);
    expect(fcres._neutralized).toBe(true);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);

    s._appFeedCloseSuccess.mockClear();

    // Call success() - check return value, check state, app call
    expect(fcres.success()).toBe(undefined);
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(true);
    expect(fcres._neutralized).toBe(true);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);

    // Call success() - check return value, check state, app call
    expect(() => {
      fcres.success();
    }).toThrow(
      new Error(
        "ALREADY_RESPONDED: The success() method has already been called."
      )
    );
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(true);
    expect(fcres._neutralized).toBe(true);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);
  });

  it("neutralize (succeed), neutralize (throw)", () => {
    // Create the object
    const s = { _appFeedCloseSuccess: jest.fn() };
    const fcreq = feedCloseRequest("some_client", "some_feed", { feed: "arg" });
    const fcres = feedCloseResponse(s, fcreq);

    // Call _neutralize() - check return value, check state, app call
    expect(fcres._neutralize()).toBe(undefined);
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(false);
    expect(fcres._neutralized).toBe(true);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);

    s._appFeedCloseSuccess.mockClear();

    // Call _neutralize() - check return value, check state, app call
    expect(() => {
      fcres._neutralize();
    }).toThrow(
      new Error("ALREADY_NEUTRALIZED: The object has already been neutralized.")
    );
    expect(fcres._server).toBe(null);
    expect(fcres._feedCloseRequest).toBe(fcreq);
    expect(fcres._appResponded).toBe(false);
    expect(fcres._neutralized).toBe(true);
    expect(s._appFeedCloseSuccess.mock.calls.length).toBe(0);
  });
});
