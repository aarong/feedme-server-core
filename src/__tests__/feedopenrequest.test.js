import feedOpenRequest from "../feedopenrequest";

describe("The feedOpenRequest() factory function", () => {
  it("should return an object", () => {
    expect(feedOpenRequest("client1", "someFeed", { feed: "arg" })).toEqual({
      clientId: "client1",
      feedName: "someFeed",
      feedArgs: { feed: "arg" }
    });
  });
});
