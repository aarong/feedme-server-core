/**
 * Represents a client handshake request.
 * @typedef {Object} HandshakeRequest
 */

/**
 * Factory function. Assumes valid args.
 * @param {String} clientId
 * @param {String} feedName
 * @param {Object} feedArgs
 * @returns {FeedCloseRequest}
 */
export default function handshakeRequestFactory(clientId) {
  const handshakeRequest = {};

  /**
   * Client id associated with the request.
   * @memberof HandshakeRequest
   * @instance
   * @type {String}
   */
  handshakeRequest.clientId = clientId;

  return handshakeRequest;
}
