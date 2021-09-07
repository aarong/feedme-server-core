import FeedNameArgs from "feedme-util/feednameargs";
import feedCloseRequest from "../feedcloserequest";

describe("The feedCloseRequest() factory function", () => {
  it("should return an object", () => {
    const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
    expect(feedCloseRequest("client1", feedNameArgs)).toEqual({
      clientId: "client1",
      feedName: "some_feed",
      feedArgs: { feed: "arg" },
      _feedNameArgs: feedNameArgs
    });
  });
});
