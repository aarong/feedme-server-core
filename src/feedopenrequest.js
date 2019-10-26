/**
 * Represents a client feed open request.
 * @typedef {Object} FeedOpenRequest
 */

/**
 * Factory function. Assumes valid args.
 * @param {String} clientId
 * @param {String} feedName
 * @param {Object} feedArgs
 * @returns {FeedOpenRequest}
 */
export default function feedOpenRequestFactory(clientId, feedName, feedArgs) {
  return {
    clientId,
    feedName,
    feedArgs
  };
}
