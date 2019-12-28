/**
 * Represents an Action message.
 * @typedef {Object} ActionRequest
 */

/**
 * Factory function.
 * @param {string} clientId
 * @param {string} actionCallbackId
 * @param {string} actionName
 * @param {Object} actionArgs
 * @returns {ActionRequest}
 */
export default function actionRequestFactory(
  clientId,
  actionCallbackId,
  actionName,
  actionArgs
) {
  const actionRequest = {};

  /**
   * Client id associated with the request.
   * @memberof ActionRequest
   * @instance
   * @type {string}
   */
  actionRequest.clientId = clientId;

  /**
   * Client callback id.
   * @memberof ActionRequest
   * @instance
   * @private
   * @type {string}
   */
  actionRequest._actionCallbackId = actionCallbackId;

  /**
   * Name of the action being invoked.
   * @memberof ActionRequest
   * @instance
   * @type {string}
   */
  actionRequest.actionName = actionName;

  /**
   * Arguments for the action being invoked.
   * @memberof ActionRequest
   * @instance
   * @type {Object}
   */
  actionRequest.actionArgs = actionArgs;

  return actionRequest;
}
