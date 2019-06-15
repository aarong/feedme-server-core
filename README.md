[![Build Status](https://travis-ci.com/aarong/feedme-server-core.svg?branch=master)](https://travis-ci.com/aarong/feedme-server-core)
[![Coverage Status](https://coveralls.io/repos/github/aarong/feedme-server-core/badge.svg?branch=master)](https://coveralls.io/github/aarong/feedme-server-core?branch=master)

[![Feedme](https://raw.githubusercontent.com/aarong/feedme-server-core/master/logo.svg?sanitize=true)](https://feedme.global)

# Feedme Node.js Server Core

A relatively low-level Feedme server library for Node.js created and maintained
as a core part of the [Feedme](https://feedme.global) project.

Exposes a simple but powerful API and handles unexpected developments
appropriately. Well documented and thoroughly tested.

This package is intended primarily as a foundation for Feedme server libraries
with greater functionality and applications aiming for high scalability.

Application developers may be more interested in
[Feedme Node.js Server](https://github.com/aarong/feedme-server).

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
  - [Events](#events)
  - [Methods](#methods)
  - [Objects](#objects)
    - [Actions](#actions)
      - [ActionRequest](#actionrequest)
      - [ActionResponse](#actionresponse)
      - [ActionRevelation](#actionrevelation)
    - [Feed Opens](#feed-opens)
      - [FeedOpenRequest](#feedopenrequest)
      - [FeedOpenResponse](#feedopenresponse)
    - [Feed Closes](#feed-closes)
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

Once a server has been initialized the application can begin to listen for
client connections.

## API

### Initialization

To initialize a server:

```javascript
var server = feedmeServerCore(options);
```

The server is initialized `stopped` and will remain `stopped` until there is a
call to `server.start()`.

If initialization fails then the factory function will throw an `Error` object
(`err`). The following errors may be thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  The `options` argument was invalid.

The `options` argument is an object with the following properties:

- `options.transport` - Required object or array of objects.

  A transport object used to listen for client connections. The object must
  satisfy the requirements laid out in the developer documentation.

  Application code must not operate on the transport object directly and must
  not pass a given transport object to more than one server instance.

  The tranport object must be `stopped`.

- `options.handshakeMs` - Optional non-negative integer. Defaults to 30000.

  Specifies how long to wait for a client to perform a successful handshake
  after connecting to the server.

  If greater than 0, then the server will wait `handshakeMs` before
  disconnecting clients.

  If set to 0, then the server will wait indefinitely for clients to perform a
  successful handshake.

- `options.feedTerminationMs` - Optional non-negative integer. Defaults
  to 30000.

  To account for transport latency, the Feedme specification requires that
  servers continue to accept feed closure messages for some time after
  terminating a given feed. The duration of this window is configured using
  `feedTerminationMs`.

  If greater than 0, the server will continue to return success to feed closure
  requests for `feedTerminationMs` after terminating a feed for a given client.

  If set to 0, the server will continue to return success to feed closure
  requests indefinitely.

### Events

- `starting`

  Emitted when the server state changes from `stopped` to `starting`.

  Arguments: None

- `start`

  Emitted when the server state changes from `starting` to `started`.

  Arguments: None

- `stopping`

  Emitted when the server state changes from `started` to `stopping`.

  If the stoppage resulted from a call to `server.stop()` then listeners are
  invoked with no arguments.

  If the stoppage resulted from a transport error condition then listeners are
  passed the `Error` object emitted by the transport.

  When the server transitions to `stopping`, any outstanding `ActionResponse`,
  `FeedOpenResponse`, and `FeedCloseResponse` objects are destroyed. Their
  method calls will return success but will do nothing.

* `stop`

  Emitted when the server state changes from `starting` or `stopping` to
  `stopped`.

  If the stoppage resulted from a call to `server.stop()` then listeners are
  invoked with no arguments.

  If the stoppage resulted from a transport error condition then listeners are
  passed the `Error` object emitted by the transport.

* `connect`

  Emitted when a client connects to the server and performs a valid handshake.

  Arguments passed to the listeners:

  1. `clientId` (string) is a random identifier assigned by the server to the
     client (and shared with the client).

* `disconnect`

  Emitted when a client disconnects from the server.

  Arguments passed to the listeners:

  1. `clientId` (string) is the identifier assigned by the server to the client.

  2. `error` (optional Error) If the client was intentionally disconnected by
     the server via a call to `server.disconnect()` then no error is passed to
     the listeners. If the connection was severed intentionally by the client,
     or due to a transport problem, then a transport-specified error is passed
     to the listeners.

* `action`

  Emitted when a client asks to perform any action on the server and when any
  action is deemed to have occurred using `server.action()`.

  Arguments passed to the listeners:

  1. `actionRequest` (object) is an `ActionRequest` object describing the action
     request.

  2. `actionResponse` (object) is an `ActionResponse` object enabling the server
     to respond to the action request and reveal the action on feeds.

  The application _must_ eventually call `actionResponse.success()` or
  `actionResponse.failure()` to return a result (there is no internal timeout).

  In almost no cases should multiple listeners be assigned, as you can only
  respond to a request once.

* `feedOpen`

  Emitted when a client asks to open a feed.

  Arguments passed to the listeners:

  1. `feedOpenRequest` (object) is a `FeedOpenRequest` object describing the
     client request.

  2. `feedOpenResponse` (object) is a `FeedOpenResponse` object enabling the
     application to respond to the request.

  The application _must_ eventually call `feedOpenResponse.success()` or
  `feedOpenResponse.failure()` to return a result (there is no internal
  timeout).

  In almost no cases should multiple listeners be assigned, as you can only
  respond to a request once.

* `feedClose`

  Emitted when a client asks to close a feed.

  Arguments passed to the listeners:

  1. `feedCloseRequest` (object) is a `FeedCloseRequest` object describing the
     client request.

  2. `feedCloseResponse` (object) is a `FeedCloseResponse` object enabling the
     application to respond to the request.

  The application _must_ eventually call `feedCloseResponse.success()`. As per
  the specification, the server is not permitted to reject feed closure
  requests.

  In almost no cases should multiple listeners be assigned, as you can only
  respond to a request once.

* `badClientMessage`

  Emitted when a client message violates the spec.

  Arguments passed to the listeners:

  1. `err` (Error) -- Document types!

* `transportError`

  Emitted when the transport violates the requirements set out in the developer
  documentation.

  Arguments passed to the listeners:

  1. `err` (Error) -- Document types!

### Methods

- `server.state()` - Returns string

  Returns the current server state:

  - `"stopped"` - The server has no active client connections and is not
    attempting to start listening for new connections.

  - `"starting"` - The server has no active client connections but is attempting
    to start listening for new client connections.

  - `"started"` - The server is listening for new client connections and may
    have active client connections.

  - `"stopping"` - The server has stopped listening for new client connections
    and is in the process of winding down existing client connections.

  Errors thrown: None

- `server.start()` - Returns nothing

  Initiates an attempt to start the server. The server state must be `stopped`.

  Errors thrown:

  - `err.message === "INVALID_STATE: ..."`

    The server state is not `stopped`.

- `server.stop()` - Returns nothing

  Initiates the process of stopping the server. The server state must be
  `started`.

  Errors thrown:

  - `err.message === "INVALID_STATE: ..."`

    The server state is not `started`.

- `server.action(clientId, actionName, actionArgs, callback)`

  Initiates an action by firing the `action` event for processing.

  Arguments:

  1. `clientId` (string or falsy) If the action is being deemed to have been
     undertaken by a specific client, its client id can be specified here. If
     there is no specific client considered to have performed this action, then
     set falsy.

  2. `actionName` (string) The name of the action.

  3. `actionArgs` (object) The arguments for invokation.

  4. `callback` (function) Called when the action processing is complete.

  - On success, it receives `callback(undefined, actionData)` where `actionData`
    is the result of the action.

  - On failure, it receives `callback(err)` where `err` is an Error object
    describing the nature of the failure.

    Errors called back:

    - `err.message === "REJECTED: ..."`

    The `action` processor called `actionResponse.failure()`. In this case
    `err.errorCode` (string) and `err.errorData` (object) are present.

    - `err.message === "STOPPING: ..."`

    The server is stopping.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more arguments was invalid.

  - `err.message === "INVALID_STATE: ..."`

    The server is not `started`.

- `server.reveal(actionName, actionData, feedName, feedArgs, feedDeltas, feedDataHash)`

  Transmits `ActionRevelation` messages to clients with the feed open. Used
  mainly to pipe in actions performed on other nodes in a cluster. Can also be
  used to inform clients about server-initiated actions, but `server.action()`
  is suited better for that purpose.

  Arguments:

  - `actionName` (string) Name of the action being revealed.

  - `actionData` (object) Action data for the action being revealed.

  - `feedName` (string) Feed name for the revelation.

  - `feedArgs` (object of strings) Feed arguments for the revelation.

  - `feedDeltas` (array of spec-compliant feed delta objects) Updates to the
    feed data.

  - `feedDataHash` (string) Spec-compliant hash of the post-delta feed data.
    Base 64 encoded MD5 hash of exactly X characters.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more arguments was invalid.

  - `err.message === "INVALID_STATE: ..."`

    The server is not `started`.

- `server.terminateClientFeed(clientId, feedName, feedArgs, errorCode, errorData)`

  Forcibly closes a specific client feed.

  If the client feed is `opening`, the client is sent a `FeedOpenResponse`
  message indicating failure, with the error code and data set according to the
  function arguments. No further action is taken when the `feedOpen` event
  listener subsequently calls `feedOpenResponse.success()` or
  `feedOpenResponse.failure()`.

  If the client feed is `open`, the client is sent a `FeedTermination` message.

  If the client feed is `closing`, the client is sent a `FeedTermination`
  message. No further action is taken when the `feedClose` event listener
  subsequently calls `feedCloseResponse.success()`.

  If the client feed is `closed` then nothin is sent to the client and the
  function call returns successfully.

  Arguments:

  - `clientId` (string) The id of the client whose feed is being terminated.

  - `feedName` (string) The name of the feed being terminated.

  - `feedArgs` (object of strings) Arguments for the feed being terminated.

  - `errorCode` (string) Error code returned to the client.

  - `errorData` (object) Error data returned to the client.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more arguments was invalid.

  - `err.message === "INVALID_STATE: ..."`

    The server is not `started`.

- `server.terminateClientFeeds(clientId, errorCode, errorData)`

  Forcibly closes all of a client's feeds.

  For each client feed that is `opening`, `open`, or `closing`...

  - For feeds that are `opening`, the client is sent a `FeedOpenResponse`
    message indicating failure, with the error code and data set according to
    the function arguments. No further action is taken when the `feedOpen` event
    listener subsequently calls `feedOpenResponse.success()` or
    `feedOpenResponse.failure()`.

  - For feeds that are `open`, the client is sent a `FeedTermination` message.

  - For feeds that are `closing`, the client is sent a `FeedTermination`
    message. No further action is taken when the `feedClose` event listener
    subsequently calls `feedCloseResponse.success()`.

  Arguments:

  - `clientId` (string) The id of the client whose feeds are being terminated.

  - `errorCode` (string) Error code returned to the client.

  - `errorData` (object) Error data returned to the client.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more arguments was invalid.

  - `err.message === "INVALID_STATE: ..."`

    The server is not `started`.

- `server.terminateFeedClients(feedName, feedArgs, errorCode, errorData)`

  Forcibly closes all client subscriptions to a given feed.

  For each client feed that is `opening`, `open`, or `closing`...

  - For feeds that are `opening`, the client is sent a `FeedOpenResponse`
    message indicating failure, with the error code and data set according to
    the function arguments. No further action is taken when the `feedOpen` event
    listener subsequently calls `feedOpenResponse.success()` or
    `feedOpenResponse.failure()`.

  - For feeds that are `open`, the client is sent a `FeedTermination` message.

  - For feeds that are `closing`, the client is sent a `FeedTermination`
    message. No further action is taken when the `feedClose` event listener
    subsequently calls `feedCloseResponse.success()`.

  Arguments:

  - `feedName` (string) The name of the feed whose subscriptions are being
    terminated.

  - `feedArgs` (object of string) Arguments for the feed whose subscriptions are
    being terminated.

  - `errorCode` (string) Error code returned to the clients.

  - `errorData` (object) Error data returned to the clients.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more arguments was invalid.

  - `err.message === "INVALID_STATE: ..."`

    The server is not `started`.

- `server.disconnect(clientId)`

  Forcible disconnects a client transport connection.

  Arguments:

  - `clientId` (string) The id of the client being disconnected.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more arguments was invalid.

  - `err.message === "INVALID_STATE: ..."`

    The server is not `started`.

### Objects

Applications interact with the library using the following types of objects.

#### Actions

When the `action` event is fired, listeners receive two parameters, an
`ActionRequest` object and an `ActionResponse` object. The `ActionResponse`
object can be used to generate `ActionRevelation` objects, which in turn are
used to reveal the action on feeds.

##### ActionRequest

`ActionRequest` objects have the following properties:

- `actionRequest.clientId` (optional string) holds the client id associated with
  the action request. Will not be present if the server deems an action without
  a client id.

- `actionRequest.actionName` (string) is the name of the action being invoked.

- `actionRequest.actionArgs` (object) contains arguments for the invokation.

##### ActionResponse

`ActionResponse` objects have the following methods:

- `actionResponse.revelation(feedName, feedArgs, oldFeedData)`

  Returns an `ActionRevelation` object used to reveal the current action on the
  specified feed.

  Arguments:

  1. `feedName` (string) is the feed name for the revelation.

  2. `feedArgs` (object of strings) contains the feed arguments for the
     revelation.

  3. `oldFeedData` (optional object) contains the feed data prior to the action
     revelation. If specified, then delta operations are checked for validity
     against the data and a hash of the post-delta data is distributed to
     clients for integrity checking.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_REVEALED: ..."`

    The action is already being revealed on the specified feed name-argument
    combination.

- `actionResponse.success(actionData)`

  Indicates that the action has been invoked successfully. Response is passed
  back to the client, or to the `server.action()` callback for deemed actions.
  The action is revealed on feeds as specified.

  Arguments:

  1. `actionData` (object) is the action data.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `actionResponse.success()` or
    `actionResponse.failure()`.

- `actionResponse.failure(errorCode, errorData)`

  Indicates that the action request was rejected or failed. A failure response
  is passed to the client, or to the `server.action()` callback for deemed
  actions. Any revelations are discarded.

  Arguments:

  1. `errorCode` (string) describes the failure.

  2. `errorData` (optional object) may provide additional details, which will be
     returned to the called.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    The server has already to this request (perhaps via a different listener).

##### ActionRevelation

`ActionRevelation` objects provide an interface for modifying feed data. All of
the delta operations in the specification are implemented.

If the object was created with a copy of the `oldFeedData`, then delta
operations are checked for validity and a hash of the post-delta feed data is
returned to the called for integrity verification.

`ActionRevelation` objects have the following methods, which correspond to delta
operations:

- `actionRevelation.set(path, value)`

  Assigns `value` to `path`.

  - `path` (array) is a path in the feed data. The parent node must exist.

  - `value` (any JSON-serializable value) is the value being assigned.

- All other delta operations - take descriptions largely from the spec

#### Feed Opens

When the `feedOpen` event is fired, listeners receive two parameters, a
`FeedOpenRequest` object and a `FeedOpenResponse` object.

##### FeedOpenRequest

`FeedOpenRequest` objects have the following properties:

- `feedOpenRequest.clientId` (string) holds the client id associated with the
  feed open request.

- `feedOpenRequest.feedName` (string) is the name of the feed being opened.

- `feedOpenRequest.feedArgs` (object of strings) contains arguments for for the
  feed being opened.

##### FeedOpenResponse

`FeedOpenResponse` objects have the following methods:

- `feedOpenResponse.success(feedData)`

  Indicates to the client that the feed has been opened successfully.

  Arguments:

  1. `feedData` (object) specifies the initial state of the feed data.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `feedOpenResponse.success()` or
    `feedOpenResponse.failure()`.

- `feedOpenResponse.failure(errorCode, errorData)`

  Indicates to the client that the feed open request was rejected or failed.

  Arguments:

  1. `errorCode` (string) describes the failure.

  2. `errorData` (optional object) may provide additional details, which will be
     returned to the called.

  Errors thrown:

  - `err.message === "INVALID_ARGUMENT: ..."`

    One or more of the specified arguments was invalid.

  - `err.message === "ALREADY_RESPONDED: ..."`

  The server has already to this request (perhaps via a different listener).

#### Feed Closes

When the `feedClose` event is fired, listeners receive two parameters, a
`FeedCloseRequest` object and a `FeedCloseResponse` object.

##### FeedCloseRequest

`FeedCloseRequest` objects have the following properties:

- `feedCloseRequest.clientId` (string) holds the client id associated with the
  feed close request.

- `feedCloseRequest.feedName` (string) is the name of the feed being closed.

- `feedCloseRequest.feedArgs` (object of strings) contains arguments for for the
  feed being closed.

##### FeedCloseResponse

`FeedCloseResponse` objects have the following methods:

- `feedCloseResponse.success()`

  Indicates to the client that the feed has been closed successfully.

  Errors thrown:

  - `err.message === "ALREADY_RESPONDED: ..."`

    There has already been a call to `feedCloseResponse.success()` or
    `feedCloseResponse.failure()`.

## Sample Code
