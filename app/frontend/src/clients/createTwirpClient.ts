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
      const url = `${options.host}:${options.port}/twirp/${service}/${method}`;
      const isProtobuf = options.type === "protobuf";

      const body = data;

      // if (!isProtobuf) {
      //   const message = (method as Method).resolvedRequestType?.decode(
      //     requestData
      //   );
      //   console.log("METHOD", method);
      //   console.log("REQUEST TYPE", (method as Method).resolvedRequestType);
      //   if (message) {
      //     body = JSON.stringify(message.toJSON());
      //   }
      // }

      const response = await fetch(url, {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": isProtobuf
            ? "application/protobuf"
            : "application/json"
        }
      });

      if (!response.ok) {
        throw Error(response.statusText); // TODO: JSON
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
