import check from "check-types";
import jsonExpressible from "json-expressible";

/**
 * Represents an ActionResponse message.
 * @typedef {Object} ActionResponse
 */

const proto = {};

/**
 * Factory function.
 * @param {Server} server
 * @param {ActionRequest} areq
 * @returns {ActionResponse}
 */
export default function actionResponseFactory(server, areq) {
  const actionResponse = Object.create(proto);

  /**
   * Reference to the server. Null after a call to success(),
   * failure(), or _neutralize().
   * @memberof ActionResponse
   * @instance
   * @private
   * @type {?Server}
   */
  actionResponse._server = server;

  /**
   * Reference to the associated ActionRequest object.
   * @memberof ActionResponse
   * @instance
   * @private
   * @type {ActionRequest}
   */
  actionResponse._actionRequest = areq;

  /**
   * Flag indicating whether the application already responded.
   * @memberof ActionResponse
   * @instance
   * @private
   * @type {bool}
   */
  actionResponse._appResponded = false;

  /**
   * Flag indicating whether the server has neutralized this object.
   * @memberof ActionResponse
   * @instance
   * @private
   * @type {bool}
   */
  actionResponse._neutralized = false;

  return actionResponse;
}

/**
 * Called by the application to return a successful ActionResponse.
 *
 * After being neutralized, the first call to success() or failure() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof ActionResponse
 * @instance
 * @param {Object} actionData
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto.success = function success(actionData) {
  // Check action data type
  if (!check.object(actionData)) {
    throw new Error("INVALID_ARGUMENT: Invalid action data.");
  }

  // Check that action data is JSON-expressible
  if (!jsonExpressible(actionData)) {
    throw new Error("INVALID_ARGUMENT: Action data is not JSON-expressible.");
  }

  // Throw if the app already responded
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The success() or failure() method has already been called.",
    );
  }

  // Update state to reflect app response
  this._appResponded = true;
  const s = this._server;
  this._server = null;

  // If not neutralized, call the server function
  if (!this._neutralized) {
    s._appActionSuccess(
      this._actionRequest.clientId,
      this._actionRequest._actionCallbackId,
      actionData,
    );
  }
};

/**
 * Called by the application to return an ActionResponse indicating failure.
 *
 * After being neutralized, the first call to success() or failure() will
 * still return successfully, but will do nothing. Subsequent calls will
 * throw ALREADY_RESPONDED.
 * @memberof ActionResponse
 * @instance
 * @param {String} errorCode
 * @param {Object} errorData
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto.failure = function failure(errorCode, errorData) {
  // Check error code - empty is spec-valid
  if (!check.string(errorCode)) {
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
      "ALREADY_RESPONDED: The success() or failure() method has already been called.",
    );
  }

  // Update state to reflect app response
  this._appResponded = true;
  const s = this._server;
  this._server = null;

  // If not neutralized, call the server function
  if (!this._neutralized) {
    s._appActionFailure(
      this._actionRequest.clientId,
      this._actionRequest._actionCallbackId,
      errorCode,
      errorData,
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
 * @memberof ActionResponse
 * @instance
 * @throws {Error} "ALREADY_NEUTRALIZED: ..."
 * @throws {Error} "ALREADY_RESPONDED: ..."
 */
proto._neutralize = function _neutralize() {
  // Throw if the app already responded - bad server behavior
  if (this._appResponded) {
    throw new Error(
      "ALREADY_RESPONDED: The success() or failure() method has already been called.",
    );
  }

  // Throw if already neutralized - bad server behavior
  if (this._neutralized) {
    throw new Error(
      "ALREADY_NEUTRALIZED: The object has already been neutralized.",
    );
  }

  // Update state to reflect the neutralization
  this._neutralized = true;
  this._server = null;
};
