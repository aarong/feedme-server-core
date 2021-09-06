import actionRequest from "../actionrequest";
import actionResponse from "../actionresponse";

describe("The actionResponse() factory function", () => {
  it("should return a properly structured object", () => {
    const s = {};
    const areq = actionRequest(
      "some_client",
      "some_action",
      {
        action: "arg"
      },
      "some_callback_id"
    );
    const ares = actionResponse(s, areq);
    expect(ares._server).toBe(s);
    expect(ares._actionRequest).toBe(areq);
    expect(ares._appResponded).toBe(false);
    expect(ares._neutralized).toBe(false);
  });
});

/*

The .success(), .failure(), and ._neutralize() functions are tested together.
State changes, return values, and calls to server._appActionSuccess()
and server._appActionFailure() are verified.

*/

describe("The success(), failure(), and _neutralize() functions", () => {
  it("should throw on invalid arguments", () => {
    // Create the object
    const s = {
      _appActionSuccess: jest.fn(),
      _appActionFailure: jest.fn()
    };
    const areq = actionRequest(
      "some_client",
      "some_callback_id",
      "some_action",
      {
        action: "arg"
      }
    );
    const ares = actionResponse(s, areq);

    // Success - throw on invalid actionData type
    expect(() => {
      ares.success(123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid action data."));

    // Success - throw on non-JSON-expressible actionData
    expect(() => {
      ares.success({ something: undefined });
    }).toThrow(
      new Error("INVALID_ARGUMENT: Action data is not JSON-expressible.")
    );

    // Failure - throw on invalid errorCode - type
    expect(() => {
      ares.failure(123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));

    // Failure - throw on invalid errorData type
    expect(() => {
      ares.failure("SOME_ERROR", 123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));

    // Failure - throw on non-JSON-expressible errorData
    expect(() => {
      ares.failure("SOME_ERROR", { something: undefined });
    }).toThrow(
      new Error("INVALID_ARGUMENT: Error data is not JSON-expressible.")
    );
  });

  describe("should work correctly on", () => {
    it("success (server fn), success (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_callback_id",
        "some_action",
        {
          action: "arg"
        }
      );
      const ares = actionResponse(s, areq);

      // Call success() - check return value, check state, app call
      const ad1 = { action: "data" };
      expect(ares.success(ad1)).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(1);
      expect(s._appActionSuccess.mock.calls[0].length).toBe(3);
      expect(s._appActionSuccess.mock.calls[0][0]).toBe("some_client");
      expect(s._appActionSuccess.mock.calls[0][1]).toBe("some_callback_id");
      expect(s._appActionSuccess.mock.calls[0][2]).toEqual({ action: "data" });
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(() => {
        ares.success({ action: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        ares._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });

    it("success (server fn), failure (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_callback_id",
        "some_action",
        {
          action: "arg"
        }
      );
      const ares = actionResponse(s, areq);

      // Call success() - check return value, check state, app call
      const ad1 = { action: "data" };
      expect(ares.success(ad1)).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(1);
      expect(s._appActionSuccess.mock.calls[0].length).toBe(3);
      expect(s._appActionSuccess.mock.calls[0][0]).toBe("some_client");
      expect(s._appActionSuccess.mock.calls[0][1]).toBe("some_callback_id");
      expect(s._appActionSuccess.mock.calls[0][2]).toEqual({ action: "data" });
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(() => {
        ares.failure("SOME_ERROR", { error: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        ares._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });

    it("failure (server fn), success (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_callback_id",
        "some_action",
        {
          action: "arg"
        }
      );
      const ares = actionResponse(s, areq);

      // Call failure() - check return value, check state, app call
      const ed1 = { error: "data" };
      expect(ares.failure("SOME_ERROR", ed1)).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(1);
      expect(s._appActionFailure.mock.calls[0].length).toBe(4);
      expect(s._appActionFailure.mock.calls[0][0]).toBe("some_client");
      expect(s._appActionFailure.mock.calls[0][1]).toBe("some_callback_id");
      expect(s._appActionFailure.mock.calls[0][2]).toBe("SOME_ERROR");
      expect(s._appActionFailure.mock.calls[0][3]).toEqual({ error: "data" });

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(() => {
        ares.success({ action: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        ares._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });

    it("failure (server fn), failure (throw), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_callback_id",
        "some_action",
        {
          action: "arg"
        }
      );
      const ares = actionResponse(s, areq);

      // Call failure() - check return value, check state, app call
      const ed1 = { error: "data" };
      expect(ares.failure("SOME_ERROR", ed1)).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(1);
      expect(s._appActionFailure.mock.calls[0].length).toBe(4);
      expect(s._appActionFailure.mock.calls[0][0]).toBe("some_client");
      expect(s._appActionFailure.mock.calls[0][1]).toBe("some_callback_id");
      expect(s._appActionFailure.mock.calls[0][2]).toBe("SOME_ERROR");
      expect(s._appActionFailure.mock.calls[0][3]).toEqual({ error: "data" });

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(() => {
        ares.failure("SOME_ERROR", { error: "data" }).toBe(undefined);
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        ares._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(false);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });

    it("neutralize (success), success (success no server fn), success (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_action",
        {
          action: "arg"
        },
        "some_callback_id"
      );
      const ares = actionResponse(s, areq);

      // Call _neutralize() - check return value, check state, app call
      expect(ares._neutralize()).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(false);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(ares.success({ action: "data " })).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call success() - check return value, check state, app call
      expect(() => {
        ares.success({ action: "data " });
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });

    it("neutralize (success), failure (success no server fn), failure (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_action",
        {
          action: "arg"
        },
        "some_callback_id"
      );
      const ares = actionResponse(s, areq);

      // Call _neutralize() - check return value, check state, app call
      expect(ares._neutralize()).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(false);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(ares.failure("SOME_ERROR", { error: "data" })).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call failure() - check return value, check state, app call
      expect(() => {
        ares.failure("SOME_ERROR", { error: "data" });
      }).toThrow(
        new Error(
          "ALREADY_RESPONDED: The success() or failure() method has already been called."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(true);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });

    it("neutralize (success), neutralize (throw)", () => {
      // Create the object
      const s = {
        _appActionSuccess: jest.fn(),
        _appActionFailure: jest.fn()
      };
      const areq = actionRequest(
        "some_client",
        "some_action",
        {
          action: "arg"
        },
        "some_callback_id"
      );
      const ares = actionResponse(s, areq);

      // Call _neutralize() - check return value, check state, app call
      expect(ares._neutralize()).toBe(undefined);
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(false);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);

      s._appActionSuccess.mockClear();
      s._appActionFailure.mockClear();

      // Call _neutralize() - check return value, check state, app call
      expect(() => {
        ares._neutralize();
      }).toThrow(
        new Error(
          "ALREADY_NEUTRALIZED: The object has already been neutralized."
        )
      );
      expect(ares._server).toBe(null);
      expect(ares._actionRequest).toBe(areq);
      expect(ares._appResponded).toBe(false);
      expect(ares._neutralized).toBe(true);
      expect(s._appActionSuccess.mock.calls.length).toBe(0);
      expect(s._appActionFailure.mock.calls.length).toBe(0);
    });
  });
});
