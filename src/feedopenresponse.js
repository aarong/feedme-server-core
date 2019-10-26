import check from "check-types";
import jsonExpressible from "json-expressible";

/**
 * Emitted with the feedOpen event, enabling the application to indicate how
 * the library should respond to a FeedOpen message.
 * @typedef {Object} FeedOpenResponse
 */

const proto = {};

/**
 * Factory function. Assume valid args.
 * @param {Server} server
 * @param {FeedOpenRequest} foreq
 * @returns {FeedOpenResponse}
 */
export default function feedOpenResponseFactory(server, foreq) {
  const feedOpenResponse = Object.create(proto);

  /**
   * Reference to the server. Null after a call to feedOpenResponse.success(),
   * feedOpenResponse.failure(), or feedOpenResponse._neutralize().
   * @memberof FeedOpenResponse
   * @instance
   * @private
   * @type {?Server}
   */
  feedOpenResponse._server = server;

  /**
   * Reference to the associated FeedOpenRequest object.
   * @memberof FeedOpenResponse
   * @instance
   * @private
   * @type {FeedOpenRequest}
   */
  feedOpenResponse._feedOpenRequest = foreq;

  /**
   * Flag indicating whether the application already responded.
   * @memberof FeedOpenResponse
   * @instance
   * @private
   * @type {bool}
   */
  feedOpenResponse._appResponded = false;

  /**
   * Flag indicating whether the server has neutralized this object.
   * @memberof FeedOpenResponse
   * @instance
   * @private
   * @type {bool}
   */
  feedOpenResponse._neutralized = false;

  return feedOpenResponse;
}

/**
 * Called by the application to return a successful FeedOpenResponse.
 *
 * After being neutralized, the first call to success() or failure() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof FeedOpenResponse
 * @instance
 * @param {Object} feedData
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto.success = function success(feedData) {
  // Check feed data type
  if (!check.object(feedData)) {
    throw new Error("INVALID_ARGUMENT: Invalid feed data.");
  }

  // Check feed data is JSON-expressible
  if (!jsonExpressible(feedData)) {
    throw new Error("INVALID_ARGUMENT: Feed data is not JSON-expressible.");
  }

  // Throw if the app already responded
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The feedOpenResponse.success() or feedOpenResponse.failure() method has already been called."
    );
  }

  // Update state to reflect app response (save server reference)
  this._appResponded = true;
  const s = this._server;
  this._server = null;

  // If not neutralized, call the server function and neutralize
  if (!this._neutralized) {
    s._appFeedOpenSuccess(
      this._feedOpenRequest.clientId,
      this._feedOpenRequest.feedName,
      this._feedOpenRequest.feedArgs,
      feedData
    );
  }
};

/**
 * Called by the application to return a FeedOpenResponse indicating failure.
 *
 * After being neutralized, the first call to success() or failure() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof FeedOpenResponse
 * @instance
 * @param {String} errorCode
 * @param {Object} errorData
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto.failure = function failure(errorCode, errorData) {
  // Check error code
  if (!check.nonEmptyString(errorCode)) {
    throw new Error("INVALID_ARGUMENT: Invalid error code.");
  }

  // Check error data type
  if (!check.object(errorData)) {
    throw new Error("INVALID_ARGUMENT: Invalid error data.");
  }

  // Check error data is JSON-expressible
  if (!jsonExpressible(errorData)) {
    throw new Error("INVALID_ARGUMENT: Error data is not JSON-expressible.");
  }

  // Throw if the app already responded
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The feedOpenResponse.success() or feedOpenResponse.failure() method has already been called."
    );
  }

  // Update state to reflect app response (save server reference)
  this._appResponded = true;
  const s = this._server;
  this._server = null;

  // If not neutralized, call the server function and neutralize
  if (!this._neutralized) {
    s._appFeedOpenFailure(
      this._feedOpenRequest.clientId,
      this._feedOpenRequest.feedName,
      this._feedOpenRequest.feedArgs,
      errorCode,
      errorData
    );
  }
};

/**
 * Called by the server to neutralize the object.
 *
 * The server is not intended to call this method more than once, and is
 * not intended to call it after the application has called success() or
 * failure(), so both of those behaviors throw errors - indicates unintended
 * server behavior.
 *
 * After being neutralized, the first call to success() or failure() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof FeedOpenResponse
 * @instance
 * @throws {Error} "ALREADY_NEUTRALIZED: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto._neutralize = function _neutralize() {
  // Throw if the app already responded - bad server behavior
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The feedOpenResponse.success() or feedOpenResponse.failure() method has already been called."
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
