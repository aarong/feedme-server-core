/**
 * Represents a FeedCloseResponse message.
 * @typedef {Object} FeedCloseResponse
 */

const proto = {};

/**
 * Factory function.
 * @param {Server} server
 * @param {FeedCloseRequest} fcreq
 * @returns {FeedCloseResponse}
 */
export default function feedCloseResponseFactory(server, fcreq) {
  const feedCloseResponse = Object.create(proto);

  /**
   * Reference to the server. Null after a call to success()
   * or _neutralize().
   * @memberof FeedCloseResponse
   * @instance
   * @private
   * @type {?Server}
   */
  feedCloseResponse._server = server;

  /**
   * Reference to the associated FeedCloseRequest object.
   * @memberof FeedCloseResponse
   * @instance
   * @private
   * @type {FeedCloseRequest}
   */
  feedCloseResponse._feedCloseRequest = fcreq;

  /**
   * Flag indicating whether the application already responded.
   * @memberof FeedCloseResponse
   * @instance
   * @private
   * @type {bool}
   */
  feedCloseResponse._appResponded = false;

  /**
   * Flag indicating whether the server has neutralized this object.
   * @memberof FeedCloseResponse
   * @instance
   * @private
   * @type {bool}
   */
  feedCloseResponse._neutralized = false;

  return feedCloseResponse;
}

/**
 * Called by the application to return a successful FeedCloseResponse.
 *
 * After being neutralized, the first call to feedCloseResponse.success() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof FeedCloseResponse
 * @instance
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto.success = function success() {
  // Throw if the app already responded
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The success() method has already been called."
    );
  }

  // Update state to reflect app response
  this._appResponded = true;
  const s = this._server;
  this._server = null;

  // If not neutralized, call the server function
  if (!this._neutralized) {
    s._appFeedCloseSuccess(
      this._feedCloseRequest.clientId,
      this._feedCloseRequest.feedName,
      this._feedCloseRequest.feedArgs
    );
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
 * After being neutralized, the first call to feedCloseResponse.success() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof FeedCloseResponse
 * @instance
 * @throws {Error} "ALREADY_NEUTRALIZED: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto._neutralize = function _neutralize() {
  // Throw if the app already responded - bad server behavior
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The success() method has already been called."
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
