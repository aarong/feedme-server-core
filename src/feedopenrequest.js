/**
 * Represents FeedOpen message.
 * @typedef {Object} FeedOpenRequest
 */

/**
 * Factory function.
 * @param {String} clientId
 * @param {FeedNameArgs} feedNameArgs
 * @returns {FeedOpenRequest}
 */
export default function feedOpenRequestFactory(clientId, feedNameArgs) {
  const feedOpenRequest = {};

  /**
   * Client id associated with the request.
   * @memberof FeedOpenRequest
   * @instance
   * @type {String}
   */
  feedOpenRequest.clientId = clientId;

  /**
   * Feed name, arguments, serial.
   * @memberof FeedOpenRequest
   * @instance
   * @private
   * @type {FeedNameArgs}
   */
  feedOpenRequest._feedNameArgs = feedNameArgs;

  /**
   * Name of the feed being opened.
   * @memberof FeedOpenRequest
   * @instance
   * @type {String}
   */
  feedOpenRequest.feedName = feedNameArgs.name();

  /**
   * Arguments for the feed being opened.
   * @memberof FeedOpenRequest
   * @instance
   * @type {Object}
   */
  feedOpenRequest.feedArgs = feedNameArgs.args();

  return feedOpenRequest;
}
