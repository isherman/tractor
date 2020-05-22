import { IServiceConstructor } from "./IServiceConstructor";
import { createRpcImpl } from "./createRpcImpl";
import { host, port } from "../config";

export function createTwirpClient<T>(
  service: IServiceConstructor<T>,
  path: string, // May be possible to infer this with some reflection magic
  type: "protobuf" | "json"
): T {
  return new service(
    createRpcImpl({
      host,
      port,
      path,
      type
    })
  );
}
