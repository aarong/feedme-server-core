/**
 * Represents a FeedClose message.
 * @typedef {Object} FeedCloseRequest
 */

/**
 * Factory function.
 * @param {String} clientId
 * @param {FeedNameArgs} feedNameArgs
 * @param {Object} feedArgs
 * @returns {FeedCloseRequest}
 */
export default function feedCloseRequestFactory(clientId, feedNameArgs) {
  const feedCloseRequest = {};

  /**
   * Client id associated with the request.
   * @memberof FeedCloseRequest
   * @instance
   * @type {String}
   */
  feedCloseRequest.clientId = clientId;

  /**
   * Feed name, arguments, serial.
   * @memberof FeedCloseRequest
   * @instance
   * @private
   * @type {FeedNameArgs}
   */
  feedCloseRequest._feedNameArgs = feedNameArgs;

  /**
   * Name of the feed being closed.
   * @memberof FeedCloseRequest
   * @instance
   * @type {String}
   */
  feedCloseRequest.feedName = feedNameArgs.name();

  /**
   * Arguments for the feed being closed.
   * @memberof FeedCloseRequest
   * @instance
   * @type {Object}
   */
  feedCloseRequest.feedArgs = feedNameArgs.args();

  return feedCloseRequest;
}
