import handshakeRequest from "../handshakerequest";
import handshakeResponse from "../handshakeresponse";

describe("The handshakeResponse() factory function", () => {
  it("should return a properly structured object", () => {
    const s = {};
    const hreq = handshakeRequest("some_client");
    const hres = handshakeResponse(s, hreq);
    expect(hres._server).toBe(s);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(false);
    expect(hres._neutralized).toBe(false);
  });
});

/*

The .success() and ._neutralize() functions are tested together. State
changes, return values, and calls to server._appHandshakeSuccess() are verified.

  1 - .success() .success()
  
        Calls server function, throws
  
  2 - .success() ._neutralize()
  
        Calls server function, throws

  3 - ._neutralize() .success() .success()
  
        Succeeds, succeeds but does not call server function, throws

  4 - ._neutralize() ._neutralize()

        Succeeds, throws

*/

describe("The success() and _neutralize() functions", () => {
  it("should handle Case 1 correctly (see comments)", () => {
    // Create the object
    const s = { _appHandshakeSuccess: jest.fn() };
    const hreq = handshakeRequest("some_client");
    const hres = handshakeResponse(s, hreq);

    // Call success() - check return value, check state, app call
    expect(hres.success()).toBe(undefined);
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(true);
    expect(hres._neutralized).toBe(false);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(1);
    expect(s._appHandshakeSuccess.mock.calls[0].length).toBe(1);
    expect(s._appHandshakeSuccess.mock.calls[0][0]).toBe("some_client");

    s._appHandshakeSuccess.mockClear();

    // Call success() - check return value, check state, app call
    expect(() => {
      hres.success();
    }).toThrow(
      new Error(
        "ALREADY_RESPONDED: The handshakeResponse.success() method has already been called."
      )
    );
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(true);
    expect(hres._neutralized).toBe(false);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);
  });

  it("should handle Case 2 correctly (see comments)", () => {
    // Create the object
    const s = { _appHandshakeSuccess: jest.fn() };
    const hreq = handshakeRequest("some_client");
    const hres = handshakeResponse(s, hreq);

    // Call success() - check return value, check state, app call
    expect(hres.success()).toBe(undefined);
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(true);
    expect(hres._neutralized).toBe(false);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(1);
    expect(s._appHandshakeSuccess.mock.calls[0].length).toBe(1);
    expect(s._appHandshakeSuccess.mock.calls[0][0]).toBe("some_client");

    s._appHandshakeSuccess.mockClear();

    // Call _neutralize() - check return value, check state, app call
    expect(() => {
      hres._neutralize();
    }).toThrow(
      new Error(
        "ALREADY_RESPONDED: The handshakeResponse.success() method has already been called."
      )
    );
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(true);
    expect(hres._neutralized).toBe(false);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);
  });

  it("should handle Case 3 correctly (see comments)", () => {
    // Create the object
    const s = { _appHandshakeSuccess: jest.fn() };
    const hreq = handshakeRequest("some_client");
    const hres = handshakeResponse(s, hreq);

    // Call _neutralize() - check return value, check state, app call
    expect(hres._neutralize()).toBe(undefined);
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(false);
    expect(hres._neutralized).toBe(true);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);

    s._appHandshakeSuccess.mockClear();

    // Call success() - check return value, check state, app call
    expect(hres.success()).toBe(undefined);
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(true);
    expect(hres._neutralized).toBe(true);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);

    // Call success() - check return value, check state, app call
    expect(() => {
      hres.success();
    }).toThrow(
      new Error(
        "ALREADY_RESPONDED: The handshakeResponse.success() method has already been called."
      )
    );
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(true);
    expect(hres._neutralized).toBe(true);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);
  });

  it("should handle Case 4 correctly (see comments)", () => {
    // Create the object
    const s = { _appHandshakeSuccess: jest.fn() };
    const hreq = handshakeRequest("some_client");
    const hres = handshakeResponse(s, hreq);

    // Call _neutralize() - check return value, check state, app call
    expect(hres._neutralize()).toBe(undefined);
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(false);
    expect(hres._neutralized).toBe(true);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);

    s._appHandshakeSuccess.mockClear();

    // Call _neutralize() - check return value, check state, app call
    expect(() => {
      hres._neutralize();
    }).toThrow(
      new Error("ALREADY_NEUTRALIZED: The object has already been neutralized.")
    );
    expect(hres._server).toBe(null);
    expect(hres._handshakeRequest).toBe(hreq);
    expect(hres._appResponded).toBe(false);
    expect(hres._neutralized).toBe(true);
    expect(s._appHandshakeSuccess.mock.calls.length).toBe(0);
  });
});
