import { host, port } from "../config";

interface IRpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

interface IServiceConstructor<T> {
  new (rpcImpl: IRpc): T;
}

type RpcImplOptions = {
  host: string;
  port: number;
  type: "protobuf" | "json";
};

function createRpcImpl(options: RpcImplOptions): IRpc {
  return {
    request: async (service, method, data) => {
      const isProtobuf = options.type === "protobuf";

      const response = await fetch(
        `${options.host}:${options.port}/twirp/${service}/${method}`,
        {
          method: "POST",
          body: data,
          headers: {
            "Content-Type": isProtobuf
              ? "application/protobuf"
              : "application/json"
          }
        }
      );

      if (!response.ok) {
        // TODO: Handle Twirp JSON errors
        throw Error(response.statusText);
      }

      return isProtobuf
        ? new Uint8Array(await response.arrayBuffer())
        : await response.json();
    }
  };
}

export function createTwirpClient<T>(
  service: IServiceConstructor<T>,
  type: "protobuf" | "json"
): T {
  return new service(
    createRpcImpl({
      host,
      port,
      type
    })
  );
}
