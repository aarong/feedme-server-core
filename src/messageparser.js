import Ajv from "ajv";
import check from "check-types";

/**
Facade over third-party JSON Schema functionality.
Checks message objects for structural compliance with the spec.
*/
const messageParser = {};
export default messageParser;

/**
 * AJV instance.
 * @memberof messageParser
 * @private
 */
messageParser._ajv = new Ajv();

/**
 * AJV compiled message validators.
 * @memberof messageParser
 * @private
 */
messageParser._messageValidators = {
  Handshake: messageParser._ajv.compile(
    JSON.parse(`
      {
        "type": "object",
        "properties": {
          "MessageType": {
            "type": "string",
            "enum": ["Handshake"]
          },
          "Versions": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "string"
            }
          }
        },
        "required": ["MessageType", "Versions"],
        "additionalProperties": false
      }
    `)
  ),
  Action: messageParser._ajv.compile(
    JSON.parse(`
      {
        "type": "object",
        "properties": {
          "MessageType": {
            "type": "string",
            "enum": ["Action"]
          },
          "ActionName": {
            "type": "string",
            "minLength": 1
          },
          "ActionArgs": {
            "type": "object"
          },
          "CallbackId": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": ["MessageType", "ActionName", "ActionArgs", "CallbackId"],
        "additionalProperties": false
      }
    `)
  ),
  FeedOpen: messageParser._ajv.compile(
    JSON.parse(`
      {
        "type": "object",
        "properties": {
          "MessageType": {
            "type": "string",
            "enum": ["FeedOpen"]
          },
          "FeedName": {
            "type": "string",
            "minLength": 1
          },
          "FeedArgs": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          }
        },
        "required": ["MessageType", "FeedName", "FeedArgs"],
        "additionalProperties": false
      }
    `)
  ),
  FeedClose: messageParser._ajv.compile(
    JSON.parse(`
      {
        "type": "object",
        "properties": {
          "MessageType": {
            "type": "string",
            "enum": ["FeedClose"]
          },
          "FeedName": {
            "type": "string",
            "minLength": 1
          },
          "FeedArgs": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          }
        },
        "required": ["MessageType", "FeedName", "FeedArgs"],
        "additionalProperties": false
      }
    `)
  )
};

/**
 * Validate an inbound message string and return a message object.
 * @param {string} message An inbound message string.
 * @returns {Object} A structurally valid message object.
 * @throws {Error} "INVALID_MESSAGE: ..."
 */
messageParser.parse = function parse(message) {
  // Valid JSON?
  let obj;
  try {
    obj = JSON.parse(message);
  } catch (e) {
    throw new Error("INVALID_MESSAGE: Invalid JSON.");
  }

  // Object?
  if (!check.object(obj)) {
    throw new Error("INVALID_MESSAGE: Not an object.");
  }

  // Valid MessageType?
  if (
    obj.MessageType !== "Handshake" &&
    obj.MessageType !== "Action" &&
    obj.MessageType !== "FeedOpen" &&
    obj.MessageType !== "FeedClose"
  ) {
    throw new Error("INVALID_MESSAGE: Invalid message type.");
  }

  // Valid against the schema for this message type?
  const msgValidator = messageParser._messageValidators[obj.MessageType];
  if (!msgValidator(obj)) {
    throw new Error("INVALID_MESSAGE: Message schema validation failed.");
  }

  // Valid
  return obj;
};
