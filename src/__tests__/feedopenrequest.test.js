import FeedNameArgs from "feedme-util/feednameargs";
import feedOpenRequest from "../feedopenrequest";

describe("The feedOpenRequest() factory function", () => {
  it("should return an object", () => {
    const feedNameArgs = FeedNameArgs("some_feed", { feed: "arg" });
    expect(feedOpenRequest("client1", feedNameArgs)).toEqual({
      clientId: "client1",
      feedName: "some_feed",
      feedArgs: { feed: "arg" },
      _feedNameArgs: feedNameArgs,
    });
  });
});
