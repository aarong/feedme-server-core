import index from "../index";

describe("The main() factory function", () => {
  it("should throw on missing options argument", () => {
    expect(() => {
      index();
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
  });

  it("should throw on invalid options argument", () => {
    expect(() => {
      index("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
  });

  it("should throw on missing options.transport", () => {
    expect(() => {
      index({});
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.transport."));
  });

  it("should throw on invalid options.transport", () => {
    expect(() => {
      index({ transport: "junk" });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.transport."));
  });

  it("should return an object on success", () => {
    expect(
      index({
        transport: {
          state: () => "stopped",
          start: () => {},
          send: () => {},
          disconnect: () => {},
          stop: () => {},
          on: () => {}
        }
      })
    ).toBeInstanceOf(Object);
  });
});
