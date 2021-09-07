/**
 * Represents a Handshake message.
 * @typedef {Object} HandshakeRequest
 */

/**
 * Factory function.
 * @param {String} clientId
 * @returns {HandshakeRequest}
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
