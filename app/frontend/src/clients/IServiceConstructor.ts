import { IRpc } from "./IRpc";

interface IServiceConstructor<T> {
  new (rpcImpl: IRpc): T;
}

export { IServiceConstructor };
