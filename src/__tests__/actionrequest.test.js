import actionRequest from "../actionrequest";

describe("The actionRequest() factory function", () => {
  it("should return an object", () => {
    expect(
      actionRequest("client1", "callback_id", "someAction", { action: "arg" }),
    ).toEqual({
      clientId: "client1",
      actionName: "someAction",
      actionArgs: { action: "arg" },
      _actionCallbackId: "callback_id",
    });
  });
});
