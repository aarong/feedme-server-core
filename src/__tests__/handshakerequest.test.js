import handshakeRequest from "../handshakerequest";

describe("The handshakeRequest() factory function", () => {
  it("should return an object", () => {
    expect(handshakeRequest("client1")).toEqual({
      clientId: "client1",
    });
  });
});
