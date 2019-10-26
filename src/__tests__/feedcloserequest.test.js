import feedCloseRequest from "../feedcloserequest";

describe("The feedCloseRequest() factory function", () => {
  it("should return an object", () => {
    expect(feedCloseRequest("client1", "someFeed", { feed: "arg" })).toEqual({
      clientId: "client1",
      feedName: "someFeed",
      feedArgs: { feed: "arg" }
    });
  });
});
