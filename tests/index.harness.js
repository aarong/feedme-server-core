import emitter from "component-emitter";
import feedmeServerCore from "../build";

const harnessProto = {};

export default function harnessFactory(options = {}) {
  const harness = Object.create(harnessProto);

  // Create mock transport (stopped)
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
  options.transport = t; // eslint-disable-line no-param-reassign
  harness.server = feedmeServerCore(options);

  return harness;
}

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
