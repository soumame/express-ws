import * as express from "express";
import * as core from "express-serve-static-core";
import wrapMiddleware from "./wrap-middleware";
import websocketUrl from "./websocket-url";

export default function addWsMethod(target: expressWs.RouterLike): void {
  /* This prevents conflict with other things setting `.ws`. */
  if (target.ws === null || target.ws === undefined) {
    target.ws = function addWsRoute(
      route: core.PathParams,
      ...middlewares: expressWs.WebsocketRequestHandler[]
    ): expressWs.RouterLike {
      const wrappedMiddlewares = middlewares.map(wrapMiddleware);

      /* We append `/.websocket` to the route path here. Why? To prevent conflicts when
       * a non-WebSocket request is made to the same GET route - after all, we are only
       * interested in handling WebSocket requests.
       *
       * Whereas the original `express-ws` prefixed this path segment, we suffix it -
       * this makes it possible to let requests propagate through Routers like normal,
       * which allows us to specify WebSocket routes on Routers as well \o/! */
      const wsRoute = websocketUrl(route.toString() as any);

      /* Here we configure our new GET route. It will never get called by a client
       * directly, it's just to let our request propagate internally, so that we can
       * leave the regular middleware execution and error handling to Express. */
      (this as any).get(...[wsRoute, ...wrappedMiddlewares.map(String)]);

      /*
       * Return `this` to allow for chaining:
       */
      return this;
    };
  }
}

// 必要に応じて、expressWs名前空間を再宣言します
declare namespace expressWs {
  interface RouterLike {
    get: express.IRouterMatcher<any>;
    ws?: WebsocketMethod<this>;
    [key: string]: any;
    [key: number]: any;
  }

  type WebsocketRequestHandler = (
    ws: import("ws"),
    req: express.Request,
    next: express.NextFunction
  ) => void;
  type WebsocketMethod<T> = (
    route: core.PathParams,
    ...middlewares: WebsocketRequestHandler[]
  ) => T;
}
