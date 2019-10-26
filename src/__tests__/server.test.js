import emitter from "component-emitter";
import _ from "lodash";
import check from "check-types";
import md5Calculator from "feedme-util/md5calculator";
import feedSerializer from "feedme-util/feedserializer";
import server from "../server";
import config from "../config";

/*

Testing Strategy

Unit: Each method (app-, transport-, or internally-triggered) code branch.
For each unit, check that all potential results are as desired, including
verifying no change (errors, events, state, transport calls, return values).

1. Test state-modifying functionality
    For all outside function calls, transport events, and internal functions
      Test all errors (thrown)
      For each possible success type (by branch)
        Check server events (no extra)
        Check server internal state
        Check transport calls (no extra)
        Check outbound callbacks are called (none)
        Check inbound callbacks from transport and timers
          Check server events
          Check server internal state
          Check transport calls
          Check outbound callbacks are called (none)
        Check return value

2. Test state-getting functionality. Outside-facing and internal.
    No need to worry about events, state change, transport calls, or callbacks.
    Test that each "type" of state results in the correct error being thrown or
    return value being returned. This means that a given code path may
    have multiple tests.

State: Server members
    ._options
    ._transportWrapper (including state)
      ._transportWrapperState
    ._clientIds
    ._transportClientIds
    ._handshakeTimers
    ._handshakeStatus
    ._handshakeResponses (including state)
      ._handshakeResponseStates._server
      ._handshakeResponseStates._handshakeRequest
      ._handshakeResponseStates._appResponded
      ._handshakeResponseStates._neutralized
    ._actionResponses (including state)
      ._actionResponseStates._server
      ._actionResponseStates._actionRequest
      ._actionResponseStates._appResponded
      ._actionResponseStates._neutralized
    ._clientFeedStates
    ._feedClientStates
    ._terminationTimers
    ._feedOpenResponses (including state)
      ._feedOpenResponseStates._server
      ._feedOpenResponseStates._feedOpenRequest
      ._feedOpenResponseStates._appResponded
      ._feedOpenResponseStates._neutralized
    ._feedCloseResponses (including state)
      ._feedCloseResponseStates._server
      ._feedCloseResponseStates._feedCloseRequest
      ._feedCloseResponseStates._appResponded
      ._feedCloseResponseStates._neutralized

1. State-modifying functionality
    Outside-triggered
      server()
      .start()
      .stop()
      .actionRevelation()
      .feedTermination()
      .disconnect()
      ._appHandshakeSuccess() via handshakeResponse.success()
      ._appActionSuccess() via actionResponse.success()
      ._appActionFailures() via actionResponse.failure()
      ._appFeedOpenSuccess() via feedOpenResponse.success()
      ._appFeedOpenFailure() via feedOpenResponse.failure()
      ._appFeedCloseSuccess() via feedCloseResponse.success()
    Transport-triggered
      ._processStarting()
      ._processStart()
      ._processStopping()
      ._processStop()
      ._processConnect()
      ._processDisconnect()
      ._processMessage()
        ._processHandshake()
        ._processAction()
        ._processFeedOpen()
        ._processFeedClose()
    Internal
      ._setState()

2. State-getting functionality
    Server functions
      .state()
    Internal helper functions:
      ._getState()
      ._getClientFeeds()
      ._getFeedClients()

*/

jest.useFakeTimers();
// const epsilon = 1;

// Test harness and associated Jest state matcher

const harnessProto = {};

const harnessFactory = function harnessFactory(options = {}) {
  /*
    Members:
        .transportWrapper (=server._transportWrapper)
        .server
    Functions:
        .createServerListener()
        .getServerState()
  */

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
  harness.transportWrapper = t;

  // Function to reset mock transport functions
  t.mockClear = function mockClear() {
    t.state.mockClear();
    t.start.mockClear();
    t.stop.mockClear();
    t.send.mockClear();
    t.disconnect.mockClear();
  };

  // Create the server
  options.transportWrapper = t; // eslint-disable-line no-param-reassign
  harness.server = server(options);

  return harness;
};

harnessProto.createServerListener = function createServerListener() {
  const l = {
    starting: jest.fn(),
    start: jest.fn(),
    stopping: jest.fn(),
    stop: jest.fn(),
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

const toHaveState = function toHaveState(receivedServer, expectedState) {
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

  // Check ._handshakeTimers values
  _.each(receivedServer._handshakeTimers, (timerId, cid) => {
    if (
      !check.number(receivedServer._handshakeTimers[cid]) ||
      !check.number(expectedState._handshakeTimers[cid])
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

    // Check client values
    _.each(clientTimers, (timer, feedSerial) => {
      if (
        !check.number(receivedServer._terminationTimers[cid][feedSerial]) ||
        !check.number(expectedState._terminationTimers[cid][feedSerial])
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

expect.extend({
  toHaveState
});

harnessProto.makeServerStarted = function makeServerStarted() {
  this.server.start();
  this.transportWrapper.state.mockReturnValue("starting");
  this.transportWrapper.emit("starting");
  this.transportWrapper.state.mockReturnValue("started");
  this.transportWrapper.emit("start");
  this.transportWrapper.mockClear();
};

harnessProto.makeClient = function connectClient(tcid) {
  // Create a post-handshake client
  // Return Feedme client id

  let cid;
  this.server.once("handshake", (hsreq, hsres) => {
    cid = hsreq.clientId;
    hsres.success();
  });
  this.transportWrapper.emit("connect", tcid);
  this.transportWrapper.emit(
    "message",
    tcid,
    JSON.stringify({
      MessageType: "Handshake",
      Versions: ["0.1"]
    })
  );
  this.transportWrapper.mockClear();
  return cid;
};

harnessProto.makeFeedOpening = function makeFeedOpening(cid, fn, fa) {
  // Get a closed client feed into the opening state
  // Return FeedOpenResponse

  let res;
  this.server.once("feedOpen", (foreq, fores) => {
    res = fores;
  });
  this.transportWrapper.emit(
    "message",
    cid,
    JSON.stringify({
      MessageType: "FeedOpen",
      FeedName: fn,
      FeedArgs: fa
    })
  );
  this.transportWrapper.mockClear();
  return res;
};

harnessProto.makeFeedOpen = function makeFeedOpening(cid, fn, fa, fd) {
  // Get a closed client feed into the open state

  this.server.once("feedOpen", (foreq, fores) => {
    fores.success(fd);
  });
  this.transportWrapper.emit(
    "message",
    cid,
    JSON.stringify({
      MessageType: "FeedOpen",
      FeedName: fn,
      FeedArgs: fa
    })
  );
  this.transportWrapper.mockClear();
};

harnessProto.makeFeedClosing = function makeFeedOpening(cid, fn, fa) {
  // Get a closed client feed into the closing state
  // Return FeedCloseResponse

  this.server.once("feedOpen", (foreq, fores) => {
    fores.success({});
  });
  this.transportWrapper.emit(
    "message",
    cid,
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
  this.transportWrapper.emit(
    "message",
    cid,
    JSON.stringify({
      MessageType: "FeedClose",
      FeedName: fn,
      FeedArgs: fa
    })
  );
  this.transportWrapper.mockClear();
  return res;
};

// Testing: harness tests

describe("The test harness", () => {
  describe("the factory function", () => {
    it("should return an appropriately structured object", () => {
      const harness = harnessFactory();
      expect(check.object(harness)).toBe(true);
      expect(check.object(harness.server)).toBe(true);
      expect(check.object(harness.transportWrapper)).toBe(true);
      expect(check.function(harness.transportWrapper.state)).toBe(true);
      expect(check.function(harness.transportWrapper.start)).toBe(true);
      expect(check.function(harness.transportWrapper.stop)).toBe(true);
      expect(check.function(harness.transportWrapper.send)).toBe(true);
      expect(check.function(harness.transportWrapper.disconnect)).toBe(true);
      expect(check.function(harness.transportWrapper.on)).toBe(true);
      expect(check.function(harness.transportWrapper.emit)).toBe(true);
      expect(check.function(harness.transportWrapper.mockClear)).toBe(true);
      expect(check.function(harness.createServerListener)).toBe(true);
      expect(check.function(harness.getServerState)).toBe(true);
    });

    it("should overlay options", () => {
      const harness = harnessFactory({ handshakeMs: 123, terminationMs: 456 });
      expect(harness.server._options.handshakeMs).toBe(123);
      expect(harness.server._options.terminationMs).toBe(456);
    });
  });

  describe("the harness.createServerListener() function", () => {
    it("should return a functioning listener object", () => {
      const harness = harnessFactory();
      const l = harness.createServerListener();

      harness.server.emit("starting", 123);
      expect(l.starting.mock.calls.length).toBe(1);
      expect(l.starting.mock.calls[0].length).toBe(1);
      expect(l.starting.mock.calls[0][0]).toBe(123);

      harness.server.emit("start", 123);
      expect(l.start.mock.calls.length).toBe(1);
      expect(l.start.mock.calls[0].length).toBe(1);
      expect(l.start.mock.calls[0][0]).toBe(123);

      harness.server.emit("stopping", 123);
      expect(l.stopping.mock.calls.length).toBe(1);
      expect(l.stopping.mock.calls[0].length).toBe(1);
      expect(l.stopping.mock.calls[0][0]).toBe(123);

      harness.server.emit("stop", 123);
      expect(l.stop.mock.calls.length).toBe(1);
      expect(l.stop.mock.calls[0].length).toBe(1);
      expect(l.stop.mock.calls[0][0]).toBe(123);

      harness.server.emit("handshake", 123);
      expect(l.handshake.mock.calls.length).toBe(1);
      expect(l.handshake.mock.calls[0].length).toBe(1);
      expect(l.handshake.mock.calls[0][0]).toBe(123);

      harness.server.emit("action", 123);
      expect(l.action.mock.calls.length).toBe(1);
      expect(l.action.mock.calls[0].length).toBe(1);
      expect(l.action.mock.calls[0][0]).toBe(123);

      harness.server.emit("feedOpen", 123);
      expect(l.feedOpen.mock.calls.length).toBe(1);
      expect(l.feedOpen.mock.calls[0].length).toBe(1);
      expect(l.feedOpen.mock.calls[0][0]).toBe(123);

      harness.server.emit("feedClose", 123);
      expect(l.feedClose.mock.calls.length).toBe(1);
      expect(l.feedClose.mock.calls[0].length).toBe(1);
      expect(l.feedClose.mock.calls[0][0]).toBe(123);

      harness.server.emit("disconnect", 123);
      expect(l.disconnect.mock.calls.length).toBe(1);
      expect(l.disconnect.mock.calls[0].length).toBe(1);
      expect(l.disconnect.mock.calls[0][0]).toBe(123);

      harness.server.emit("badClientMessage", 123);
      expect(l.badClientMessage.mock.calls.length).toBe(1);
      expect(l.badClientMessage.mock.calls[0].length).toBe(1);
      expect(l.badClientMessage.mock.calls[0][0]).toBe(123);

      harness.server.emit("transportError", 123);
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

  describe("the harness.getServerState() and expect(x).toHaveState(y) functions", () => {
    describe("should handle ._options correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory({
          handshakeMs: 123,
          terminationMs: 456
        });
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
        expect(state._options).toEqual({
          handshakeMs: 123,
          terminationMs: 456
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harness.getServerState();
        state._options.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._options to match, but they didn't"
        );
      });
    });

    describe("should handle ._transportWrapper (and state) correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
        expect(state._transportWrapper).toBe(harness.server._transportWrapper);
        expect(state._transportWrapperState).toBe("stopped");
      });

      it("should compare the state correctly - match", () => {
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched object ref", () => {
        const state = harness.getServerState();
        state._transportWrapper = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected transport wrapper objects to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched transport state", () => {
        const state = harness.getServerState();
        state._transportWrapperState = "starting";
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected transport wrapper states to match, but they didn't"
        );
      });
    });

    describe("should handle ._clientIds correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._clientIds = {
          cid1: "tcid1",
          cid2: "tcid2"
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
        expect(state._clientIds).toEqual({
          cid1: "tcid1",
          cid2: "tcid2"
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harness.getServerState();
        state._clientIds.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._clientIds to match, but they didn't"
        );
      });
    });

    describe("should handle ._transportClientIds correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._transportClientIds = {
          tcid1: "cid1",
          tcid2: "cid2"
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
        expect(state._transportClientIds).toEqual({
          tcid1: "cid1",
          tcid2: "cid2"
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harness.getServerState();
        state._transportClientIds.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._transportClientIds to match, but they didn't"
        );
      });
    });

    describe("should handle ._handshakeTimers correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._handshakeTimers = {
          cid1: 123,
          cid2: 456
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
        expect(state._handshakeTimers).toEqual({
          cid1: 123,
          cid2: 456
        });
      });

      it("should compare the state correctly - match with identical timer ids", () => {
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - match with different timer ids", () => {
        const state = harness.getServerState();
        state._handshakeTimers = {
          cid1: 888,
          cid2: 999
        };
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched key", () => {
        const state = harness.getServerState();
        state._handshakeTimers.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeTimers keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched value", () => {
        const state = harness.getServerState();
        state._handshakeTimers.cid1 = "junk";
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeTimers values to match, but they didn't"
        );
      });
    });

    describe("should handle ._handshakeStatus correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._handshakeStatus = {
          cid1: "waiting",
          cid2: "processing"
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
        expect(state._handshakeStatus).toEqual({
          cid1: "waiting",
          cid2: "processing"
        });
      });

      it("should compare the state correctly - match", () => {
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched key", () => {
        const state = harness.getServerState();
        state._handshakeStatus.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeStatus to match, but they didn't"
        );
      });
    });

    describe("should handle ._handshakeResponses (and state) correctly", () => {
      let harness;
      let hsr1;
      let hsr2;
      beforeEach(() => {
        harness = harnessFactory();
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
        harness.server._handshakeResponses = {
          cid1: hsr1,
          cid2: hsr2
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();

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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._handshakeResponses key", () => {
        const state = harness.getServerState();
        state._handshakeResponses.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponses[cid] value", () => {
        const state = harness.getServerState();
        state._handshakeResponses.cid1 = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponses values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates key", () => {
        const state = harness.getServerState();
        state._handshakeResponseStates.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid] key", () => {
        const state = harness.getServerState();
        state._handshakeResponseStates.cid1.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._server", () => {
        const state = harness.getServerState();
        state._handshakeResponseStates.cid1._server = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._handshakeRequest", () => {
        const state = harness.getServerState();
        state._handshakeResponseStates.cid1._handshakeRequest = {
          clientId: "junk"
        };
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._appResponded", () => {
        const state = harness.getServerState();
        state._handshakeResponseStates.cid1._appResponded = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._handshakeResponseStates[cid]._neutralized", () => {
        const state = harness.getServerState();
        state._handshakeResponseStates.cid1._neutralized = true;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._handshakeResponseStates[cid] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._actionResponses (and state) correctly", () => {
      let harness;
      let ar11;
      let ar12;
      let ar21;
      beforeEach(() => {
        harness = harnessFactory();
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
        harness.server._actionResponses = {
          cid1: { acb11: ar11, acb12: ar12 },
          cid2: { acb21: ar21 }
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._actionResponses key", () => {
        const state = harness.getServerState();
        state._actionResponses.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponses[cid] key", () => {
        const state = harness.getServerState();
        state._actionResponses.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponses[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponses[cid] value", () => {
        const state = harness.getServerState();
        state._actionResponses.cid1.acb11 = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponses[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates key", () => {
        const state = harness.getServerState();
        state._actionResponseStates.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid] key", () => {
        const state = harness.getServerState();
        state._actionResponseStates.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb] key", () => {
        const state = harness.getServerState();
        state._actionResponseStates.cid1.acb11.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._server", () => {
        const state = harness.getServerState();
        state._actionResponseStates.cid1.acb11._server = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._actionRequest", () => {
        const state = harness.getServerState();
        state._actionResponseStates.cid1.acb11._actionRequest = {
          clientId: "junk",
          _actionCallbackId: "junk",
          actionName: "junk",
          actionArgs: { action: "junk" }
        };
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._appResponded", () => {
        const state = harness.getServerState();
        state._actionResponseStates.cid1.acb11._appResponded = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._actionResponseStates[cid][acb]._neutralized", () => {
        const state = harness.getServerState();
        state._actionResponseStates.cid1.acb11._neutralized = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._actionResponseStates[cid][acb] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._clientFeedStates correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._clientFeedStates = {
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
        const state = harness.getServerState();
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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harness.getServerState();
        state._clientFeedStates.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._clientFeedStates to match, but they didn't"
        );
      });
    });

    describe("should handle ._feedClientStates correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._feedClientStates = {
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
        const state = harness.getServerState();
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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatch", () => {
        const state = harness.getServerState();
        state._feedClientStates.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedClientStates to match, but they didn't"
        );
      });
    });

    describe("should handle ._terminationTimers correctly", () => {
      let harness;
      beforeEach(() => {
        harness = harnessFactory();
        harness.server._terminationTimers = {
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
        const state = harness.getServerState();
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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - match with different timer ids", () => {
        const state = harness.getServerState();
        state._terminationTimers.cid1.ser1 = 999;
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._terminationTimers key", () => {
        const state = harness.getServerState();
        state._terminationTimers.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._terminationTimers keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._terminationTimers[cid] key", () => {
        const state = harness.getServerState();
        state._terminationTimers.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._terminationTimers[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._terminationTimers[cid] value", () => {
        const state = harness.getServerState();
        state._terminationTimers.cid1.ser1 = "junk";
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._terminationTimers[cid] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._feedOpenResponses (and state) correctly", () => {
      let harness;
      let for11;
      let for12;
      let for21;
      beforeEach(() => {
        harness = harnessFactory();
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
        harness.server._feedOpenResponses = {
          cid1: { ser1: for11, ser2: for12 },
          cid2: { ser1: for21 }
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._feedOpenResponses key", () => {
        const state = harness.getServerState();
        state._feedOpenResponses.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponses[cid] key", () => {
        const state = harness.getServerState();
        state._feedOpenResponses.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponses[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponses[cid] value", () => {
        const state = harness.getServerState();
        state._feedOpenResponses.cid1.ser1 = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponses[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates key", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid] key", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser] key", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.cid1.ser1.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._server", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.cid1.ser1._server = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._actionRequest", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.cid1.ser1._feedOpenRequest = {
          clientId: "junk",
          feedName: "junk",
          feedArgs: { feed: "junk" }
        };
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._appResponded", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.cid1.ser1._appResponded = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedOpenResponseStates[cid][ser]._neutralized", () => {
        const state = harness.getServerState();
        state._feedOpenResponseStates.cid1.ser1._neutralized = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedOpenResponseStates[cid][ser] values to match, but they didn't"
        );
      });
    });

    describe("should handle ._feedCloseResponses (and state) correctly", () => {
      let harness;
      let fcr11;
      let fcr12;
      let fcr21;
      beforeEach(() => {
        harness = harnessFactory();
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
        harness.server._feedCloseResponses = {
          cid1: { ser1: fcr11, ser2: fcr12 },
          cid2: { ser1: fcr21 }
        };
      });

      it("should represent the state correctly", () => {
        const state = harness.getServerState();
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
        const state = harness.getServerState();
        expect(harness.server).toHaveState(state);
      });

      it("should compare the state correctly - mismatched ._feedCloseResponses key", () => {
        const state = harness.getServerState();
        state._feedCloseResponses.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponses keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponses[cid] key", () => {
        const state = harness.getServerState();
        state._feedCloseResponses.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponses[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponses[cid] value", () => {
        const state = harness.getServerState();
        state._feedCloseResponses.cid1.ser1 = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponses[cid] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates key", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid] key", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.cid1.junk = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid] keys to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser] key", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.cid1.ser1.junk = 123;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] keys to be valid, but they weren't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._server", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.cid1.ser1._server = {};
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._actionRequest", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.cid1.ser1._feedCloseRequest = {
          clientId: "junk",
          feedName: "junk",
          feedArgs: { feed: "junk" }
        };
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._appResponded", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.cid1.ser1._appResponded = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });

      it("should compare the state correctly - mismatched ._feedCloseResponseStates[cid][ser]._neutralized", () => {
        const state = harness.getServerState();
        state._feedCloseResponseStates.cid1.ser1._neutralized = false;
        const result = toHaveState(harness.server, state);
        expect(result.pass).toBe(false);
        expect(result.message()).toEqual(
          "expected ._feedCloseResponseStates[cid][ser] values to match, but they didn't"
        );
      });
    });
  });
});

// Testing: app-triggered state modifiers

describe("The server() factory function", () => {
  describe("can return failure", () => {
    it("should throw on invalid options argument - missing", () => {
      expect(() => {
        server();
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
    });

    it("should throw on invalid options argument - bad type", () => {
      expect(() => {
        server("junk");
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
    });

    // The transport argument is checked by transportWrapper in main

    it("should throw on invalid options.transportWrapper argument - missing", () => {
      expect(() => {
        server({});
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid options.transportWrapper.")
      );
    });

    it("should throw on invalid options.transportWrapper argument - bad type", () => {
      expect(() => {
        server({ transportWrapper: "junk" });
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid options.transportWrapper.")
      );
    });

    it("should throw on invalid options.handshakeMs argument - bad type", () => {
      expect(() => {
        harnessFactory({ handshakeMs: "junk" });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.handshakeMs."));
    });

    it("should throw on invalid options.handshakeMs argument - non-integer", () => {
      expect(() => {
        harnessFactory({ handshakeMs: 1.2 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.handshakeMs."));
    });

    it("should throw on invalid options.handshakeMs argument - negative integer", () => {
      expect(() => {
        harnessFactory({ handshakeMs: -1 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.handshakeMs."));
    });

    it("should throw on invalid options.terminationMs argument - bad type", () => {
      expect(() => {
        harnessFactory({ terminationMs: "junk" });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.terminationMs."));
    });

    it("should throw on invalid options.terminationMs argument - non-integer", () => {
      expect(() => {
        harnessFactory({ terminationMs: 1.2 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.terminationMs."));
    });

    it("should throw on invalid options.terminationMs argument - negative integer", () => {
      expect(() => {
        harnessFactory({ terminationMs: -1 });
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.terminationMs."));
    });
  });

  describe("can return success", () => {
    // Events - N/A

    // State

    it("should set the initial state correctly using defaults", () => {
      const harness = harnessFactory();
      expect(harness.server).toHaveState({
        _options: {
          handshakeMs: config.defaults.handshakeMs,
          terminationMs: config.defaults.terminationMs
        },
        _transportWrapper: harness.transportWrapper,
        _transportWrapperState: "stopped",
        _clientIds: {},
        _transportClientIds: {},
        _handshakeTimers: {},
        _handshakeStatus: {},
        _handshakeResponses: {},
        _handshakeResponseStates: {},
        _actionResponses: {},
        _actionResponseStates: {},
        _clientFeedStates: {},
        _feedClientStates: {},
        _terminationTimers: {},
        _feedOpenResponses: {},
        _feedOpenResponseStates: {},
        _feedCloseResponses: {},
        _feedCloseResponseStates: {}
      });
    });

    it("should set the initial state correctly using custom options", () => {
      const harness = harnessFactory({
        handshakeMs: 123,
        terminationMs: 456
      });
      expect(harness.server).toHaveState({
        _options: {
          handshakeMs: 123,
          terminationMs: 456
        },
        _transportWrapper: harness.transportWrapper,
        _transportWrapperState: "stopped",
        _clientIds: {},
        _transportClientIds: {},
        _handshakeTimers: {},
        _handshakeStatus: {},
        _handshakeResponses: {},
        _handshakeResponseStates: {},
        _actionResponses: {},
        _actionResponseStates: {},
        _clientFeedStates: {},
        _feedClientStates: {},
        _terminationTimers: {},
        _feedOpenResponses: {},
        _feedOpenResponseStates: {},
        _feedCloseResponses: {},
        _feedCloseResponseStates: {}
      });
    });

    // Transport calls

    it("should make no transport calls", () => {
      const harness = harnessFactory();
      expect(harness.transportWrapper.state.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.send.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks)

    // Return value

    it("should return an object", () => {
      const harness = harnessFactory();
      expect(check.object(harness.server)).toBe(true);
    });
  });
});

describe("The server.start() function", () => {
  describe("can return failure", () => {
    it("should throw if the server is not stopped", () => {
      const harness = harnessFactory();
      harness.server.start();
      harness.transportWrapper.state.mockReturnValue("starting");
      harness.transportWrapper.emit("starting");
      expect(() => {
        harness.server.start();
      }).toThrow(new Error("INVALID_STATE: The server is not stopped."));
    });
  });

  describe("can return success", () => {
    // Events

    it("should emit starting", () => {
      const harness = harnessFactory();
      const serverListener = harness.createServerListener();

      harness.server.start();

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harness = harnessFactory();
      const newState = harness.getServerState();

      harness.server.start();

      expect(harness.server).toHaveState(newState);
    });

    // Transport calls

    it("should call transport.start()", () => {
      const harness = harnessFactory();
      harness.server.start();

      expect(harness.transportWrapper.start.mock.calls.length).toBe(1);
      expect(harness.transportWrapper.start.mock.calls[0].length).toBe(0);
      expect(harness.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.send.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value

    it("should return void", () => {
      const harness = harnessFactory();
      expect(harness.server.start()).toBe(undefined);
    });
  });
});

describe("The server.stop() function", () => {
  describe("can return failure", () => {
    it("should throw if the server is not started", () => {
      const harness = harnessFactory();
      expect(() => {
        harness.server.stop();
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });
  });

  describe("can return success", () => {
    // Events

    it("should emit nothing", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      const serverListener = harness.createServerListener();

      harness.server.stop();

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      const newState = harness.getServerState();

      harness.server.stop();

      expect(harness.server).toHaveState(newState);
    });

    // Transport calls

    it("should call transport.stop()", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();

      harness.server.stop();

      expect(harness.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.stop.mock.calls.length).toBe(1);
      expect(harness.transportWrapper.stop.mock.calls[0].length).toBe(0);
      expect(harness.transportWrapper.send.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value

    it("should return void", () => {});
  });
});

describe("The server.actionRevelation() function", () => {
  describe("can return failure", () => {
    it("should throw if the server is not started", () => {
      const harness = harnessFactory();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });

    it("should throw on invalid params - bad type", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation(null);
      }).toThrow("INVALID_ARGUMENT: Invalid params.");
    });

    it("should throw on invalid params.actionName - bad type", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: false,
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid action name.");
    });

    it("should throw on invalid params.actionName - empty string", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid action name.");
    });

    it("should throw on invalid params.actionData - bad type", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: 123,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid action data.");
    });

    it("should throw on invalid params.actionData - not JSON-expressible", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { value: undefined },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Action data is not JSON-expressible.");
    });

    it("should throw on invalid params.feedName", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: false,
          feedArgs: { feed: "args" },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed name.");
    });

    it("should throw on invalid params.feedArgs", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { junk: 123 },
          feedDeltas: []
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed arguments object.");
    });

    it("should throw on invalid params.feedDeltas - bad type", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: null
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed deltas.");
    });

    it("should throw on invalid params.feedDeltas - schema violation", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [null]
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed delta.");
    });

    it("should throw on invalid params.feedDeltas - non JSON-expressible value", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [
            { Operation: "Set", Path: {}, Value: { junk: undefined } }
          ]
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed delta.");
    });

    it("should throw if params.feedData and params.feedMD5 are both present", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedMd5: "123456789012345678901234",
          feedData: {}
        });
      }).toThrow(
        "INVALID_ARGUMENT: Cannot specify both params.feedMd5 and params.feedData."
      );
    });

    it("should throw on invalid params.feedMd5 - bad type", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedMd5: null
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data hash.");
    });

    it("should throw on invalid params.feedMd5 - bad form", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedMd5: "a"
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data hash.");
    });

    it("should throw on invalid params.feedData - bad type", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedData: null
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data.");
    });

    it("should throw on invalid params.feedData - not JSON-expressible", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [],
          feedData: { junk: undefined }
        });
      }).toThrow("INVALID_ARGUMENT: Invalid feed data.");
    });
  });

  describe("can return success", () => {
    let harness;
    let cidClosed; // eslint-disable-line no-unused-vars
    let cidOpening; // eslint-disable-line no-unused-vars
    let cidOpen; // eslint-disable-line no-unused-vars
    let cidClosing; // eslint-disable-line no-unused-vars
    let cidOtherfaOpen; // eslint-disable-line no-unused-vars
    let cidOtherfnOpen; // eslint-disable-line no-unused-vars
    beforeEach(() => {
      harness = harnessFactory();
      harness.makeServerStarted();

      // Client with the feed closed
      cidClosed = harness.makeClient("client_closed");

      // Client with the feed opening
      cidOpening = harness.makeClient("client_opening");
      harness.makeFeedOpening("client_opening", "some_feed", { feed: "args" });

      // Client with the feed open
      cidOpen = harness.makeClient("client_open");
      harness.makeFeedOpen(
        "client_open",
        "some_feed",
        { feed: "args" },
        { feed: "data" }
      );

      // Client with the feed closing
      cidClosing = harness.makeClient("client_closing");
      harness.makeFeedClosing("client_closing", "some_feed", { feed: "args" });

      // Client with another feed argument open
      cidOtherfaOpen = harness.makeClient("client_otherfa_open");
      harness.makeFeedOpen(
        "client_otherfa_open",
        "some_feed",
        { feed: "args_other" },
        { feed: "data" }
      );

      // Client with another feed name open
      cidOtherfnOpen = harness.makeClient("client_otherfn_open");
      harness.makeFeedOpen(
        "client_otherfn_open",
        "some_other_feed",
        { feed: "args" },
        { feed: "data" }
      );
    });

    // Events

    it("should emit nothing", () => {
      const serverListener = harness.createServerListener();

      harness.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });

      expect(serverListener.starting.mock.calls.length).toBe(0);
      expect(serverListener.start.mock.calls.length).toBe(0);
      expect(serverListener.stopping.mock.calls.length).toBe(0);
      expect(serverListener.stop.mock.calls.length).toBe(0);
      expect(serverListener.handshake.mock.calls.length).toBe(0);
      expect(serverListener.action.mock.calls.length).toBe(0);
      expect(serverListener.feedOpen.mock.calls.length).toBe(0);
      expect(serverListener.feedClose.mock.calls.length).toBe(0);
      expect(serverListener.disconnect.mock.calls.length).toBe(0);
      expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
      expect(serverListener.transportError.mock.calls.length).toBe(0);
    });

    // State

    it("should not change the state", () => {
      const newState = harness.getServerState();

      harness.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });

      expect(harness.server).toHaveState(newState);
    });

    // Transport calls

    it("should call .send() for appropriate clients - with no data verification", () => {
      harness.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });

      expect(harness.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.send.mock.calls.length).toBe(1);
      expect(harness.transportWrapper.send.mock.calls[0].length).toBe(2);
      expect(harness.transportWrapper.send.mock.calls[0][0]).toBe(cidOpen);
      expect(
        JSON.parse(harness.transportWrapper.send.mock.calls[0][1])
      ).toEqual({
        MessageType: "ActionRevelation",
        ActionName: "some_action",
        ActionData: { action: "data" },
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ]
      });
      expect(harness.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    it("should call .send() for appropriate clients - with hash", () => {
      harness.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        feedMd5: "123456789012345678901234"
      });

      expect(harness.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.send.mock.calls.length).toBe(1);
      expect(harness.transportWrapper.send.mock.calls[0].length).toBe(2);
      expect(harness.transportWrapper.send.mock.calls[0][0]).toBe(cidOpen);
      expect(
        JSON.parse(harness.transportWrapper.send.mock.calls[0][1])
      ).toEqual({
        MessageType: "ActionRevelation",
        ActionName: "some_action",
        ActionData: { action: "data" },
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        FeedMd5: "123456789012345678901234"
      });
      expect(harness.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    it("should call .send() for appropriate clients - with feed data", () => {
      harness.server.actionRevelation({
        actionName: "some_action",
        actionData: { action: "data" },
        feedName: "some_feed",
        feedArgs: { feed: "args" },
        feedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        feedData: { feed: "data2" }
      });

      expect(harness.transportWrapper.start.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.stop.mock.calls.length).toBe(0);
      expect(harness.transportWrapper.send.mock.calls.length).toBe(1);
      expect(harness.transportWrapper.send.mock.calls[0].length).toBe(2);
      expect(harness.transportWrapper.send.mock.calls[0][0]).toBe(cidOpen);
      expect(
        JSON.parse(harness.transportWrapper.send.mock.calls[0][1])
      ).toEqual({
        MessageType: "ActionRevelation",
        ActionName: "some_action",
        ActionData: { action: "data" },
        FeedName: "some_feed",
        FeedArgs: { feed: "args" },
        FeedDeltas: [
          {
            Operation: "Set",
            Path: ["feed"],
            Value: "data2"
          }
        ],
        FeedMd5: md5Calculator.calculate({ feed: "data2" })
      });
      expect(harness.transportWrapper.disconnect.mock.calls.length).toBe(0);
    });

    // Outbound callbacks - N/A

    // Inbound callbacks (events, state, transport, outer callbacks) - N/A

    // Return value
    it("should return void", () => {
      expect(
        harness.server.actionRevelation({
          actionName: "some_action",
          actionData: { action: "data" },
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          feedDeltas: [
            {
              Operation: "Set",
              Path: ["feed"],
              Value: "data2"
            }
          ]
        })
      ).toBe(undefined);
    });
  });
});

describe("The server.feedTermination() function", () => {
  describe("can return failure", () => {
    it("should throw if server not started", () => {
      const harness = harnessFactory();
      expect(() => {
        harness.server.feedTermination({ clientId: "some_client" });
      }).toThrow(new Error("INVALID_STATE: The server is not started."));
    });

    it("should throw if non-object argument", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.feedTermination(null);
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid params."));
    });

    it("should throw if invalid usage", () => {
      const harness = harnessFactory();
      harness.makeServerStarted();
      expect(() => {
        harness.server.feedTermination({});
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid usage."));
    });

    describe("usage 1 ({cid, fn, fa})", () => {
      it("should throw if invalid params.clientId - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: null,
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
      });

      it("should throw if invalid params.clientId - empty string", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
      });

      it("should throw if invalid params.feedName", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid feed name."));
      });

      it("should throw if invalid params.feedArgs", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: 1 },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(
          new Error("INVALID_ARGUMENT: Invalid feed arguments object.")
        );
      });

      it("should throw if invalid params.errorCode - missing", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: null,
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - empty string", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorData - missing", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR"
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: []
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - not JSON-expressible", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { problem: undefined }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });
    });

    describe("usage 2 ({cid})", () => {
      it("should throw if invalid params.clientId - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: 1,
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
      });

      it("should throw if invalid params.clientId - empty string", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "",
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid client id."));
      });

      it("should throw if invalid params.errorCode - missing", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            errorCode: true,
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - empty string", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            errorCode: "",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorData - missing", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            errorCode: "SOME_ERROR"
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            errorCode: "SOME_ERROR",
            errorData: "junk"
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - not JSON-expressible", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            clientId: "some_client",
            errorCode: "SOME_ERROR",
            errorData: { problem: NaN }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });
    });

    describe("usage 3 ({fn, fa})", () => {
      it("should throw if invalid params.feedName", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid feed name."));
      });

      it("should throw if invalid params.feedArgs", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: 1 },
            errorCode: "SOME_ERROR",
            errorData: { error: "data" }
          });
        }).toThrow(
          new Error("INVALID_ARGUMENT: Invalid feed arguments object.")
        );
      });

      it("should throw if invalid params.errorCode - missing", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: 123,
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorCode - empty string", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "",
            errorData: { error: "data" }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error code."));
      });

      it("should throw if invalid params.errorData - missing", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR"
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - bad type", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: "junk"
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });

      it("should throw if invalid params.errorData - not JSON-expressible", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();
        expect(() => {
          harness.server.feedTermination({
            feedName: "some_feed",
            feedArgs: { feed: "arg" },
            errorCode: "SOME_ERROR",
            errorData: { problem: NaN }
          });
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid error data."));
      });
    });
  });

  describe("can return success", () => {
    describe("usage 1 ({cid, fn, fa})", () => {
      // Events

      it("should emit nothing in all cases", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();

        // Client with the feed closed
        const cidClosed = harness.makeClient("client_closed");

        // Client with the feed opening
        const cidOpening = harness.makeClient("client_opening");
        harness.makeFeedOpening("client_opening", "some_feed", {
          feed: "args"
        });

        // Client with the feed open
        const cidOpen = harness.makeClient("client_open");
        harness.makeFeedOpen(
          "client_open",
          "some_feed",
          { feed: "args" },
          { feed: "data" }
        );

        // Client with the feed closing
        const cidClosing = harness.makeClient("client_closing");
        harness.makeFeedClosing("client_closing", "some_feed", {
          feed: "args"
        });

        const serverListener = harness.createServerListener();

        // Terminate feeds for all clients

        harness.server.feedTermination({
          clientId: cidClosed,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          errorCode: "SOME_ERROR",
          errorData: { error: "data" }
        });

        harness.server.feedTermination({
          clientId: cidOpening,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          errorCode: "SOME_ERROR",
          errorData: { error: "data" }
        });

        harness.server.feedTermination({
          clientId: cidOpen,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          errorCode: "SOME_ERROR",
          errorData: { error: "data" }
        });

        harness.server.feedTermination({
          clientId: cidClosing,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          errorCode: "SOME_ERROR",
          errorData: { error: "data" }
        });

        expect(serverListener.starting.mock.calls.length).toBe(0);
        expect(serverListener.start.mock.calls.length).toBe(0);
        expect(serverListener.stopping.mock.calls.length).toBe(0);
        expect(serverListener.stop.mock.calls.length).toBe(0);
        expect(serverListener.handshake.mock.calls.length).toBe(0);
        expect(serverListener.action.mock.calls.length).toBe(0);
        expect(serverListener.feedOpen.mock.calls.length).toBe(0);
        expect(serverListener.feedClose.mock.calls.length).toBe(0);
        expect(serverListener.disconnect.mock.calls.length).toBe(0);
        expect(serverListener.badClientMessage.mock.calls.length).toBe(0);
        expect(serverListener.transportError.mock.calls.length).toBe(0);
      });

      // State

      it("should update appropriately if target client has all feeds closed; non-target client has target feed open", () => {
        const harness = harnessFactory();
        harness.makeServerStarted();

        // eslint-disable-next-line no-unused-vars
        const cidNotTarget = harness.makeClient("client_not_target");
        harness.makeFeedOpen(
          "client_not_target",
          "some_feed",
          { feed: "args" },
          { feed: "data" }
        );

        const cidTarget = harness.makeClient("client_target");

        const newState = harness.getServerState();

        harness.server.feedTermination({
          clientId: cidTarget,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          errorCode: "SOME_ERROR",
          errorData: { error: "data" }
        });

        expect(harness.server).toHaveState(newState);
      });

      it("should update appropriately if target client has only target feed opening; non-target client has target feed open", () => {
        const feedSerial = feedSerializer.serialize("some_feed", {
          feed: "args"
        });

        const harness = harnessFactory();
        harness.makeServerStarted();

        // eslint-disable-next-line no-unused-vars
        const cidNotTarget = harness.makeClient("client_not_target");
        harness.makeFeedOpen(
          "client_not_target",
          "some_feed",
          { feed: "args" },
          { feed: "data" }
        );

        const cidTarget = harness.makeClient("client_target");
        harness.makeFeedOpening("client_target", "some_feed", {
          feed: "args"
        });

        const newState = harness.getServerState();

        harness.server.feedTermination({
          clientId: cidTarget,
          feedName: "some_feed",
          feedArgs: { feed: "args" },
          errorCode: "SOME_ERROR",
          errorData: { error: "data" }
        });

        delete newState._clientFeedStates[cidTarget];
        delete newState._feedClientStates[feedSerial][cidTarget];
        delete newState._feedOpenResponses[cidTarget];
        delete newState._feedOpenResponseStates[cidTarget];

        expect(harness.server).toHaveState(newState);
      });

      it("should update appropriately if target client has only target feed open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has only target feed closing; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed closed and a different feed-arg open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed opening and a different feed-arg open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed open and a different feed-arg open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed closing and a different feed-arg open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed closed and a different feed-name open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed opening and a different feed-name open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed open and a different feed-name open; non-target client has target feed open", () => {});

      it("should update appropriately if target client has target feed closing and a different feed-name open; non-target client has target feed open", () => {});

      // Transport calls

      it("should call .send() for appropriate clients", () => {
        // All cases - opening and open and all others from arev
      });

      // Outbound callbacks - N/A

      // Inbound callbacks (events, state, transport, outer callbacks) - N/A

      // Return value

      it("should return void", () => {});
    });

    describe("usage 2 ({cid})", () => {
      // Events
      // State
      // Transport calls
      // Outbound callbacks
      // Inbound callbacks (events, state, transport, outer callbacks)
      // Return value
    });

    describe("usage 3 ({fn, fa})", () => {
      // Events
      // State
      // Transport calls
      // Outbound callbacks
      // Inbound callbacks (events, state, transport, outer callbacks)
      // Return value
    });
  });
});

describe("The server.disconnect() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appHandshakeSuccess() and handshakeResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appActionSuccess() and actionResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appActionFailure() and actionResponse.failure() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appFeedOpenSuccess() and feedOpenResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appFeedOpenFailure() and feedOpenResponse.failure() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._appFeedCloseSuccess() and feedCloseResponse.success() functions", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

// Testing: transport-triggered state modifiers

describe("The server._processStarting() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processStart() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processStopping() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processStop() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processConnect() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processDisconnect() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processMessage() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processHandshake() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processAction() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processFeedOpen() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._processFeedClose() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

// Testing: internal state modifiers

describe("The server._setState() function", () => {
  describe("can return failure", () => {});

  describe("can return success", () => {
    // Events
    // State
    // Transport calls
    // Outbound callbacks
    // Inbound callbacks (events, state, transport, outer callbacks)
    // Return value
  });
});

describe("The server._terminateOpeningFeed() function", () => {});

describe("The server._terminateOpenFeed() function", () => {});

describe("The server._delete() function", () => {});

describe("The server._set() function", () => {});

// Testing: app-triggered state-getting functionality

describe("The server.state() function", () => {});

// Testing: internal state-getting functionality

describe("The server._get() function", () => {});

describe("The server._getClientFeeds() function", () => {});

describe("The server._getFeedClients() function", () => {});
