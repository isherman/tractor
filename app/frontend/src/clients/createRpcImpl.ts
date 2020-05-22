import { IRpc } from "./IRpc";

type IOptions = {
  host: string;
  port: number;
  path: string;
  type: "protobuf" | "json";
};

// type JsonObject = {
//   [k: string]: unknown;
// };

export const createRpcImpl = function (options: IOptions): IRpc {
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
      const binaryResponse = await response.arrayBuffer();
      console.log("binaryResponse: ", binaryResponse);
      return isProtobuf ? binaryResponse : await response.json();
    }
  };
};
