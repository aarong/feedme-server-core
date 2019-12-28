/**
 * Represents a Handshake message.
 * @typedef {Object} HandshakeRequest
 */

/**
 * Factory function.
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
