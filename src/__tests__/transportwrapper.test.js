import emitter from "component-emitter";
import transportWrapper from "../transportwrapper";

// Factory

describe("The transportWrapper() factory function", () => {
  it("should throw if the transport is not an object", () => {
    expect(() => {
      transportWrapper();
    }).toThrow(
      new Error("INVALID_ARGUMENT: The supplied transport is not an object.")
    );
  });

  it("should throw if the transport is not an event emitter", () => {
    expect(() => {
      transportWrapper({
        // on: () => {},
        state: () => {},
        start: () => {},
        stop: () => {},
        send: () => {},
        disconnect: () => {}
      });
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: The supplied transport does not implement the required API."
      )
    );
  });

  it("should throw if the transport has no state() function", () => {
    expect(() => {
      transportWrapper({
        on: () => {},
        // state: () => {},
        start: () => {},
        stop: () => {},
        send: () => {},
        disconnect: () => {}
      });
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: The supplied transport does not implement the required API."
      )
    );
  });

  it("should throw if the transport has no start() function", () => {
    expect(() => {
      transportWrapper({
        on: () => {},
        state: () => {},
        // start: () => {},
        stop: () => {},
        send: () => {},
        disconnect: () => {}
      });
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: The supplied transport does not implement the required API."
      )
    );
  });

  it("should throw if the transport has no stop() function", () => {
    expect(() => {
      transportWrapper({
        on: () => {},
        state: () => {},
        start: () => {},
        // stop: () => {},
        send: () => {},
        disconnect: () => {}
      });
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: The supplied transport does not implement the required API."
      )
    );
  });

  it("should throw if the transport has no send() function", () => {
    expect(() => {
      transportWrapper({
        on: () => {},
        state: () => {},
        start: () => {},
        stop: () => {},
        // send: () => {},
        disconnect: () => {}
      });
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: The supplied transport does not implement the required API."
      )
    );
  });

  it("should throw if the transport has no disconnect() function", () => {
    expect(() => {
      transportWrapper({
        on: () => {},
        state: () => {},
        start: () => {},
        stop: () => {},
        send: () => {}
        // disconnect: () => {}
      });
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: The supplied transport does not implement the required API."
      )
    );
  });

  it("should throw if the transport is not stopped", () => {
    expect(() => {
      transportWrapper({
        on: () => {},
        state: () => "starting",
        start: () => {},
        stop: () => {},
        send: () => {},
        disconnect: () => {}
      });
    }).toThrow(
      new Error("INVALID_ARGUMENT: The supplied transport is not stopped.")
    );
  });

  it("should return an object", () => {
    expect(
      transportWrapper({
        on: () => {},
        state: () => "stopped",
        start: () => {},
        stop: () => {},
        send: () => {},
        disconnect: () => {}
      })
    ).toBeInstanceOf(Object);
  });
});

// Methods

describe("the state() function", () => {
  it("if the transport throws an error, it should throw TRANSPORT_ERROR and emit transportError", () => {
    // Set up the transport
    const transport = {
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    };
    const wrapper = transportWrapper(transport);
    transport.state = () => {
      throw new Error("JUNK_ERROR");
    };

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the throw
    expect(() => {
      wrapper.state();
    }).toThrow("TRANSPORT_ERROR: The transport unexpectedly threw an error.");

    // Check the listener
    expect(listener.mock.calls.length).toBe(1);
    expect(listener.mock.calls[0].length).toBe(1);
    expect(listener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].message).toBe(
      "INVALID_RESULT: Transport threw an error on call to state()."
    );
    expect(listener.mock.calls[0][0].transportError).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].transportError.message).toBe("JUNK_ERROR");
  });

  it("if the transport return value conflicts with its last state emission, it should throw TRANSPORT_ERROR and emit transportError", () => {
    // Set up the transport
    const transport = {
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    };
    const wrapper = transportWrapper(transport);
    transport.state = () => "starting";

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the throw
    expect(() => {
      wrapper.state();
    }).toThrow("TRANSPORT_ERROR: The transport returned an unexpected state.");

    // Check the listener
    expect(listener.mock.calls.length).toBe(1);
    expect(listener.mock.calls[0].length).toBe(1);
    expect(listener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].message).toBe(
      "INVALID_RESULT: Transport unexpectedly returned 'starting' on a call to state() when previous emission was 'stop'."
    );
  });

  it("if the transport returns a valid 'stopped' state, it should return the state and emit nothing", () => {
    // Set up the transport
    const transport = {
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    };
    const wrapper = transportWrapper(transport);

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the return value
    expect(wrapper.state()).toBe("stopped");

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the transport returns a valid 'starting' state, it should return the state and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the return value
    expect(wrapper.state()).toBe("starting");

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the transport returns a valid 'started' state, it should return the state and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the return value
    expect(wrapper.state()).toBe("started");

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the transport returns a valid 'stopping' state, it should return the state and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the return value
    expect(wrapper.state()).toBe("stopping");

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });
});

describe("the start() function", () => {
  it("if the transport state is not 'stopped', it should throw INVALID_CALL and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.start();
    }).toThrow(
      new Error(
        "INVALID_CALL: Call to start() when the transport state was not 'stopped'."
      )
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the transport throws in response to a valid server call, it should throw TRANSPORT_ERROR and emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);
    transport.start = () => {
      throw new Error("JUNK_ERROR");
    };

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.start();
    }).toThrow(
      new Error("TRANSPORT_ERROR: Transport unexpectedly threw an error.")
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(1);
    expect(listener.mock.calls[0].length).toBe(1);
    expect(listener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].message).toBe(
      "INVALID_RESULT: Transport threw an error on a call to start() when previous emission was 'stop'."
    );
    expect(listener.mock.calls[0][0].transportError).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].transportError.message).toBe("JUNK_ERROR");
  });

  it("if both sides are valid, should return nothing and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the return value
    expect(wrapper.start()).toBe(undefined);

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });
});

describe("the stop() function", () => {
  it("if the state is not 'started', it should throw INVALID_CALL and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.stop();
    }).toThrow(
      new Error(
        "INVALID_CALL: Call to stop() when the transport state was not 'started'."
      )
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the transport throws in response to a valid server call, it should throw TRANSPORT_ERROR and emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Make start function throw
    transport.stop = () => {
      throw new Error("JUNK_ERROR");
    };

    // Check the error
    expect(() => {
      wrapper.stop();
    }).toThrow(
      new Error("TRANSPORT_ERROR: Transport unexpectedly threw an error.")
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(1);
    expect(listener.mock.calls[0].length).toBe(1);
    expect(listener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].message).toBe(
      "INVALID_RESULT: Transport threw an error on a call to stop() when previous emission was 'start'."
    );
    expect(listener.mock.calls[0][0].transportError).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].transportError.message).toBe("JUNK_ERROR");
  });

  it("if both sides are valid, should return nothing and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the return value
    expect(wrapper.stop()).toBe(undefined);

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });
});

describe("the send() function", () => {
  it("if the last state emission was not 'start', it should throw INVALID_CALL and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.send("some client", "some message");
    }).toThrow(
      new Error(
        "INVALID_CALL: Call to send() when the transport state was not 'started'."
      )
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client is not understood to be connected, it should throw INVALID_CALL and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.send("some client", "some message");
    }).toThrow(
      new Error(
        "INVALID_CALL: Call to send() referencing client not understood to be connected."
      )
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the call was valid but the transport throws an error, it should throw TRANSPORT_ERROR and emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    transport.send = () => {
      throw new Error("JUNK_ERROR");
    };
    expect(() => {
      wrapper.send("client1", "some message");
    }).toThrow(
      new Error("TRANSPORT_ERROR: Transport unexpectedly threw an error.")
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(1);
    expect(listener.mock.calls[0].length).toBe(1);
    expect(listener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].message).toBe(
      "INVALID_RESULT: Transport threw an error on a call to send() when previous state emission was 'start' and client was understood to be connected."
    );
    expect(listener.mock.calls[0][0].transportError).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].transportError.message).toBe("JUNK_ERROR");
  });

  it("if the call was valid and the transport returns nothing, it should return nothing and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the result
    expect(wrapper.send("client1", "some message")).toBe(undefined);

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });
});

describe("the disconnect() function", () => {
  it("if the last state emission was not 'start', it should throw INVALID_CALL and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.disconnect("some client");
    }).toThrow(
      new Error(
        "INVALID_CALL: Call to disconnect() when the transport state was not 'started'."
      )
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client is not understood to be connected, it should throw INVALID_CALL and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    expect(() => {
      wrapper.disconnect("some client");
    }).toThrow(
      new Error(
        "INVALID_CALL: Call to disconnect() referencing client not understood to be connected."
      )
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });

  it("if the call was valid but the transport throws an error, it should throw TRANSPORT_ERROR and emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the error
    transport.disconnect = () => {
      throw new Error("JUNK_ERROR");
    };
    expect(() => {
      wrapper.disconnect("client1");
    }).toThrow(
      new Error("TRANSPORT_ERROR: Transport unexpectedly threw an error.")
    );

    // Check the listener
    expect(listener.mock.calls.length).toBe(1);
    expect(listener.mock.calls[0].length).toBe(1);
    expect(listener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].message).toBe(
      "INVALID_RESULT: Transport threw an error on a call to disconnect() when previous state emission was 'start' and client was understood to be connected."
    );
    expect(listener.mock.calls[0][0].transportError).toBeInstanceOf(Error);
    expect(listener.mock.calls[0][0].transportError.message).toBe("JUNK_ERROR");
  });

  it("if the call was valid and the transport returns nothing, it should return nothing and emit nothing", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listener
    const listener = jest.fn();
    wrapper.on("transportError", listener);

    // Check the result
    expect(wrapper.disconnect("client1")).toBe(undefined);

    // Check the listener
    expect(listener.mock.calls.length).toBe(0);
  });
});

// Events

describe("the transport 'starting' event", () => {
  it("if the last emission was 'starting', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startingListener = jest.fn();
    wrapper.on("starting", startingListener);

    // Emit
    transport.emit("starting");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'starting' event following a 'starting' emission."
    );
    expect(startingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'start', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startingListener = jest.fn();
    wrapper.on("starting", startingListener);

    // Emit
    transport.emit("starting");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'starting' event following a 'start' emission."
    );
    expect(startingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startingListener = jest.fn();
    wrapper.on("starting", startingListener);

    // Emit
    transport.emit("starting");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'starting' event following a 'stopping' emission."
    );
    expect(startingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stop' but the arguments were invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startingListener = jest.fn();
    wrapper.on("starting", startingListener);

    // Emit
    transport.emit("starting", "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'starting' event."
    );
    expect(startingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stop' and arguments were valid, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startingListener = jest.fn();
    wrapper.on("starting", startingListener);

    // Emit
    transport.emit("starting");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(startingListener.mock.calls.length).toBe(1);
    expect(startingListener.mock.calls[0].length).toBe(0);
  });
});

describe("the transport 'start' event", () => {
  it("if the last emission was 'stop', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startListener = jest.fn();
    wrapper.on("start", startListener);

    // Emit
    transport.emit("start");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'start' event following a 'stop' emission."
    );
    expect(startListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'start', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startListener = jest.fn();
    wrapper.on("start", startListener);

    // Emit
    transport.emit("start");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'start' event following a 'start' emission."
    );
    expect(startListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startListener = jest.fn();
    wrapper.on("start", startListener);

    // Emit
    transport.emit("start");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'start' event following a 'stopping' emission."
    );
    expect(startListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting' but the arguments were invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startListener = jest.fn();
    wrapper.on("start", startListener);

    // Emit
    transport.emit("start", "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'start' event."
    );
    expect(startListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting' and arguments were valid, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const startListener = jest.fn();
    wrapper.on("start", startListener);

    // Emit
    transport.emit("start");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(startListener.mock.calls.length).toBe(1);
    expect(startListener.mock.calls[0].length).toBe(0);
  });
});

describe("the transport 'stopping' event", () => {
  it("if the last emission was 'stop', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'stopping' event following a 'stop' emission."
    );
    expect(stoppingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'stopping' event following a 'stopping' emission."
    );
    expect(stoppingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting/started' but the number of arguments was invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping", new Error("FAILURE: ..."), "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'stopping' event."
    );
    expect(stoppingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting/started' and there was an invalid error argument type, it should emit the transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping", "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'stopping' event."
    );
    expect(stoppingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting/started' and there was an invalid error argument message, it should emit the transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping", new Error("JUNK: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'stopping' event."
    );
    expect(stoppingListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting', it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(stoppingListener.mock.calls.length).toBe(1);
    expect(stoppingListener.mock.calls[0].length).toBe(1);
    expect(stoppingListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(stoppingListener.mock.calls[0][0].message).toBe("FAILURE: ...");
  });

  it("if the last emission was 'started' and there was no error argument, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit - from call to disconnect
    transport.emit("stopping");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(stoppingListener.mock.calls.length).toBe(1);
    expect(stoppingListener.mock.calls[0].length).toBe(0);
  });

  it("if the last emission was 'started' and there was a valid error argument, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stoppingListener = jest.fn();
    wrapper.on("stopping", stoppingListener);

    // Emit
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(stoppingListener.mock.calls.length).toBe(1);
    expect(stoppingListener.mock.calls[0].length).toBe(1);
    expect(stoppingListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(stoppingListener.mock.calls[0][0].message).toBe("FAILURE: ...");
  });
});

describe("the transport 'stop' event", () => {
  it("if the last emission was 'stop', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'stop' event following a 'stop' emission."
    );
    expect(stopListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'starting', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'stop' event following a 'starting' emission."
    );
    expect(stopListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'start', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'stop' event following a 'start' emission."
    );
    expect(stopListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping' but the number of arguments was invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop", new Error("FAILURE: ..."), "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'stop' event."
    );
    expect(stopListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping' and there was an invalid error argument type, it should emit the transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop", "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'stop' event."
    );
    expect(stopListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping' and there was an invalid error argument message, it should emit the transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop", new Error("JUNK: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'stop' event."
    );
    expect(stopListener.mock.calls.length).toBe(0);
  });

  it("if the last emission was 'stopping' and there was no error argument, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(stopListener.mock.calls.length).toBe(1);
    expect(stopListener.mock.calls[0].length).toBe(0);
  });

  it("if the last emission was 'stopping' and there was a valid error argument, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started state
    transport.state = () => "started";
    transport.emit("start");

    // Get the transport into stopping state
    transport.state = () => "stopping";
    transport.emit("stopping", new Error("FAILURE: ..."));

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const stopListener = jest.fn();
    wrapper.on("stop", stopListener);

    // Emit
    transport.emit("stop", new Error("FAILURE: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(stopListener.mock.calls.length).toBe(1);
    expect(stopListener.mock.calls[0].length).toBe(1);
    expect(stopListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(stopListener.mock.calls[0][0].message).toBe("FAILURE: ...");
  });
});

describe("the transport 'connect' event", () => {
  it("if the last state emission was not 'start', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const connectListener = jest.fn();
    wrapper.on("connect", connectListener);

    // Emit
    transport.emit("connect", "some client");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'connect' event while not started."
    );
    expect(connectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but there were extraneous arguments, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const connectListener = jest.fn();
    wrapper.on("connect", connectListener);

    // Emit
    transport.emit("connect", "some client", "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'connect' event."
    );
    expect(connectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id type was invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const connectListener = jest.fn();
    wrapper.on("connect", connectListener);

    // Emit
    transport.emit("connect", 123);

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'connect' event."
    );
    expect(connectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id was empty, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const connectListener = jest.fn();
    wrapper.on("connect", connectListener);

    // Emit
    transport.emit("connect", "");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'connect' event."
    );
    expect(connectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id was not unique, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const connectListener = jest.fn();
    wrapper.on("connect", connectListener);

    // Emit
    transport.emit("connect", "client1");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an already-connected client id with the 'connect' event."
    );
    expect(connectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' and the client id was valid, it should emit the event and update the state", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const connectListener = jest.fn();
    wrapper.on("connect", connectListener);

    // Emit
    transport.emit("connect", "client2");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(connectListener.mock.calls.length).toBe(1);
    expect(connectListener.mock.calls[0].length).toBe(1);
    expect(connectListener.mock.calls[0][0]).toBe("client2");

    // Check this._clientIds
    expect(wrapper._clientIds).toEqual(["client1", "client2"]);
  });
});

describe("the transport 'message' event", () => {
  it("if the last state emission was not 'start', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", "some client", "some message");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'message' event while not started."
    );
    expect(messageListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but there were extraneous arguments, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", "some client", "some message", "junk");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'message' event."
    );
    expect(messageListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id type was invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", 123, "some message");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'message' event."
    );
    expect(messageListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id was empty, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", "", "some message");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'message' event."
    );
    expect(messageListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the message type was invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", "client1", 123);

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string message with the 'message' event."
    );
    expect(messageListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id was unknown, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", "some client", "some message");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an unknown client id with the 'message' event."
    );
    expect(messageListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' and the client id was valid, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const messageListener = jest.fn();
    wrapper.on("message", messageListener);

    // Emit
    transport.emit("message", "client1", "some message");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(messageListener.mock.calls.length).toBe(1);
    expect(messageListener.mock.calls[0].length).toBe(2);
    expect(messageListener.mock.calls[0][0]).toBe("client1");
    expect(messageListener.mock.calls[0][1]).toBe("some message");
  });
});

describe("the transport 'disconnect' event", () => {
  it("if the last state emission was not 'start', it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "some client");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "UNEXPECTED_EVENT: Transport emitted a  'disconnect' event while not started."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but there were extraneous arguments, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit(
      "disconnect",
      "some client",
      new Error("DISCONNECTED: ..."),
      "junk"
    );

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed one or more extraneous arguments with the 'disconnect' event."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id type was invalid, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", 123);

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'disconnect' event."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id was empty, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed a non-string or empty client id with the 'disconnect' event."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the client id was unknown, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "some client");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an unknown client id with the 'disconnect' event."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the error had invalid type, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "client1", 123);

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'disconnect' event."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' but the error had invalid message, it should emit transportError", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "client1", new Error("JUNK: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(1);
    expect(transportErrorListener.mock.calls[0].length).toBe(1);
    expect(transportErrorListener.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(transportErrorListener.mock.calls[0][0].message).toBe(
      "BAD_EVENT_ARGUMENT: Transport passed an invalid argument with the 'disconnect' event."
    );
    expect(disconnectListener.mock.calls.length).toBe(0);
  });

  it("if the last state emission was 'start' and arguments were valid with no error, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");
    transport.emit("connect", "client2");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "client1");

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(disconnectListener.mock.calls.length).toBe(1);
    expect(disconnectListener.mock.calls[0].length).toBe(1);
    expect(disconnectListener.mock.calls[0][0]).toBe("client1");

    // Check wrapper._clientIds
    expect(wrapper._clientIds).toEqual(["client2"]);
  });

  it("if the last state emission was 'start' and arguments were valid with a STOPPING error, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");
    transport.emit("connect", "client2");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "client1", new Error("STOPPING: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(disconnectListener.mock.calls.length).toBe(1);
    expect(disconnectListener.mock.calls[0].length).toBe(2);
    expect(disconnectListener.mock.calls[0][0]).toBe("client1");
    expect(disconnectListener.mock.calls[0][1]).toBeInstanceOf(Error);
    expect(disconnectListener.mock.calls[0][1].message).toBe("STOPPING: ...");

    // Check wrapper._clientIds
    expect(wrapper._clientIds).toEqual(["client2"]);
  });

  it("if the last state emission was 'start' and arguments were valid with a FAILURE error, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");
    transport.emit("connect", "client2");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit("disconnect", "client1", new Error("FAILURE: ..."));

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(disconnectListener.mock.calls.length).toBe(1);
    expect(disconnectListener.mock.calls[0].length).toBe(2);
    expect(disconnectListener.mock.calls[0][0]).toBe("client1");
    expect(disconnectListener.mock.calls[0][1]).toBeInstanceOf(Error);
    expect(disconnectListener.mock.calls[0][1].message).toBe("FAILURE: ...");

    // Check wrapper._clientIds
    expect(wrapper._clientIds).toEqual(["client2"]);
  });

  it("if the last state emission was 'start' and arguments were valid with a HANDSHAKE_TIMEOUT error, it should emit the event", () => {
    // Set up the transport
    const transport = emitter({
      on: () => {},
      state: () => "stopped",
      start: () => {},
      stop: () => {},
      send: () => {},
      disconnect: () => {}
    });
    const wrapper = transportWrapper(transport);

    // Get the transport into starting state
    wrapper.start();
    transport.state = () => "starting";
    transport.emit("starting");

    // Get the transport into started
    transport.state = () => "started";
    transport.emit("start");

    // Connect the client
    transport.emit("connect", "client1");
    transport.emit("connect", "client2");

    // Set up listeners
    const transportErrorListener = jest.fn();
    wrapper.on("transportError", transportErrorListener);
    const disconnectListener = jest.fn();
    wrapper.on("disconnect", disconnectListener);

    // Emit
    transport.emit(
      "disconnect",
      "client1",
      new Error("HANDSHAKE_TIMEOUT: ...")
    );

    // Check the listeners
    expect(transportErrorListener.mock.calls.length).toBe(0);
    expect(disconnectListener.mock.calls.length).toBe(1);
    expect(disconnectListener.mock.calls[0].length).toBe(2);
    expect(disconnectListener.mock.calls[0][0]).toBe("client1");
    expect(disconnectListener.mock.calls[0][1]).toBeInstanceOf(Error);
    expect(disconnectListener.mock.calls[0][1].message).toBe(
      "HANDSHAKE_TIMEOUT: ..."
    );

    // Check wrapper._clientIds
    expect(wrapper._clientIds).toEqual(["client2"]);
  });
});
