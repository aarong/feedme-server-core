import feedmeServer from "../build";

describe("The feedmeServer() factory function", () => {
  it("should throw on missing options argument", () => {
    expect(() => {
      feedmeServer();
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
  });
});
