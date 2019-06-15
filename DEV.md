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
between clients and the server. Transport object are injected into the server at
initialization.

Transport objects must implement the following interface and behavior in order
to function correctly with the server. The server object interacts with
transports through a wrapper that aims to detect invalid behavior and emits a
server `transportError` event if the transport does something unexpected.

### Fundamentals

Transport objects must be able to listen for client connections and, once a
client has connected, exchange string messages across the client-server
connection. Messages must be received by the other side in the order that they
were sent.

Transport objects must be traditional Javascript event emitters. Specifically,
they must implement `transport.on(eventName, listenerFunction)` and emit events
to subscribed listeners as described below.

### Transport States

Transport objects must always be in one of four states:

- `stopped` - The transport is not listening for client connections and is not
  attempting to begin listening.

- `starting` - The transport is attempting to begin listening for client
  connections.

- `started` - The transport is listening for client connections and may have
  active connections.

- `stopping` - The transport is in the process of closing client connections and
  is stopping listening for new connections.

Transport objects must only change state in the following circumstances:

1. When `stopped` and an outside call to `start()` is received, the transport
   state must become `starting`.

2. When `starting` and the transport successfully begins listening for client
   connections, the transport state must become `started`.

3. When `starting` and the transport fails to begin listening for client
   connections , the transport state must become `stopping`.

4. When `started` and a call to `stop()` is received, the transport state must
   become `stopping`.

5. When `started` and an unexpected internal transport failure occurs, the
   transport state must become `stopping`.

6. When `stopping` and the transport has stopped listening for new connections
   and has isconnected all previously-connected clients, the transport state
   must become `stopped`.

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
  `started` and the `started` event must be emitted.

  If the transport fails to start, the transport state must become `stopping`
  and then `stopped` and the `stopping` and `stopped` events must be emitted
  sequentially.

- `transport.stop()`

  Allows the server to tell the transport to stop accepting new connections and
  begin terminating existing connections. Returns nothing.

  The transport state must become `stopping` and the `stopping` event must be
  emitted synchronously. The transport state must subsequently become `stopped`
  and the `stopped` even must be emitted.

- `transport.clientState(clientId)`

  Allows the server to retrieve the connection state for a given client.

  Returns `"connected"` or `"disconnected"`.

  The server will only call this method if the transport state is `started`.

- `transport.clients()`

  Allows the server to retrieve a list of connected clients.

  Returns an array of client ids.

  The server will only call this method if the transport state is `started`.

- `transport.send(clientId, msg)`

  Allows the server to send a string message to a client. Returns nothing.

  The server will only call this method if the transport state is `started` and
  will only reference `clientId`s that are `connected`.

- `transport.disconnect(clientId)`

  Allows the server to forcibly terminate a client's transport connection.
  Returns nothing.

  The server will only call this method if the transport state is `started` and
  will only reference `clientId`s that are `connected`.

### Transport Events

Transport objects must emit an event when they change state, when a client
connects or disconnects, and when a message has been received from a connected
client.

- `starting`

  Informs the server that the transport state is now `starting`. This event must
  only be emitted when the transport state was previously `stopped`.

- `started`

  Informs the server that the transport state is now `started`. This event must
  only be emitted when the transport state was previously `starting`.

- `stopping([err])`

  Informs the server that the transport state is now `stopping`. This event must
  only be emitted when the transport state was previously `starting` or
  `started`.

  If the stoppage resulted from an explicit server call to `stop()` then the
  transport must not pass an error object to the listeners. The transport must
  not pass `null`, `undefined`, `false`, or any other value in place of the
  error object.

  If the stoppage resulted from a failure to start the transport after a call to
  `start()` or from an internal failure once `started`, then an error of the
  form `new Error("FAILURE: Descriptive error message.")` must be must be passed
  to the listeners.

- `stopped([err])`

  Informs the server that the transport state is now `stopped`. This event must
  only be emitted when the transport state was previously `stopping`.

  If the stoppage resulted from an explicit server call to `stop()` then the
  transport must not pass an error object to the listeners. The transport must
  not pass `null`, `undefined`, `false`, or any other value in place of the
  error object.

  If the stoppage resulted from a failure to start the transport after a call to
  `start()` or from an internal failure once `started`, then an error of the
  form `new Error("FAILURE: Descriptive error message.")` must be must be passed
  to the listeners.

- `connect(clientId)`

  Informs the server that a new client has connected `connected` and that the
  client has been assigned a string identifier of `clientId`. This event must
  only be emitted when the transport state is `started`.

- `message(clientId, msg)`

  Informs the server that a string message has been received from client
  `clientId`.

  This event must only be emitted when the transport state is `started`. A
  previous `connect` event must have been emitted referencing the given
  `clientId`.

- `disconnect(clientId, [err])`

  Informs the server that `clientId` has disconnected.

  This event must only be emitted when the transport state is `started`. A
  previous `connect` event must have been emitted referencing the given
  `clientId`.

  Once this event has been emitted, the transport must emit no further `message`
  or `disconnect` events referencing `clientId`.

  If the disconnect resulted from an explicit outside call to `disconnect()`
  then the transport must not pass an error object the listeners. The transport
  must not pass `null`, `undefined`, `false`, or any other value in place of the
  error object.

  If the event resulted from a connection failure internal to the transport,
  including an intentional client-side disconnect, then an error of the form
  `new Error("DISCONNECTED: Descriptive error message.")` must be must be passed
  to the listeners.
