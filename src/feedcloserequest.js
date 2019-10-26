/**
 * Represents a client feed close request.
 * @typedef {Object} FeedCloseRequest
 */

/**
 * Factory function. Assumes valid args.
 * @param {String} clientId
 * @param {String} feedName
 * @param {Object} feedArgs
 * @returns {FeedCloseRequest}
 */
export default function feedCloseRequestFactory(clientId, feedName, feedArgs) {
  const feedCloseRequest = {};

  /**
   * Client id associated with the request.
   * @memberof FeedCloseRequest
   * @instance
   * @type {String}
   */
  feedCloseRequest.clientId = clientId;

  /**
   * Name of the feed being closed.
   * @memberof FeedCloseRequest
   * @instance
   * @type {String}
   */
  feedCloseRequest.feedName = feedName;

  /**
   * Arguments for the feed being closed.
   * @memberof FeedCloseRequest
   * @instance
   * @type {Object}
   */
  feedCloseRequest.feedArgs = feedArgs;

  return feedCloseRequest;
}
