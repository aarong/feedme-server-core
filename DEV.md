# Information for Library Developers

This documentation is for developers of the Feedme server core library itself.

<!-- TOC depthFrom:2 -->

- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Source Modules](#source-modules)
- [Target Node and NPM Versions](#target-node-and-npm-versions)
- [NPM Scripts](#npm-scripts)
- [Development and Deployment Workflow](#development-and-deployment-workflow)
- [Transport API](#transport-api)
  - [Fundamentals](#fundamentals)
  - [Transport States](#transport-states)
  - [Clients](#clients)
  - [Transport Methods](#transport-methods)
  - [Transport Events](#transport-events)

<!-- /TOC -->

## Getting Started

To get started:

```shell
git clone https://github.com/aarong/feedme-server-core
cd feedme-server-core
npm install
```

Edit the source code in the `src` folder and run linting and unit tests:

```shell
npm run test-src
# or
npm run test-src -- --watch
```

Build a publish-ready NPM package in the `build` folder:

```shell
npm run build
```

When the build process has completed, functional tests are automatically run on
the Node module in `build`. Those tests can also be run explicitly:

```shell
npm run test-build
```

To enable debugging output set the `debug` environment variable to
`feedme-server-core`.

## Directory Structure

- `build/`

  Created by `npm run build`. Contains files ready to be deployed as an NPM
  package. Includes an entrypoint for Node (`index.js`).

  LICENSE, README.md, and package.json are included.

  (Gulp)

- `coverage/`

  Created by `npm run coverage`. Coverage information for unit tests only.

  (Jest)

- `docs/`

  Created by `npm run docs`. Source code documentation.

  (Documentation.js)

- `src/`

  Module source code. Linted ES6.

- `src/__tests__`

  Unit tests

  (Jest).

- `tests/`

  Functional tests for the module.

  (Jest)

## Source Modules

Module source code is written in ES6 and is transpiled for Node on build.

Eslint enforces Airbnb style and applies Prettier (which takes precence over
some Airbnb rules). A lint check is performed before unit tests.

Errors are thrown, called back, and emitted in the form
`new Error("ERROR_CODE: Some more descriptive text.")`.

## Target Node and NPM Versions

The intention is to support Node and NPM back as far as realistically possible.

For a development install, the binding dependency constraint is that Eslint
requires Node 6+, but package-lock.json is only supported by NPM 5+, which comes
with Node 8+. Develop on Node 8+ and NPM 5+ to ensure that the repo has
package-lock.json, and rely on Travis to test on Node 6. The Node 6 build is
published to NPM, as it should be compatible with later versions of Node.

Since production installs run code transpiled for Node 6, there is no guarantee
that they will support earlier versions of Node even though there are far fewer
dependency-related version constraints.

## NPM Scripts

- `npm run docs` Generate source code documentation in `docs`.

- `npm run lint-src` Check for linting errors in `src`.

- `npm run lint-build-tests` Check for linting errors in `tests`.

- `npm run coverage` Display Jest unit test coverage.

- `npm run coveralls` Used by Travis to pass coverage information to Coveralls.

- `npm run test-src` Run linting and Jest unit tests on the source code. Aliased
  by `npm run test`. (Jest)

- `npm run build` Run the unit tests, build a publishable NPM package in
  `build`, and run the functional tests on the build.

- `npm run test-build` Run functional tests against the module in the `build`
  folder. (Jest)

## Development and Deployment Workflow

Contributors can fork the repo, make changes, and submit a pull request.

Significant new features should be developed in feature branches.

```shell
# Fork and clone the repo locally
git checkout -b my-new-feature
# Make changes
git commit -m "Added my new feature."
git push origin my-new-feature
# Submit a pull request
```

Commits to the master branch are built and tested by Travis CI. If the NPM
package version has been incremented, then Travis will deploy by publishing the
build to NPM.

## Transport API

Transport objects abstract away the specifics of the messaging connections
between clients and the server. A transport object is injected into the server
library at initialization.

Transport objects must implement the following interface and behavior in order
to function correctly with the library. The server library interacts with
transports through a wrapper that aims to detect invalid behavior and emits a
server `transportError` event if the transport does something unexpected.

### Fundamentals

Transport objects must be able to listen for client connections and, once a
client has connected, exchange `string` messages across the connection. Messages
must be received by the other side in the order that they were sent.

Transport objects must be traditional Javascript event emitters. Specifically,
they must implement `transport.on(eventName, eventListenerFunction)` and emit
events to subscribed listeners as described below.

Transport objects must assign a unique `string` identifier to each client
connection.

### Transport States

Transport objects must always be in one of four states:

- `stopped` - The transport is not listening for client connections and is not
  attempting to listen.

- `starting` - The transport is attempting begin listening for client
  connections.

- `started` - The transport is listening for client connections and may have
  active connections.

- `stopping` - The transport is in the process of closing client connections and
  is stopping listening for new connections.

Transport objects must only change state in the following circumstances:

1. When `stopped` and a library call to `transport.start()` is received, the
   transport state must become `starting`.

2. When `starting` and the transport successfully begins listening for client
   connections, the transport state must become `started`.

3. When `starting` and the transport fails to begin listening for client
   connections, the transport state must become `stopping`.

4. When `started` and a library call to `transport.stop()` is received, the
   transport state must become `stopping`.

5. When `started` and an unexpected internal transport failure occurs, the
   transport state must become `stopping`.

6. When `stopping` and the transport has stopped listening for new connections,
   disconnected all previously-connected clients, and is ready to potentially
   restart, the transport state must become `stopped`.

### Clients

When the transport state is `started`, clients may connect and exchange messages
with the transport.

When a new connection is established by a client, the transport must:

- Assign the connection a unique `string` identifier.

- Emit a `connect` event referencing the client.

- Subsequently, if a message is received from the client, it must emit a
  `message` event referencing the client and passing along the message.

- When the connection with the client is severed, whether due to an internal
  transport failure, an intentional client disconnect, a call to
  `transport.disconnect()`, or a call to `transport.stop()`, the transport must
  emit a `disconnect` event referencing the client. The transport must emit no
  further `message` or `disconnect` events referencing the client identifier,
  but it is free to reuse the identifier in a future `connect` event.

### Transport Methods

Transport objects must implement the following methods:

- `transport.state()`

  Allows the library to retrieve the current transport state.

  Returns `"stopped"`, `"starting"`, `"started"`, or `"stopping"`.

- `transport.start()`

  Allows the library to tell the transport to begin listening for client
  connections.

  The library will only call this method if the transport state is `stopped`.

  The transport state must become `starting` and the `starting` event must be
  emitted synchronously.

  If the transport starts successfully, the transport state must become
  `started` and the `start` event must be emitted, either synchronously or
  asynchronously.

  If the transport fails to start, the transport state must become `stopping`
  and the `stopping` event must be emitted, either synchronously or
  asynchronously. The transport state must then eventually become `stopped` and
  the `stop` event must be emitted, either synchronously or asynchronously.

  If a synchronous error condition occurs, the transport must emit `starting`,
  `stopping(err)`, and `stopped(err)`. It must not throw an error.

- `transport.stop()`

  Allows the library to tell the transport to stop accepting new connections and
  terminate existing connections.

  The library will only call this method if the transport state is `started`.

  The transport state must become `stopping` and the `stopping` event must be
  emitted synchronously. The transport state must then eventually become
  `stopped` and the `stop` event must be emitted, either synchronously or
  asynchronously.

- `transport.send(clientId, msg)`

  Allows the library to send a `string` message to a client.

  The library will only call this method if the transport state is `started` and
  will only reference a `clientId` that is connected.

  If a synchronous transmission error occurs, the transport must emit
  `disconnect(clientId, err)`. It must not throw an error.

- `transport.disconnect(clientId, [err])`

  Allows the library to forcibly terminate a client's transport connection.

  The library will only call this method if the transport state is `started` and
  will only reference a `clientId` that is connected.

  The transport must synchronously emit a `disconnect` event referencing the
  client. If the library specifies the `err` argument, it must be emitted with
  the `disconnect` event.

### Transport Events

Transport objects must emit an event when they change state, when a client
connects or disconnects, and when a message has been received from a connected
client.

- `starting`

  Informs the library that the transport state is now `starting`.

- `start`

  Informs the library that the transport state is now `started`.

- `stopping([err])`

  Informs the library that the transport state is now `stopping`.

  If the stoppage resulted from an explicit library call to `transport.stop()`
  then the transport must not pass an error object to the listeners. The
  transport must not pass `null`, `undefined`, `false`, or any other value in
  place of the error object.

  If the stoppage resulted from a failure to start the transport after a call to
  `transport.start()` or from an internal failure once `started`, then an error
  of the form `new Error("FAILURE: Descriptive error message.")` must be passed
  to the listeners.

  The library must emit a `disconnect` event referencing each
  previously-connected client before emitting the `stopping` event and must pass
  the same error, or no error, with that event.

- `stop([err])`

  Informs the library that the transport state is now `stopped`.

  The transport must pass the same `err` object, or no error, that was passed
  with the preceding `stopping` event.

  The transport state must remain `stopped` until the library calls
  `transport.start()`.

- `connect(clientId)`

  Informs the library that a new client has connected and that the client has
  been assigned the `string` identifier `clientId`. This event must only be
  emitted when the transport state is `started`.

- `message(clientId, msg)`

  Informs the library that a `string` message `msg` has been received from
  `clientId`.

  This event must only be emitted when the transport state is `started` and
  after a `connect` event has been emitted referencing `clientId`.

- `disconnect(clientId, [err])`

  Informs the library that `clientId` has disconnected.

  This event must only be emitted when the transport state is `started` and
  after a `connect` event has been emitted referencing `clientId`.

  Once this event has been emitted, the transport must emit no further `message`
  or `disconnect` events referencing `clientId`.

  If the disconnect resulted from a library call to `transport.disconnect()`...

  - If the library passed an `err` argument, then the transport must pass it to
    the `disconnect` event listeners.

  - If the library did not pass an `err` argument, then the transport must not
    pass an error object to the `disconnect` listeners. The transport must not
    pass `null`, `undefined`, `false`, or any other value in place of the error
    object.

  If the disconnect resulted from a library call to `transport.stop()` then the
  transport must pass an error of the form
  `new Error("STOPPING: Descriptive error message.")` to the listeners.

  If the disconnect resulted from a connection failure internal to the transport
  or an intentional client-side disconnect, then the transport must pass an
  error of the form `new Error("FAILURE: Descriptive error message.")` to the
  listeners.

  If the library is stopping, a `disconnect` event must be emitted for each
  previously-connected client before the `stopping` event is emitted.
