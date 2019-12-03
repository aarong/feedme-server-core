import main from "../main";

describe("The main() factory function", () => {
  it("should throw on missing options argument", () => {
    expect(() => {
      main();
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
  });

  it("should throw on invalid options argument", () => {
    expect(() => {
      main("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
  });

  it("should throw on missing options.transport", () => {
    expect(() => {
      main({});
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.transport."));
  });

  it("should throw on invalid options.transport", () => {
    expect(() => {
      main({ transport: "junk" });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.transport."));
  });

  it("should return an object on success", () => {
    expect(
      main({
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
