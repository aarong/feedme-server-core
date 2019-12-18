[![Build Status](https://travis-ci.com/aarong/feedme-server-core.svg?branch=master)](https://travis-ci.com/aarong/feedme-server-core)
[![Coverage Status](https://coveralls.io/repos/github/aarong/feedme-server-core/badge.svg?branch=master)](https://coveralls.io/github/aarong/feedme-server-core?branch=master)

[![Feedme](https://raw.githubusercontent.com/aarong/feedme-server-core/master/logo.svg?sanitize=true)](https://feedme.global)

# Feedme Node.js Server Core

A low-level Feedme server library for Node.js created and maintained as a core
part of the [Feedme](https://feedme.global) project.

This library Exposes a flexible API for client conversation management that is
compliant with the
[Feedme specification](https://github.com/aarong/feedme-spec). It provides
minimal API sugar and is intended primarily as a foundation for other Feedme
server libraries with greater functionality. Application developers may be more
interested in [Feedme Node.js Server](https://github.com/aarong/feedme-server).

[WebSocket](https://github.com/aarong/feedme-transport-websocket) and
[Socket.io](https://github.com/aarong/feedme-transport-socketio) transports are
maintained as a core part of the project. Both are supported by the
[Feedme Javascript Client](https://github.com/aarong/feedme-client).

Library contributors and transport developers should see the
[developer documentation](DEV.md).

<!-- TOC depthFrom:2 -->

- [Getting Started](#getting-started)
- [API](#api)
  - [Initialization](#initialization)
  - [States](#states)
  - [Events](#events)
    - [starting](#starting)
    - [start](#start)
    - [stopping](#stopping)
    - [stop](#stop)
    - [connect](#connect)
    - [handshake](#handshake)
    - [action](#action)
    - [feedOpen](#feedopen)
    - [feedClose](#feedclose)
    - [disconnect](#disconnect)
    - [badClientMessage](#badclientmessage)
    - [transportError](#transporterror)
  - [Methods](#methods)
    - [server.state()](#serverstate)
    - [server.start()](#serverstart)
    - [server.stop()](#serverstop)
    - [server.actionRevelation(params)](#serveractionrevelationparams)
    - [server.feedTermination(params)](#serverfeedterminationparams)
    - [server.disconnect(clientId)](#serverdisconnectclientid)
  - [Objects](#objects)
    - [Handshake Objects](#handshake-objects)
      - [HandshakeRequest](#handshakerequest)
      - [HandshakeResponse](#handshakeresponse)
    - [Action Objects](#action-objects)
      - [ActionRequest](#actionrequest)
      - [ActionResponse](#actionresponse)
    - [FeedOpen Objects](#feedopen-objects)
      - [FeedOpenRequest](#feedopenrequest)
      - [FeedOpenResponse](#feedopenresponse)
    - [FeedClose Objects](#feedclose-objects)
      - [FeedCloseRequest](#feedcloserequest)
      - [FeedCloseResponse](#feedcloseresponse)

<!-- /TOC -->

## Getting Started

Install the server:

```shell
npm install feedme-server-core
```

The library expects the application to provide a transport, through which it
will accept client connections.

```shell
npm install feedme-transport-websocket
# or
npm install feedme-transport-socketio
```

To initialize a server using the WebSocket transport:

```javascript
const feedmeServerCore = require("feedme-server-core");
const wsTransport = require("feedme-transport-websocket/server");

const server = feedmeServerCore({
  transport: wsTransport({ url: "https://some.url/api/websocket" })
});
```

To initialize a server using the Socket.io transport:

```javascript
const feedmeServerCore = require("feedme-server-core");
const ioTransport = require("feedme-transport-socketio/server");

const server = feedmeServerCore({
  transport: ioTransport({ url: "https://some.url/api/socketio" })
});
```

Once a server has been initialized, the application can listen for events and
start the server.

## API

### Initialization

To initialize a server:

```javascript
const server = feedmeServerCore(options);
```

The server is initialized in the `stopped` state and will remain `stopped` until
there is a call to `server.start()`.

The `options` argument is an object with the following properties:

- `options.transport` - Required Object.

  A transport object used to listen for and interact with clients. The transport
  must satisfy the requirements laid out in the developer documentation.

  The application must not operate on the transport object directly and must not
  pass a given transport object to more than one server instance.

  The tranport object must be in the `stopped` state.

- `options.handshakeMs` - Optional non-negative integer. Defaults to 30000.

  Specifies how long to wait for a client to transmit a successful `Handshake`
  message after connecting via the transport.

  If greater than 0, then the server will wait `handshakeMs` for a
  newly-connected client to transmit a successful `Handshake` message before
  forcefully disconnecting the client.

  If set to 0, then the server will wait indefinitely for a newly-connected
  client to transmit a successful `Handshake` message.

- `options.terminationMs` - Optional non-negative integer. Defaults to 30000.

  Specifies the duration of feed termination windows. If greater than zero, then
  termination windows last `terminationMs`. If set to zero, then termination
  windows last for the duration of a client's connection.

  A termination window begins after a `FeedTermination` message has been
  transmitted to a client. During the termination window, the server will accept
  either a `FeedOpen` or `FeedClose` message referencing the feed. This behavior
  accounts for transport latency, which can cause a client to transmit a
  `FeedClose` message while a `FeedTermination` message is in transit from the
  server.

  If the server receives a `FeedClose` message referencing a feed during its
  termination window, it will respond with a `FeedCloseResponse` indicating
  success and will not emit a `feedClose` event. The server will expect the next
  client message referencing the feed to be a `FeedOpen` and will respond with a
  `ViolationResponse` if it receives another `FeedClose`.

  If the server receives a `FeedOpen` message referencing a feed during its
  termination window, it will emit a `feedOpen` event as usual.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  The `options` argument was invalid.

### States

A server can be in one of four states:

- `stopped` - The server is not listening for client connections and is not
  attempting to start, but is ready to be started.

- `starting` - The server is attempting to begin listening for client
  connections.

- `started` - The server is listening for client connections and may have
  existing connections.

- `stopping` - The server has closed all existing client connections and has
  stopped listenening for new connections, but is not ready to be restarted.

### Events

#### starting

Emitted when the server state changes from `stopped` to `starting`.

Arguments: None

#### start

Emitted when the server state changes from `starting` to `started`.

Arguments: None

#### stopping

Emitted when the server state changes from `starting` or `started` to
`stopping`.

If the server is transitioning from `started` to `stopping`, then a `disconnect`
event is emitted for each previously-connected client before the `stopping`
event is emitted.

Arguments passed to the listeners:

1. `err` (Optional Error) indicates the reason for the stoppage. If the stoppage
   resulted from a call to `server.stop()`, then the argument is omitted. If the
   stoppage resulted from a transport error, then `err` takes the form
   `err.message === "FAILURE: ..."`.

#### stop

Emitted when the server state changes from `stopping` to `stopped`.

Arguments passed to the listeners:

1. `err` (Optional Error) indicates the reason for the stoppage. If the stoppage
   resulted from a call to `server.stop()`, then the argument is omitted. If the
   stoppage resulted from a transport error, then `err` takes the form
   `err.message === "FAILURE: ..."`.

#### connect

Emitted when a client connects on the transport and before any messages have
been exchanged.

Arguments passed to the listeners:

1. `clientId` (string) is the identifier assigned by the library to the client.
   The client will be made aware of this identifier once it has transmitted a
   library-compatible `Handshake` message.

#### handshake

Emitted when the server receives a valid and library-compatible `Handshake`
message.

If there is a listener attached to the `handshake` event, then the application
must call `hres.success()` to return a `HandshakeResponse` message to the
client.

If there is no listener attached to the `handshake` event, then the server
immediataly returns a `HandshakeResponse` message indicating success when a
valid and library-compatible `Handshake` message is received.

If a `Handshake` message specifies a Feedme version not supported by the
library, then a `handshake` event is not emitted and the client is sent a
`HandshakeResponse` message indicating failure.

Arguments passed to the listeners:

1. `hreq` (Object) is a `HandshakeRequest` object describing the client request.

2. `hres` (Object) is a `HandshakeResponse` object enabling the application to
   respond to the request.

#### action

Emitted when the server receives a valid `Action` message.

If there is no listener attached to the `action` event, then the server
immediately returns an `ActionResponse` message indicating failure (error code
`"INTERNAL_ERROR"`) when a valid `Action` message is received.

Arguments passed to the listeners:

1. `areq` (Object) is an `ActionRequest` object describing the action request.

2. `ares` (Object) is an `ActionResponse` object enabling the server to respond
   to the request.

#### feedOpen

Emitted when the server receives a valid `FeedOpen` message.

If there is no listener attached to the `feedOpen` event, then the server
immediately returns a `FeedOpenResponse` message indicating failure (error code
`"INTERNAL_ERROR"`) when a valid `FeedOpen` message is received.

Arguments passed to the listeners:

1. `foreq` (Object) is a `FeedOpenRequest` object describing the client request.

2. `fores` (Object) is a `FeedOpenResponse` object enabling the application to
   respond to the request.

#### feedClose

Emitted when the server receives a valid `FeedClose` message.

If there is a listener attached to the `feedClose` event, then the application
must call `fcres.success()` to return a `FeedCloseResponse` message to the
client.

If there is no listener attached to the `feedClose` event, then the server
immediatally returns a `FeedCloseResponse` message indicating success when a
valid `FeedClose` message is received.

In both cases, the server stops transmitting `ActionRevelation` messages
referencing the feed as soon as the `FeedClose` message is received.

The server does not emit a `feedClose` event for `FeedClose` messages that
arrive during a termination window.

Arguments passed to the listeners:

1. `fcreq` (Object) is a `FeedCloseRequest` object describing the client
   request.

2. `fcres` (Object) is a `FeedCloseResponse` object enabling the application to
   respond to the request.

#### disconnect

Emitted when a client connection ends.

Arguments passed to the listeners:

1. `clientId` (string) is the identifier that the library assigned to the
   client.

2. `err` (Optional Error) indicates the reason for the disconnect. If the
   disconnect resulted from a call to `server.disconnect()` then the argument is
   omitted.

The following errors are possible:

- `err.message === "HANDSHAKE_TIMEOUT: ..."`

  The client did not transmit a valid and library-compatible `Handshake` message
  within the windows specified by `options.handshakeMs`.

- `err.message === "FAILURE: ..."`

  There was a transport connectivity problem or the connection was severed
  intentionally by the client.

- `err.message === "STOPPING: ..."`

  The server is stopping.

#### badClientMessage

Emitted when a client violates the Feedme specification. The server transmits a
`ViolationResponse` message to the client before this event is emitted.

Arguments passed to the listeners:

1. `clientId` (string) is the client identifier that the library assigned to the
   client.

2. `err` (Error) describes the nature of the violation.

The following errors are possible:

- `err.message === "INVALID_MESSAGE: ..."`

  The client transmitted a message that was not valid JSON or that violated one
  of the JSON schemas laid out in the Feedme specification.

  - `err.clientMessage` (string) contains the client message.

  - `err.parseError` (Error) contains the message parsing error.

- `err.message === "UNEXPECTED_MESSAGE: ..."`

  The client transmitted a message that was sequentially invalid.

  - `err.clientMessage` (string) contains the client message.

#### transportError

Emitted when the transport violates the requirements set out in the developer
documentation.

Arguments passed to the listeners:

1. `err` (Error) indicates the nature of the violation.

The following errors are possible:

- `err.message === "INVALID_RESULT"`

  A transport method returned an unexpected value or threw an unexpected error.

- `err.message === "UNEXPECTED_EVENT"`

  The transport emitted an out-of-sequence event.

- `err.message === "BAD_EVENT_ARGUMENT"`

  The transport emitted an event with one or more invalid arguments.

### Methods

---

Note that most of these methods can throw TRANSPORT_ERROR from the wrapper,
which may come with transportError property

---

#### server.state()

Returns the current server state. One of `"stopped"`, `"starting"`, `"started"`,
or `"stopping"`.

Errors thrown: None

#### server.start()

Initiates an attempt to start the server.

The server state must be `stopped` and after a sucessful call, the server state
becomes `starting`. If the transport subsequently starts successfully, then the
server state becomes `started`. If the transport fails to start, then the server
state becomes `stopping` and eventually `stopped`.

Errors thrown:

- `err.message === "INVALID_STATE: ..."`

  The server state is not `stopped`.

#### server.stop()

Initiates the process of stopping the server. The server state must be `started`
and after a successful call, the server state becomes `stopping`.

Errors thrown:

- `err.message === "INVALID_STATE: ..."`

  The server state is not `started`.

#### server.actionRevelation(params)

Transmits `ActionRevelation` messages to clients that have opened the specified
feed.

The `params` (Object) argument must contain the following members:

- `params.actionName` (string) The name of the action being revealed.

- `params.actionData` (Object) The action data for the action being revealed.
  Must be JSON-expressible.

- `params.feedName` (string) The name of the feed being revealed on.

- `params.feedArgs` (Object of strings) The arguments for the feed being
  revealed on.

- `params.feedDeltas` (Array) An array of spec-compliant delta objects
  describing any changes to the feed data that resulted from the action. Note
  that the library does _not_ verify that the specified deltas can validly be
  applied against the current state of the feed data -- it is up to the
  application to ensure validity. Must be JSON-expressible. If a delta specifies
  a non-JSON-expressible value then an `INVALID_ARGUMENT: ...` error is thrown.

- `params.feedMd5` (optional string) A spec-compliant hash of the feed data with
  the deltas applied. If this parameter is present, then `params.feedData` must
  not be present; if neither parameter is present, then clients will not be sent
  a hash for feed data integrify verification.

- `params.feedData` (optional Object) A reference to the feed data with the
  deltas applied. The library will generate a spec-compliant hash of the feed
  data and distribute it with the action revelation. The library does not check
  whether previously-passed feed data, with deltas applied, is consistent with
  the feed data specified here. It is up to the application to ensure validity.
  If this parameter is present, then `params.feedMd5` must not be present; if
  neither parameter is present, then clients will not be sent a hash for feed
  data integrity verification.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more arguments was invalid.

- `err.message === "INVALID_STATE: ..."`

  The server is not `started`.

#### server.feedTermination(params)

Forcefully closes one or more client feeds.

There are three usages: (1) terminate a specified feed for a specified client,
(2) terminate all feeds for a specified client, and (3) terminate all clients on
a specified feed.

If there are no relevant feeds to be closed, including because the client state
is not `ready`, then the function returns successfully.

Behavior depends on the state of the client feed(s) being terminated:

- When terminating a client feed that is `opening` (i.e. the library has emitted
  a `feedOpen` event referencing the feed but the application has not yet called
  `feedOpenResponse.success()` or `feedOpenResponse.failure()`), the client is
  sent a `FeedOpenResponse` message indicating failure. The error code and data
  transmitted with the message are determined by the parameters passed to this
  method. No further action is taken when the application subsequently calls
  `feedOpenResponse.success()` or `feedOpenResponse.failure()` but either call
  will return successfully.

- When terminating a client feed that is `open`, the client is immediately sent
  a `FeedTermination` message. The library will return success to any subsequent
  `FeedClose` message as configured by `options.terminationMs` and will not emit
  a `feedClose` event.

- When terminating a client feed that is `closing` (i.e. the library has stopped
  revealing actions on the client feed and has emitted a `feedClose` event but
  the application has not yet called `feedCloseResponse.success()`), then the
  client is immediately sent a `FeedCloseResponse` indicating success. No
  further action is taken when the application calls
  `feedOpenResponse.success()` but the call will return successfully.

- When terminating a client feed that is already `closed`, nothing is sent to
  the client and the method returns successfully.

1. Terminating a specific feed opened by a specific client

The `params` (Object) argument must contain the following members:

- `params.clientId` (string) The id of the client whose feed is being
  terminated.

- `params.feedName` (string) The name of the feed being terminated.

- `params.feedArgs` (Object of strings) The arguments for the feed being
  terminated.

- `params.errorCode` (string) The error code to return to the client.

- `params.errorData` (Object) The error data to return to the client. Must be
  JSON-expressible.

2. Terminating all feeds for a specified client

The `params` (Object) argument must contain the following members:

- `params.clientId` (string) The id of the client whose feeds are being
  terminated.

- `params.errorCode` (string) The error code to return to the client.

- `params.errorData` (Object) The error data to return to the client. Must be
  JSON-expressible.

3. Terminating all clients on a specified feed

The `params` (Object) argument must contain the following members:

- `params.feedName` (string) The name of the feed whose clients are being
  terminated.

- `params.feedArgs` (Object of strings) The arguments for the feed whose clients
  are being terminated.

- `params.errorCode` (string) The error code to return to the clients.

- `params.errorData` (Object) The error data to return to the clients. Must be
  JSON-expressible.

Errors thrown (for all three usages):

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more arguments was invalid.

- `err.message === "INVALID_STATE: ..."`

  The server is not `started`.

#### server.disconnect(clientId)

Forcibly disconnects a client transport connection.

The method returns successfully irrespective of the specified client's current
actual connection state.

Arguments:

- `clientId` (string) The id of the client being disconnected.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more arguments was invalid.

- `err.message === "INVALID_STATE: ..."`

  The server is not `started`.

### Objects

Applications interact with clients using the following types of objects.

Put in each section: When the server transitions to `stopping`, any outstanding
`HandshakeResponse`, `ActionResponse`, `FeedOpenResponse`, and
`FeedCloseResponse` objects are neutralized. Their `success()` and `failure()`
methods will run successfully but will do nothing. If the server had previously
emitted `handshake`, `action`, `feedOpen`, or `feedClose` events associated with
the client, then the response objects passed with those events are neutralized
that `success()` and `failure()` calls succeed but do nothing.

#### Handshake Objects

When the `handshake` event is fired, listeners receive two parameters: a
`HandshakeRequest` object and a `HandshakeResponse` object.

##### HandshakeRequest

`HandshakeRequest` objects have the following properties:

- `handshakeRequest.clientId` (string) is the Feedme client identifier that the
  library has assigned to the client. The identifier is shared with the client,
  as per the Feedme specification.

##### HandshakeResponse

`HandshakeResponse` objects have the following methods:

- `handshakeResponse.success()`

  Returns a `HandshakeResponse` message to the client indicating success. The
  server will begin to accept `Action`, `FeedOpen`, and `FeedClose` messages
  from the client.

  Errors thrown:

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `handshakeResponse.success()`.

#### Action Objects

When the `action` event is fired, listeners receive two parameters: an
`ActionRequest` object and an `ActionResponse` object.

##### ActionRequest

`ActionRequest` objects have the following properties:

- `actionRequest.clientId` (string) is the Feedme client identifier that the
  library has assigned to the client.

- `actionRequest.actionName` (string) is the name of the action being invoked.

- `actionRequest.actionArgs` (object) contains arguments for the invokation.

##### ActionResponse

`ActionResponse` objects have the following methods:

- `actionResponse.success(actionData)`

  Returns an `ActionResponse` message to the client indicating success.

  If the client has disconnected or the server has stopped, then the method will
  do nothing but will return successfully.

  Arguments:

  1. `actionData` (object) is the action data, which is transmitted to the
     client. Must be JSON-expressible.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `actionResponse.success()` or
    `actionResponse.failure()`.

- `actionResponse.failure(errorCode, errorData)`

  Returns an `ActionResponse` message to the client indicating failure.

  If the client has disconnected or the server has stopped, then the method will
  do nothing but will return successfully.

  Arguments:

  1. `errorCode` (string) describes the failure.

  2. `errorData` (optional Object) may provide additional details, which are
     transmitted to the client. Must be JSON-expressible.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `actionResponse.success()` or
    `actionResponse.failure()`.

#### FeedOpen Objects

When the `feedOpen` event is fired, listeners receive two parameters: a
`FeedOpenRequest` object and a `FeedOpenResponse` object.

##### FeedOpenRequest

`FeedOpenRequest` objects have the following properties:

- `feedOpenRequest.clientId` (string) is the Feedme client identifier that the
  library has assigned to the client.

- `feedOpenRequest.feedName` (string) is the name of the feed being opened.

- `feedOpenRequest.feedArgs` (object of strings) contains arguments for for the
  feed being opened.

##### FeedOpenResponse

`FeedOpenResponse` objects have the following methods:

- `feedOpenResponse.success(feedData)`

  Returns a `FeedOpenResponse` message to the client indicating success.

  If the client has disconnected, the server has stopped, or the feed was
  terminated using `server.feedTermination()` after the `feedOpen` event was
  emitted, then the method will do nothing but will return successfully.

  Arguments:

  1. `feedData` (object) specifies the initial state of the feed data. Must be
     JSON-expressible.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `feedOpenResponse.success()` or
    `feedOpenResponse.failure()`.

- `feedOpenResponse.failure(errorCode, errorData)`

  Returns a `FeedOpenResponse` message to the client indicating failure.

  If the client has disconnected, the server has stopped, or the feed was
  terminated using `server.feedTermination()` after the `feedOpen` event was
  emitted, then the method will do nothing but will return successfully.

  Arguments:

  1. `errorCode` (string) describes the failure.

  2. `errorData` (optional Object) may provide additional details, which are
     transmitted to the client. Must be JSON-expressible.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `feedOpenResponse.success()` or
    `feedOpenResponse.failure()`.

#### FeedClose Objects

When the `feedClose` event is fired, listeners receive two parameters: a
`FeedCloseRequest` object and a `FeedCloseResponse` object.

##### FeedCloseRequest

`FeedCloseRequest` objects have the following properties:

- `feedCloseRequest.clientId` (string) is the Feedme client identifier that the
  library has assigned to the client.

- `feedCloseRequest.feedName` (string) is the name of the feed being closed.

- `feedCloseRequest.feedArgs` (object of strings) contains arguments for for the
  feed being closed.

##### FeedCloseResponse

`FeedCloseResponse` objects have the following methods:

- `feedCloseResponse.success()`

  Returns a `FeedCloseResponse` message to the client indicating success.

  If the client has disconnected or the server has stopped, then the method will
  do nothing but will return successfully.

  Errors thrown:

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `feedCloseResponse.success()`.
