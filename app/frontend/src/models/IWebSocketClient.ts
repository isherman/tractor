export interface IWebSocketClient {
  on: (event: string, callback: (data: any) => void) => void;
  send: (data: any) => void;
}
