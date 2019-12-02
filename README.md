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
    - [Feed Open Objects](#feed-open-objects)
      - [FeedOpenRequest](#feedopenrequest)
      - [FeedOpenResponse](#feedopenresponse)
    - [Feed Close Objects](#feed-close-objects)
      - [FeedCloseRequest](#feedcloserequest)
      - [FeedCloseResponse](#feedcloseresponse)
- [Sample Code](#sample-code)

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
var feedmeServerCore = require("feedme-server-core");
var wsTransport = require("feedme-transport-websocket/server");

var server = feedmeServerCore({
  transport: wsTransport({ url: "https://some.url/api/websocket" })
});
```

To initialize a server using the Socket.io transport:

```javascript
var feedmeServerCore = require("feedme-server-core");
var ioTransport = require("feedme-transport-socketio/server");

var server = feedmeServerCore({
  transport: ioTransport({ url: "https://some.url/api/socketio" })
});
```

Once a server has been initialized the application can listen for events and
start the server.

## API

### Initialization

To initialize a server:

```javascript
var server = feedmeServerCore(options);
```

The server is initialized in the `stopped` state and will remain `stopped` until
it receives a call to `server.start()`.

The `options` argument is an object with the following properties:

- `options.transport` - Required Object.

  A transport object used to listen for and interact with clients. The object
  must satisfy the requirements laid out in the developer documentation.

  The application must not operate on the transport object directly and must not
  pass a given transport object to more than one server instance.

  The tranport object must be in the `stopped` state.

- `options.handshakeMs` - Optional non-negative integer. Defaults to 30000.

  Specifies how long to wait for a client to transmit a successful `Handshake`
  message after connecting via the transport.

  If greater than 0, then the server will wait `handshakeMs` for a
  newly-connected client to transmit a successful `Handshake` message before
  disconnecting the client.

  If set to 0, then the server will wait indefinitely for a newly-connected
  client to transmit a successful `Handshake` message.

- `options.terminationMs` - Optional non-negative integer. Defaults to 30000.

  The Feedme specification requires that, for a period of time after sending a
  `FeedTermination` message referencing a given client feed, the server return
  success to a subsequent `FeedClose` message referencing that feed. The
  duration of this window is configured using `terminationMs` and should be set
  appropriately for the latency of the transport.

  If set greater than 0, then the server will return success to a `FeedClose`
  message received within `terminationMs` of terminating a client feed.

  If set to 0, then the server will return success to a `FeedClose` message
  received any time after terminating a client feed.

  In both cases, the server will return success only to the first `FeedClose`
  message referencing the terminated feed. It will return failure to subsequent
  `FeedClose` messages referencing that feed, as the client has violated the
  Feedme specification.

  If the client submits a `FeedOpen` message referencing a terminated feed
  within the specified window, then the message is processed as usual.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  The `options` argument was invalid.

### States

The server is always in one of four states:

- `stopped` - The server has no client connections and is not attempting to
  listen for new connections.

- `starting` - The server has no client connections but is attempting to start
  listening for new connections.

- `started` - The server is listening for new client connections and may have
  existing connections.

- `stopping` - The server has no client connections but is not ready to begin
  trying to listen for new client connections.

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

If the stoppage resulted from a call to `server.stop()` then listeners are
invoked with no arguments.

If the stoppage resulted from a transport error condition then listeners are
passed the `Error` object emitted by the transport.

When the server transitions to `stopping`, any outstanding `HandshakeResponse`,
`ActionResponse`, `FeedOpenResponse`, and `FeedCloseResponse` objects are
neutralized. Their success/failure methods will run successfully but will do
nothing.

Before the server transitions to `stopping`, a series of `disconnect` events are
emitted referencing each previously-connected client. These events are emitted
with the same error argument (or lack thereof) as the `stopping` event.

#### stop

Emitted when the server state changes from `stopping` to `stopped`.

If the stoppage resulted from a call to `server.stop()` then listeners are
invoked with no arguments.

If the stoppage resulted from a transport error condition then listeners are
passed the `Error` object emitted by the transport.

#### connect

Emitted when a client connects on the transport, before any messages have been
exchanged.

Arguments passed to the listeners:

1. `clientId` (string) is the identifier assigned by the server to the client
   The client will be made aware of this identifier once it has submitted an
   acceptable `Handshake` message.

#### handshake

Emitted when a client's submits a valid and library-compatible `Handshake`
message, but before the server has returned a `HandshakeResponse` message
indicating success. Applications can use this event to perform any processing
that is required before a Feedme conversation is initiated with a client.

If a client `Handshake` message is invalid or specifies a Feedme version not
supported by the library, then the `handshake` event is not emitted and a
`HandshakeResponse` indicating failure is returned to the client immediately.

If no listeners are attached to the `handshake` event, then the event is not
emitted and the server returns a `HandshakeResponse` indicating success as soon
as a valid `Handshake` message is received from the client.

Arguments passed to the listeners:

1. `handshakeRequest` (Object) is a `HandshakeRequest` object describing the
   client request.

2. `handshakeResponse` (Object) is a `HandshakeResponse` object enabling the
   application to respond to the request.

The application must eventually call `handshakeResponse.success()`, which
returns a `HandshakeResponse` message indicating success to the client and sets
the client state to `ready`.

#### action

Emitted when a client transmits a valid `Action` message

If no listeners are attached to the `action` event, then the server returns
failure to all action requests with error code `"INTERNAL_ERROR"`.

Arguments passed to the listeners:

1. `actionRequest` (Object) is an `ActionRequest` object describing the action
   request.

2. `actionResponse` (Object) is an `ActionResponse` object enabling the server
   to respond to the request.

The application must eventually call `actionResponse.success()` or
`actionResponse.failure()` to return an `ActionResponse` message to the client.

#### feedOpen

Emitted when a client transmits a valid `FeedOpen` message.

If no listeners are attached to the `feedOpen` event, then the library returns
failure to all feed open requests with error code `"INTERNAL_ERROR"`.

Arguments passed to the listeners:

1. `feedOpenRequest` (Object) is a `FeedOpenRequest` object describing the
   client request.

2. `feedOpenResponse` (Object) is a `FeedOpenResponse` object enabling the
   application to respond to the request.

The application must eventually call `feedOpenResponse.success()` or
`feedOpenResponse.failure()` to return a `FeedOpenResponse` message to the
client.

#### feedClose

Emitted when a client transmits a valid `FeedClose` message and after the
library has stopped sending the client `ActionRevelation` messages associated
with the feed, but before the library has returned a `FeedCloseResponse` message
indicating success. Applications can listen to this event to perform any
processing that is required on feed closure.

If no listeners are attached to the `feedClose` event, then the library returns
a `FeedCloseResponse` immediately when a valid `FeedClose` message is received
from the client.

If the feed has already been terminated and the client submits a `FeedClose`
message within `options.terminationMs` then no `feedClose` event is emitted and
success is returned immediately to the client.

Arguments passed to the listeners:

1. `feedCloseRequest` (Object) is a `FeedCloseRequest` object describing the
   client request.

2. `feedCloseResponse` (Object) is a `FeedCloseResponse` object enabling the
   application to respond to the request.

The application must eventually call `feedCloseResponse.success()` to return a
`FeedOpenResponse` message to the client. As per the Feedme specification, the
server is not permitted to reject feed closure requests.

#### disconnect

Emitted when a client's state transitions from `awaiting_handshake`,
`processing_handshake`, or `ready` to `not_connected`.

If there were `handshake`, `action`, `feedOpen`, or `feedClose` events
associated with the client that have not yet been responded to, then subsequent
`xres.success()` and `xres.failure()` calls will succeed but do nothing.

Arguments passed to the listeners:

1. `clientId` (string) is the Feedme client identifier that the library has
   assigned to the client.

2. `err` (optional Error) indicates the error condition, if any.

- If the client was intentionally disconnected by a call to
  `server.disconnect()` then `err` is omitted.

- If the client did not submit a valid and compatible `Handshake` message within
  `options.handshakeMs` (if enabled), then `err` is an `Error` object with
  `err.message === "HANDSHAKE_TIMEOUT: ..."`.

- If the connection was severed intentionally by the client or there was a
  transport connectivity problem, then `err` is an `Error` object with
  `err.message === "FAILURE: ..."`.

- If the transport state became `stopping` then `err` is an `Error` object with
  `err.message === "STOPPING: ..."`.

#### badClientMessage

Emitted when a client violates the Feedme specification.

Arguments passed to the listeners:

1. `clientId` (string) is the Feedme client identifier that the library has
   assigned to the client.

2. `err` (Error) describes the nature of the violation.

The following errors are possible:

- `err.message === "INVALID_MESSAGE: ..."`

  The client transmitted a message that was not valid JSON or that violated one
  of the JSON schemas laid out in the Feedme specification.

  - `err.clientMessage` (string) contains the client message.

  - `err.parseError` (Error) contains the message parsing error.

- `err.message === "UNEXPECTED_MESSAGE: ..."`

  The client transmitted a message that was invalid given the state of the
  conversation.

  - `err.clientMessage` (string) contains the client message.

#### transportError

Emitted when the transport violates the requirements set out in the developer
documentation.

Listeners are passed an `Error` object indicating the nature of the violation.

### Methods

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
  data and distribute it with the action revelation. Note that the library does
  _not_ check whether previously-passed feed data, with deltas applied, is
  consistent with the feed data specified here -- it is up to the application to
  ensure validity. If this parameter is present, then `params.feedMd5` must not
  be present; if neither parameter is present, then clients will not be sent a
  hash for feed data integrity verification.

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
  a `FeedTermination` message. The library will respond to any subsequent
  `FeedClose` message as configured by `options.terminationMs`.

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

#### Feed Open Objects

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

#### Feed Close Objects

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

## Sample Code
