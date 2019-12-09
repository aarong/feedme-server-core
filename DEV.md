# Information for Library Developers

This documentation is for developers of the Feedme server core library itself.

<!-- TOC depthFrom:2 -->

- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Source Modules](#source-modules)
  - [Source Files](#source-files)
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

  - `src/main.js` Entrypoint for transpiling the module build.

  - `src/__tests__` Unit tests (Jest).

- `tests/`

  Functional tests for the module.

  (Jest)

## Source Modules

Module source code is written in ES6 and is transpiled on build for Node and the
browser.

Eslint enforces Airbnb style and applies Prettier (which takes precence over
some Airbnb rules). A lint check is performed before unit tests.

Errors are thrown, called back, and emitted in the form
`new Error("ERROR_CODE: Some more descriptive text.")`.

### Source Files

- `main.js` is the common entrypoint for the module. It takes a transport object
  from the outside, injects that into a server object, and returns the server.

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
to function correctly with the library. The server object interacts with
transports through a wrapper that aims to detect invalid behavior and emits a
server `transportError` event if the transport does something unexpected.

### Fundamentals

Transport objects must be able to listen for client connections and, once a
client has connected, exchange string messages across the connection. Messages
must be received by the other side in the order that they were sent.

Transport objects must be traditional Javascript event emitters. Specifically,
they must implement `transport.on(eventName, listenerFunction)` and emit events
to subscribed listeners as described below.

Transport objects must assign a unique string identifier to each client
connection.

### Transport States

Transport objects must always be in one of four states:

- `stopped` - The transport is not listening for client connections and is not
  attempting to listen. The transport must emit no events until there is a call
  to `transport.start()`.

- `starting` - The transport is attempting begin listening for client
  connections. The transport may emit only a `start` or `stopping` event.

- `started` - The transport is listening for client connections and may have
  active connections. The transport may emit any event except `starting`,
  `start`, and `stop` (it must first emit `stopping`).

- `stopping` - The transport is in the process of closing client connections and
  is stopping listening for new connections. The transport must emit only a
  `stop` event.

Transport objects must only change state in the following circumstances:

1. When `stopped` and an outside call to `transport.start()` is received, the
   transport state must become `starting`.

2. When `starting` and the transport successfully begins listening for client
   connections, the transport state must become `started`.

3. When `starting` and the transport fails to begin listening for client
   connections, the transport state must become `stopping`.

4. When `started` and a call to `transport.stop()` is received, the transport
   state must become `stopping`.

5. When `started` and an unexpected internal transport failure occurs, the
   transport state must become `stopping`.

6. When `stopping` and the transport has stopped listening for new connections,
   disconnected all previously-connected clients, and is ready to potentially
   restart, the transport state must become `stopped`.

### Clients

When the transport state is `started`, clients may connect and exchange messages
with the transport.

When a new connection is established by a client, the transport must:

- Assign the connection a unique string identifier.

- Emit a `connect` event referencing the client.

- Subsequently, if a message is received from the client, it must emit a
  `message` event with referencing the client and passing along the message.

- When the connection with the client is severed, whether due to an internal
  transport failure, an intentional client disconnect, a call to
  `transport.disconnect()`, or a call to `transport.stop()`, it must emit a
  `disconnect` event referencing the client. It must emit no further `message`
  or `disconnect` events referencing the client identifier (but it is free to
  reuse the identifier in a future `connect` event).

### Transport Methods

Transport objects must implement the following methods:

- `transport.state()`

  Allows the server to retrieve the current transport state.

  Returns `"stopped"`, `"starting"`, `"started"`, or `"stopping"`.

- `transport.start()`

  Allows the server to tell the transport to begin listening for client
  connections. Returns nothing.

  The server will only call this method if the transport state is `stopped`.

  The transport state must become `starting` and the `starting` event must be
  emitted synchronously.

  If the transport starts successfully, the transport state must become
  `started` and the `start` event must be emitted.

  If the transport fails to start, the transport state must become `stopping`
  and then eventually `stopped`. The `stopping` and eventually `stop` events
  must be emitted.

- `transport.stop()`

  Allows the server to tell the transport to stop accepting new connections and
  terminate existing connections. Returns nothing.

  The server will only call this method if the transport state is `started`.

  The transport state must become `stopping` and eventually `stopped`. The
  `stopping` and eventually `stopped` events must be emitted.

- `transport.send(clientId, msg)`

  Allows the server to send a string message to a client. Returns nothing.

  The server will only call this method if the transport state is `started` and
  will only reference a `clientId` that is `connected`.

- `transport.disconnect(clientId, [err])`

  Allows the server to forcibly terminate a client's transport connection.

  Returns nothing.

  The server will only call this method if the transport state is `started` and
  will only reference a `clientId` that is `connected`.

### Transport Events

Transport objects must emit an event when they change state, when a client
connects or disconnects, and when a message has been received from a connected
client.

- `starting`

  Informs the server that the transport state is now `starting`. This event must
  only be emitted when the transport state was previously `stopped`.

- `start`

  Informs the server that the transport state is now `started`. This event must
  only be emitted when the transport state was previously `starting`.

- `stopping([err])`

  Informs the server that the transport state is now `stopping`. This event must
  only be emitted when the transport state was previously `starting` or
  `started`.

  If the stoppage resulted from an explicit server call to `transport.stop()`
  then the transport must not pass an error object to the listeners. The
  transport must not pass `null`, `undefined`, `false`, or any other value in
  place of the error object.

  If the stoppage resulted from a failure to start the transport after a call to
  `transport.start()` or from an internal failure once `started`, then an error
  of the form `new Error("FAILURE: Descriptive error message.")` must be must be
  passed to the listeners.

  The server must emit a `disconnect` event referencing each
  previously-connected client before emitting the `stopping` event.

- `stop([err])`

  Informs the server that the transport state is now `stopped`. This event must
  only be emitted when the transport state was previously `stopping`.

  The transport must pass the same `err` object (or not) that was passed with
  the previous `stopping` event.

- `connect(clientId)`

  Informs the server that a new client has connected and that the client has
  been assigned the string identifier `clientId`. This event must only be
  emitted when the transport state is `started`.

- `message(clientId, msg)`

  Informs the server that a string message `msg` has been received from
  `clientId`.

  This event must only be emitted when the transport state is `started` and
  after a `connect` event has been emitted referencing the given `clientId`.

- `disconnect(clientId, [err])`

  Informs the server that `clientId` has disconnected.

  This event must only be emitted when the transport state is `started`. A
  previous `connect` event must have been emitted referencing the given
  `clientId`.

  Once this event has been emitted, the transport must emit no further `message`
  or `disconnect` events referencing `clientId`.

  If the disconnect resulted from a server call to `transport.disconnect()`...

  - If the `disconnect()` call received an `err` argument, then the transport
    must pass it to the event listeners.

  - If the `disconnect()` call received no `err` argument, then the transport
    must not pass an error object to the listeners. The transport must not pass
    `null`, `undefined`, `false`, or any other value in place of the error
    object.

  If the disconnect resulted from an explicit call to `transport.stop()` then
  the transport, then an error of the form
  `new Error("STOPPING: Descriptive error message.")` must be must be passed to
  the listeners.

  If the event resulted from a connection failure internal to the transport or
  an intentional client-side disconnect, then an error of the form
  `new Error("FAILURE: Descriptive error message.")` must be must be passed to
  the listeners.

  If the server is stopping, a `disconnect` event must be emitted for each
  previously-connected client before the `stopping` event is emitted.