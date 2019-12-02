import feedmeServer from "../build";
// import harness from "./index.harness";

describe("The feedmeServer() factory function", () => {
  it("should throw on missing options argument", () => {
    expect(() => {
      feedmeServer();
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options argument."));
  });

  it("create a harness and use its functions", () => {
    // const harn = harness();
    // harn.createServerListener();
    // harn.makeServerStarted();
    // const cid = harn.makeClient("tcid");
    // const fores = harn.makeFeedOpening("tcid", "opening_feed", {
    //   feed: "args"
    // });
    // harn.makeFeedOpen("tcid", "open_feed", { feed: "args" }, { feed: "data" });
    // const fcres = harn.makeFeedClosing("tcid", "closing_feed", {
    //   feed: "args"
    // });
    // harn.makeFeedTerminated("tcid", "open_feed", { feed: "args" });
  });
});
