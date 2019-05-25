[![Build Status](https://travis-ci.com/aarong/feedme-server-core.svg?branch=master)](https://travis-ci.com/aarong/feedme-server-core)
[![Coverage Status](https://coveralls.io/repos/github/aarong/feedme-server-core/badge.svg?branch=master)](https://coveralls.io/github/aarong/feedme-server-core?branch=master)

[![Feedme](https://raw.githubusercontent.com/aarong/feedme-server-core/master/logo.svg?sanitize=true)](https://feedme.global)

# Feedme Node.js Server Core

A simple and highly flexible Feedme server library for Node.js created and
maintained as a core part of the [Feedme](https://feedme.global) project.

Exposes a simple but powerful API and handles unexpected developments
appropriately. Well documented and thoroughly tested.

This package is intended mainly as a communications foundation for Feedme server
libraries with greater functionality. Application developers will likely be more
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
  - [Events](#events)
  - [Methods](#methods)
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

- `options.transport` - Required object.

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

- `stop`

  Emitted when the server state changes from `stopping` to `stopped`.

  If the stoppage resulted from a call to `server.stop()` then listeners are
  invoked with no arguments.

  If the stoppage resulted from a transport error condition then listeners are
  passed the `Error` object emitted by the transport.

- `connect`

  Emitted when a client connects to the server and performs a valid handshake.

  Arguments passed to the listeners:

  1. `clientId` (string)

  A random identifier assigned by the server to the client (and shared with the
  client).

- `disconnect`

  Emitted when a client disconnects from or is disconnected by the server.

Fired on intentional disconnect? And what is that API call?

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

## Sample Code
