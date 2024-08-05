// src/types/express-ws.d.ts
import type * as express from "express";
import type * as core from "express-serve-static-core";
import type * as http from "http";
import type * as https from "https";
import type * as ws from "ws";

declare module "@soumame/express-ws" {
  function expressWs(
    app: express.Application,
    server?: http.Server | https.Server,
    options?: expressWs.Options
  ): expressWs.Instance;

  namespace expressWs {
    type Application = express.Application & WithWebsocketMethod;
    type Router = express.Router & WithWebsocketMethod;

    interface Options {
      leaveRouterUntouched?: boolean | undefined;
      wsOptions?: ws.ServerOptions | undefined;
    }

    interface RouterLike {
      get: express.IRouterMatcher<this>;
      [key: string]: any;
      [key: number]: any;
    }

    interface Instance {
      app: Application;
      applyTo(target: RouterLike): void;
      getWss(): ws.Server;
    }

    type WebsocketRequestHandler = (
      ws: ws,
      req: express.Request,
      next: express.NextFunction
    ) => void;
    type WebsocketMethod<T> = (
      route: core.PathParams,
      ...middlewares: WebsocketRequestHandler[]
    ) => T;

    interface WithWebsocketMethod {
      ws: WebsocketMethod<this>;
    }
  }

  export = expressWs;
}

declare module "express" {
  interface Router extends expressWs.Router {}
}
