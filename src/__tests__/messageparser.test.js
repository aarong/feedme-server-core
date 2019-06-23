import messageParser from "../messageparser";

// It's taken as given that the spec's JSON Schemas are correct

describe("The messageParser.parse() function", () => {
  it("should throw on invalid JSON", () => {
    expect(() => {
      messageParser.parse("junk");
    }).toThrow(new Error("INVALID_MESSAGE: Invalid JSON."));
  });

  it("should throw on non-object JSON", () => {
    expect(() => {
      messageParser.parse('"a string"');
    }).toThrow(new Error("INVALID_MESSAGE: Not an object."));
  });

  it("should throw on missing MessageType", () => {
    expect(() => {
      messageParser.parse("{}");
    }).toThrow(new Error("INVALID_MESSAGE: Invalid message type."));
  });

  it("should throw on invalid MessageType", () => {
    expect(() => {
      messageParser.parse('{"MessageType": "junk"}');
    }).toThrow(new Error("INVALID_MESSAGE: Invalid message type."));
  });

  it("should throw on message schema violation", () => {
    expect(() => {
      messageParser.parse('{"MessageType":"Handshake"}');
    }).toThrow(new Error("INVALID_MESSAGE: Message schema validation failed."));
  });

  it("should return message object if valid", () => {
    expect(
      messageParser.parse('{"MessageType":"Handshake", "Versions": ["0.1"]}')
    ).toEqual(JSON.parse('{"MessageType":"Handshake", "Versions": ["0.1"]}'));
  });
});
