/**
 * Represents FeedOpen message.
 * @typedef {Object} FeedOpenRequest
 */

/**
 * Factory function.
 * @param {String} clientId
 * @param {String} feedName
 * @param {Object} feedArgs
 * @returns {FeedOpenRequest}
 */
export default function feedOpenRequestFactory(clientId, feedName, feedArgs) {
  const feedOpenRequest = {};

  /**
   * Client id associated with the request.
   * @memberof FeedOpenRequest
   * @instance
   * @type {String}
   */
  feedOpenRequest.clientId = clientId;

  /**
   * Name of the feed being opened.
   * @memberof FeedOpenRequest
   * @instance
   * @type {String}
   */
  feedOpenRequest.feedName = feedName;

  /**
   * Arguments for the feed being opened.
   * @memberof FeedOpenRequest
   * @instance
   * @type {Object}
   */
  feedOpenRequest.feedArgs = feedArgs;

  return feedOpenRequest;
}
