/**
 * Emitted with the handshake event, enabling the application to indicate when
 * the library should respond to a Handshake message.
 * @typedef {Object} HandshakeResponse
 */

const proto = {};

/**
 * Factory function. Assume valid args.
 * @param {Server} server
 * @param {HandshakeRequest} hreq
 * @returns {HandshakeResponse}
 */
export default function handshakeResponseFactory(server, hreq) {
  const handshakeResponse = Object.create(proto);

  /**
   * Reference to the server. Null after a call to handshakeResponse.success()
   * or handshakeResponse._neutralize().
   * @memberof HandshakeResponse
   * @instance
   * @private
   * @type {?Server}
   */
  handshakeResponse._server = server;

  /**
   * Reference to the associated HandshakeRequest object.
   * @memberof HandshakeResponse
   * @instance
   * @private
   * @type {HandshakeRequest}
   */
  handshakeResponse._handshakeRequest = hreq;

  /**
   * Flag indicating whether the application already responded.
   * @memberof HandshakeResponse
   * @instance
   * @private
   * @type {bool}
   */
  handshakeResponse._appResponded = false;

  /**
   * Flag indicating whether the server has neutralized this object.
   * @memberof HandshakeResponse
   * @instance
   * @private
   * @type {bool}
   */
  handshakeResponse._neutralized = false;

  return handshakeResponse;
}

/**
 * Called by the application to return a successful HandshakeResponse.
 *
 * After being neutralized, the first call to handshakeResponse.success() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof HandshakeResponse
 * @instance
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto.success = function success() {
  // Throw if the app already responded
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The handshakeResponse.success() method has already been called."
    );
  }

  // Update state to reflect app response (save server reference)
  this._appResponded = true;
  const s = this._server;
  this._server = null;

  // If not neutralized, call the server function and neutralize
  if (!this._neutralized) {
    s._appHandshakeSuccess(this._handshakeRequest.clientId);
  }
};

/**
 * Called by the server to neutralize the object.
 *
 * The server is not intended to call this method more than once, and is
 * not intended to call it after the application has called success(), so
 * both of those behaviors throw errors - indicates unintended server
 * behavior.
 *
 * After being neutralized, the first call to handshakeResponse.success() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof HandshakeResponse
 * @instance
 * @throws {Error} "ALREADY_NEUTRALIZED: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto._neutralize = function _neutralize() {
  // Throw if the app already responded - bad server behavior
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The handshakeResponse.success() method has already been called."
    );
  }

  // Throw if already neutralized - bad server behavior
  if (this._neutralized) {
    throw new Error(
      "ALREADY_NEUTRALIZED: The object has already been neutralized."
    );
  }

  // Update state to reflect the neutralization
  this._neutralized = true;
  this._server = null;
};
