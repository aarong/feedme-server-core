import emitter from "component-emitter";
import _ from "lodash";
import server from "../server";
import transportWrapper from "../transportwrapper";

const harnessProto = {};

export default function harnessFactory(options = {}) {
  const harness = Object.create(harnessProto);

  // Create mock transport wrapper (stopped)
  const t = {};
  emitter(t);
  t.state = jest.fn();
  t.state.mockReturnValue("stopped");
  t.start = jest.fn();
  t.stop = jest.fn();
  t.send = jest.fn();
  t.disconnect = jest.fn();
  harness.transport = t;

  // Function to reset mock transport functions
  t.mockClear = function mockClear() {
    t.state.mockClear();
    t.start.mockClear();
    t.stop.mockClear();
    t.send.mockClear();
    t.disconnect.mockClear();
  };

  // Create the server
  options.transportWrapper = transportWrapper(t); // eslint-disable-line no-param-reassign
  harness.server = server(options);

  return harness;
}

harnessFactory.toHaveState = function toHaveState(
  receivedServer,
  expectedState
) {
  // Check all that state members are as expected

  let err = null;

  // Check root keys
  // Needed because _.keys(undefined) is [] below (no error on missing)
  if (
    !_.isEqual(
      _.keys(expectedState).sort(),
      [
        "_options",
        "_transportWrapper",
        "_transportWrapperState",
        "_clientIds",
        "_transportClientIds",
        "_handshakeTimers",
        "_handshakeStatus",
        "_handshakeResponses",
        "_handshakeResponseStates",
        "_actionResponses",
        "_actionResponseStates",
        "_clientFeedStates",
        "_feedClientStates",
        "_terminationTimers",
        "_feedOpenResponses",
        "_feedOpenResponseStates",
        "_feedCloseResponses",
        "_feedCloseResponseStates"
      ].sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected root keys to be valid, but they weren't";
      }
    };
  }

  // Check ._options
  if (!_.isEqual(receivedServer._options, expectedState._options)) {
    return {
      pass: false,
      message() {
        return "expected ._options to match, but they didn't";
      }
    };
  }

  // Check ._transportWrapper
  if (receivedServer._transportWrapper !== expectedState._transportWrapper) {
    return {
      pass: false,
      message() {
        return "expected transport wrapper objects to match, but they didn't";
      }
    };
  }

  // Check ._transportWrapper state
  if (
    receivedServer._transportWrapper.state() !==
    expectedState._transportWrapperState
  ) {
    return {
      pass: false,
      message() {
        return "expected transport wrapper states to match, but they didn't";
      }
    };
  }

  // Check ._clientIds
  if (!_.isEqual(receivedServer._clientIds, expectedState._clientIds)) {
    return {
      pass: false,
      message() {
        return "expected ._clientIds to match, but they didn't";
      }
    };
  }

  // Check ._transportClientIds
  if (
    !_.isEqual(
      receivedServer._transportClientIds,
      expectedState._transportClientIds
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._transportClientIds to match, but they didn't";
      }
    };
  }

  // Check ._handshakeTimers keys
  if (
    !_.isEqual(
      _.keys(receivedServer._handshakeTimers).sort(),
      _.keys(expectedState._handshakeTimers).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._handshakeTimers keys to match, but they didn't";
      }
    };
  }

  // Check ._handshakeTimers values (both must be truthy)
  _.each(receivedServer._handshakeTimers, (timerId, cid) => {
    if (
      !receivedServer._handshakeTimers[cid] ||
      !expectedState._handshakeTimers[cid]
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._handshakeTimers values to match, but they didn't";
        }
      };
    }
  });
  if (err) {
    return err;
  }

  // Check ._handshakeStatus
  if (
    !_.isEqual(receivedServer._handshakeStatus, expectedState._handshakeStatus)
  ) {
    return {
      pass: false,
      message() {
        return "expected ._handshakeStatus to match, but they didn't";
      }
    };
  }

  // Check ._handshakeResponses keys
  if (
    !_.isEqual(
      _.keys(receivedServer._handshakeResponses).sort(),
      _.keys(expectedState._handshakeResponses).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._handshakeResponses keys to match, but they didn't";
      }
    };
  }

  // Check ._handshakeResponses values
  _.each(receivedServer._handshakeResponses, (resp, cid) => {
    if (
      receivedServer._handshakeResponses[cid] !==
      expectedState._handshakeResponses[cid]
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._handshakeResponses values to match, but they didn't";
        }
      };
    }
  });
  if (err) {
    return err;
  }

  // Check ._handshakeResponseStates keys
  if (
    !_.isEqual(
      _.keys(receivedServer._handshakeResponses).sort(),
      _.keys(expectedState._handshakeResponseStates).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._handshakeResponseStates keys to match, but they didn't";
      }
    };
  }

  // Check ._handshakeResponseStates values
  _.each(receivedServer._handshakeResponses, (state, cid) => {
    // Check keys
    if (
      !_.isEqual(
        _.keys(expectedState._handshakeResponseStates[cid]).sort(),
        ["_server", "_handshakeRequest", "_appResponded", "_neutralized"].sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._handshakeResponseStates[cid] keys to be valid, but they weren't";
        }
      };
    }

    // Check values
    if (
      receivedServer._handshakeResponses[cid]._server !==
        expectedState._handshakeResponseStates[cid]._server ||
      !_.isEqual(
        receivedServer._handshakeResponses[cid]._handshakeRequest,
        expectedState._handshakeResponseStates[cid]._handshakeRequest
      ) ||
      receivedServer._handshakeResponses[cid]._appResponded !==
        expectedState._handshakeResponseStates[cid]._appResponded ||
      receivedServer._handshakeResponses[cid]._neutralized !==
        expectedState._handshakeResponseStates[cid]._neutralized
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._handshakeResponseStates[cid] values to match, but they didn't";
        }
      };
    }
  });
  if (err) {
    return err;
  }

  // Check ._actionResponses keys
  if (
    !_.isEqual(
      _.keys(receivedServer._actionResponses).sort(),
      _.keys(expectedState._actionResponses).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._actionResponses keys to match, but they didn't";
      }
    };
  }

  // Check._actionResponses values
  _.each(receivedServer._actionResponses, (clientResps, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._actionResponses[cid]).sort(),
        _.keys(expectedState._actionResponses[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._actionResponses[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values
    _.each(clientResps, (resp, acb) => {
      if (
        receivedServer._actionResponses[cid][acb] !==
        expectedState._actionResponses[cid][acb]
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._actionResponses[cid] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Check ._actionResponseStates keys
  if (
    !_.isEqual(
      _.keys(receivedServer._actionResponses).sort(),
      _.keys(expectedState._actionResponseStates).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._actionResponseStates keys to match, but they didn't";
      }
    };
  }

  // Check ._actionResponseStates values
  _.each(receivedServer._actionResponses, (clientResps, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._actionResponses[cid]).sort(),
        _.keys(expectedState._actionResponseStates[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._actionResponseStates[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values
    _.each(clientResps, (resp, acb) => {
      // Check client-acb keys
      if (
        !_.isEqual(
          _.keys(expectedState._actionResponseStates[cid][acb]).sort(),
          ["_server", "_actionRequest", "_appResponded", "_neutralized"].sort()
        )
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._actionResponseStates[cid][acb] keys to be valid, but they weren't";
          }
        };
      }

      // Check client-acb values
      if (
        receivedServer._actionResponses[cid][acb]._server !==
          expectedState._actionResponseStates[cid][acb]._server ||
        !_.isEqual(
          receivedServer._actionResponses[cid][acb]._actionRequest,
          expectedState._actionResponseStates[cid][acb]._actionRequest
        ) ||
        receivedServer._actionResponses[cid][acb]._appResponded !==
          expectedState._actionResponseStates[cid][acb]._appResponded ||
        receivedServer._actionResponses[cid][acb]._neutralized !==
          expectedState._actionResponseStates[cid][acb]._neutralized
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._actionResponseStates[cid][acb] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Check ._clientFeedStates
  if (
    !_.isEqual(
      receivedServer._clientFeedStates,
      expectedState._clientFeedStates
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._clientFeedStates to match, but they didn't";
      }
    };
  }

  // Check ._feedClientStates
  if (
    !_.isEqual(
      receivedServer._feedClientStates,
      expectedState._feedClientStates
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._feedClientStates to match, but they didn't";
      }
    };
  }

  // Check ._terminationTimers keys
  if (
    !_.isEqual(
      _.keys(receivedServer._terminationTimers).sort(),
      _.keys(expectedState._terminationTimers).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._terminationTimers keys to match, but they didn't";
      }
    };
  }

  // Check ._terminationTimers values
  _.each(receivedServer._terminationTimers, (clientTimers, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._terminationTimers[cid]).sort(),
        _.keys(expectedState._terminationTimers[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._terminationTimers[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values (both must be truthy)
    _.each(clientTimers, (timer, feedSerial) => {
      if (
        !receivedServer._terminationTimers[cid][feedSerial] ||
        !expectedState._terminationTimers[cid][feedSerial]
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._terminationTimers[cid] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Check ._feedOpenResponses keys
  if (
    !_.isEqual(
      _.keys(receivedServer._feedOpenResponses).sort(),
      _.keys(expectedState._feedOpenResponses).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._feedOpenResponses keys to match, but they didn't";
      }
    };
  }

  // Check ._feedOpenResponses values
  _.each(receivedServer._feedOpenResponses, (clientResps, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._feedOpenResponses[cid]).sort(),
        _.keys(expectedState._feedOpenResponses[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._feedOpenResponses[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values
    _.each(clientResps, (resp, feedSerial) => {
      if (
        receivedServer._feedOpenResponses[cid][feedSerial] !==
        expectedState._feedOpenResponses[cid][feedSerial]
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._feedOpenResponses[cid] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Check ._feedOpenResponseStates keys
  if (
    !_.isEqual(
      _.keys(receivedServer._feedOpenResponses).sort(),
      _.keys(expectedState._feedOpenResponseStates).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._feedOpenResponseStates keys to match, but they didn't";
      }
    };
  }

  // Check ._feedOpenResponseStates values
  _.each(receivedServer._feedOpenResponses, (clientResps, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._feedOpenResponses[cid]).sort(),
        _.keys(expectedState._feedOpenResponseStates[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._feedOpenResponseStates[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values
    _.each(clientResps, (resp, ser) => {
      // Check client-ser keys
      if (
        !_.isEqual(
          _.keys(expectedState._feedOpenResponseStates[cid][ser]).sort(),
          [
            "_server",
            "_feedOpenRequest",
            "_appResponded",
            "_neutralized"
          ].sort()
        )
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._feedOpenResponseStates[cid][ser] keys to be valid, but they weren't";
          }
        };
      }

      // Check client-ser values
      if (
        receivedServer._feedOpenResponses[cid][ser]._server !==
          expectedState._feedOpenResponseStates[cid][ser]._server ||
        !_.isEqual(
          receivedServer._feedOpenResponses[cid][ser]._feedOpenRequest,
          expectedState._feedOpenResponseStates[cid][ser]._feedOpenRequest
        ) ||
        receivedServer._feedOpenResponses[cid][ser]._appResponded !==
          expectedState._feedOpenResponseStates[cid][ser]._appResponded ||
        receivedServer._feedOpenResponses[cid][ser]._neutralized !==
          expectedState._feedOpenResponseStates[cid][ser]._neutralized
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Check ._feedCloseResponses keys
  if (
    !_.isEqual(
      _.keys(receivedServer._feedCloseResponses).sort(),
      _.keys(expectedState._feedCloseResponses).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._feedCloseResponses keys to match, but they didn't";
      }
    };
  }

  // Check ._feedCloseResponses values
  _.each(receivedServer._feedCloseResponses, (clientResps, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._feedCloseResponses[cid]).sort(),
        _.keys(expectedState._feedCloseResponses[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._feedCloseResponses[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values
    _.each(clientResps, (resp, feedSerial) => {
      if (
        receivedServer._feedCloseResponses[cid][feedSerial] !==
        expectedState._feedCloseResponses[cid][feedSerial]
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._feedCloseResponses[cid] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Check ._feedCloseResponseStates keys
  if (
    !_.isEqual(
      _.keys(receivedServer._feedCloseResponses).sort(),
      _.keys(expectedState._feedCloseResponseStates).sort()
    )
  ) {
    return {
      pass: false,
      message() {
        return "expected ._feedCloseResponseStates keys to match, but they didn't";
      }
    };
  }

  // Check ._feedCloseResponseStates values
  _.each(receivedServer._feedCloseResponses, (clientResps, cid) => {
    // Check client keys
    if (
      !_.isEqual(
        _.keys(receivedServer._feedCloseResponses[cid]).sort(),
        _.keys(expectedState._feedCloseResponseStates[cid]).sort()
      )
    ) {
      err = {
        pass: false,
        message() {
          return "expected ._feedCloseResponseStates[cid] keys to match, but they didn't";
        }
      };
    }

    // Check client values
    _.each(clientResps, (resp, ser) => {
      // Check client-ser keys
      if (
        !_.isEqual(
          _.keys(expectedState._feedCloseResponseStates[cid][ser]).sort(),
          [
            "_server",
            "_feedCloseRequest",
            "_appResponded",
            "_neutralized"
          ].sort()
        )
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._feedCloseResponseStates[cid][ser] keys to be valid, but they weren't";
          }
        };
      }

      // Check client-ser values
      if (
        receivedServer._feedCloseResponses[cid][ser]._server !==
          expectedState._feedCloseResponseStates[cid][ser]._server ||
        !_.isEqual(
          receivedServer._feedCloseResponses[cid][ser]._feedCloseRequest,
          expectedState._feedCloseResponseStates[cid][ser]._feedCloseRequest
        ) ||
        receivedServer._feedCloseResponses[cid][ser]._appResponded !==
          expectedState._feedCloseResponseStates[cid][ser]._appResponded ||
        receivedServer._feedCloseResponses[cid][ser]._neutralized !==
          expectedState._feedCloseResponseStates[cid][ser]._neutralized
      ) {
        err = {
          pass: false,
          message() {
            return "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't";
          }
        };
      }
    });
  });
  if (err) {
    return err;
  }

  // Match
  return { pass: true };
};

harnessProto.createServerListener = function createServerListener() {
  const l = {
    starting: jest.fn(),
    start: jest.fn(),
    stopping: jest.fn(),
    stop: jest.fn(),
    connect: jest.fn(),
    handshake: jest.fn(),
    action: jest.fn(),
    feedOpen: jest.fn(),
    feedClose: jest.fn(),
    disconnect: jest.fn(),
    badClientMessage: jest.fn(),
    transportError: jest.fn()
  };
  l.mockClear = function mockClear() {
    l.starting.mockClear();
    l.start.mockClear();
    l.stopping.mockClear();
    l.stop.mockClear();
    l.connect.mockClear();
    l.handshake.mockClear();
    l.action.mockClear();
    l.feedOpen.mockClear();
    l.feedClose.mockClear();
    l.disconnect.mockClear();
    l.badClientMessage.mockClear();
    l.transportError.mockClear();
  };
  this.server.on("starting", l.starting);
  this.server.on("start", l.start);
  this.server.on("stopping", l.stopping);
  this.server.on("stop", l.stop);
  this.server.on("connect", l.connect);
  this.server.on("handshake", l.handshake);
  this.server.on("action", l.action);
  this.server.on("feedOpen", l.feedOpen);
  this.server.on("feedClose", l.feedClose);
  this.server.on("disconnect", l.disconnect);
  this.server.on("badClientMessage", l.badClientMessage);
  this.server.on("transportError", l.transportError);
  return l;
};

harnessProto.getServerState = function getServerState() {
  const state = {};

  state._options = _.cloneDeep(this.server._options); // Object copy

  state._transportWrapper = this.server._transportWrapper; // Object reference
  state._transportWrapperState = this.server._transportWrapper.state(); // String

  state._clientIds = _.cloneDeep(this.server._clientIds); // Object copy
  state._transportClientIds = _.cloneDeep(this.server._transportClientIds); // Object copy

  state._handshakeTimers = _.cloneDeep(this.server._handshakeTimers); // Object copy
  state._handshakeStatus = _.cloneDeep(this.server._handshakeStatus); // Object copy

  state._handshakeResponses = {}; // _handshakeResponses[cid] = object reference
  state._handshakeResponseStates = {}; // _handshakeResponseStates[cid] = { _server, ... }
  _.each(this.server._handshakeResponses, (resp, cid) => {
    state._handshakeResponses[cid] = resp; // object reference
    state._handshakeResponseStates[cid] = {
      _server: resp._server, // object reference
      _handshakeRequest: _.cloneDeep(resp._handshakeRequest), // object copy
      _appResponded: resp._appResponded, // bool
      _neutralized: resp._neutralized // bool
    };
  });

  state._actionResponses = {}; // _actionResponses[cid][acb] = object reference
  state._actionResponseStates = {}; // _actionResponseStates[cid][acb] = { _server, ... }
  _.each(this.server._actionResponses, (clientResps, cid) => {
    state._actionResponses[cid] = {};
    state._actionResponseStates[cid] = {};
    _.each(clientResps, (resp, acb) => {
      state._actionResponses[cid][acb] = resp; // object reference
      state._actionResponseStates[cid][acb] = {
        _server: resp._server, // object reference
        _actionRequest: _.cloneDeep(resp._actionRequest), // object copy
        _appResponded: resp._appResponded, // bool
        _neutralized: resp._neutralized // bool
      };
    });
  });

  state._clientFeedStates = _.cloneDeep(this.server._clientFeedStates);
  state._feedClientStates = _.cloneDeep(this.server._feedClientStates);
  state._terminationTimers = _.cloneDeep(this.server._terminationTimers); // Object copy

  state._feedOpenResponses = {}; // _feedOpenResponses[cid][ser] = object reference
  state._feedOpenResponseStates = {}; // _feedOpenResponseStates[cid][ser] = { _server, ... }
  _.each(this.server._feedOpenResponses, (clientResps, cid) => {
    state._feedOpenResponses[cid] = {};
    state._feedOpenResponseStates[cid] = {};
    _.each(clientResps, (resp, ser) => {
      state._feedOpenResponses[cid][ser] = resp; // object reference
      state._feedOpenResponseStates[cid][ser] = {
        _server: resp._server, // object reference
        _feedOpenRequest: _.cloneDeep(resp._feedOpenRequest), // object copy
        _appResponded: resp._appResponded, // bool
        _neutralized: resp._neutralized // bool
      };
    });
  });

  state._feedCloseResponses = {}; // _feedCloseResponses[cid][ser] = object reference
  state._feedCloseResponseStates = {}; // _feedCloseResponseStates[cid][ser] = { _server, ... }
  _.each(this.server._feedCloseResponses, (clientResps, cid) => {
    state._feedCloseResponses[cid] = {};
    state._feedCloseResponseStates[cid] = {};
    _.each(clientResps, (resp, ser) => {
      state._feedCloseResponses[cid][ser] = resp; // object reference
      state._feedCloseResponseStates[cid][ser] = {
        _server: resp._server, // object reference
        _feedCloseRequest: _.cloneDeep(resp._feedCloseRequest), // object copy
        _appResponded: resp._appResponded, // bool
        _neutralized: resp._neutralized // bool
      };
    });
  });

  return state;
};

harnessProto.makeServerStarted = function makeServerStarted() {
  this.server.start();
  this.transport.state.mockReturnValue("starting");
  this.transport.emit("starting");
  this.transport.state.mockReturnValue("started");
  this.transport.emit("start");
  this.transport.mockClear();
};

harnessProto.makeClient = function connectClient(tcid) {
  // Create a post-handshake client
  // Return Feedme client id

  let cid;
  this.server.once("handshake", (hsreq, hsres) => {
    cid = hsreq.clientId;
    hsres.success();
  });
  this.transport.emit("connect", tcid);
  this.transport.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "Handshake",
      Versions: ["0.1"]
    })
  );
  this.transport.mockClear();
  return cid;
};

harnessProto.makeFeedOpening = function makeFeedOpening(tcid, fn, fa) {
  // Get a closed client feed into the opening state
  // Return FeedOpenResponse

  let res;
  this.server.once("feedOpen", (foreq, fores) => {
    res = fores;
  });
  this.transport.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "FeedOpen",
      FeedName: fn,
      FeedArgs: fa
    })
  );
  this.transport.mockClear();
  return res;
};

harnessProto.makeFeedOpen = function makeFeedOpening(tcid, fn, fa, fd) {
  // Get a closed client feed into the open state

  this.server.once("feedOpen", (foreq, fores) => {
    fores.success(fd);
  });
  this.transport.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "FeedOpen",
      FeedName: fn,
      FeedArgs: fa
    })
  );
  this.transport.mockClear();
};

harnessProto.makeFeedClosing = function makeFeedOpening(tcid, fn, fa) {
  // Get a closed client feed into the closing state
  // Return FeedCloseResponse

  this.server.once("feedOpen", (foreq, fores) => {
    fores.success({});
  });
  this.transport.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "FeedOpen",
      FeedName: fn,
      FeedArgs: fa
    })
  );

  let res;
  this.server.once("feedClose", (fcreq, fcres) => {
    res = fcres;
  });
  this.transport.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "FeedClose",
      FeedName: fn,
      FeedArgs: fa
    })
  );
  this.transport.mockClear();
  return res;
};

harnessProto.makeFeedTerminated = function makeFeedOpening(tcid, fn, fa) {
  // Get a closed client feed into the terminated state

  this.server.once("feedOpen", (foreq, fores) => {
    fores.success({});
  });
  this.transport.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "FeedOpen",
      FeedName: fn,
      FeedArgs: fa
    })
  );

  this.server.feedTermination({
    clientId: this.server._clientIds[tcid], // A bit hacky
    feedName: fn,
    feedArgs: fa,
    errorCode: "DISCARDED_CODE",
    errorData: { discarded: "data" }
  });

  this.transport.mockClear();
};
