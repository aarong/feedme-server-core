import feedmeServer from "../main";

describe("The feedmeServer() factory function", () => {
  it("should return an object", () => {
    expect(feedmeServer()).toEqual({});
  });
});
