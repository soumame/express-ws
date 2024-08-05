import * as http from "http";
import * as express from "express";
import * as ws from "ws";
import * as core from "express-serve-static-core";

import websocketUrl from "./websocket-url";
import addWsMethod from "./add-ws-method";

function expressWs(
  app: express.Application,
  httpServer?: http.Server,
  options: expressWs.Options = {}
): expressWs.Instance {
  let server = httpServer;

  if (server === null || server === undefined) {
    server = http.createServer(app);

    (app as any).listen = function serverListen(...args: any[]): http.Server {
      return server!.listen(...args);
    };
  }

  addWsMethod(app as expressWs.RouterLike);

  if (!options.leaveRouterUntouched) {
    addWsMethod(app as expressWs.RouterLike);
  }

  const wsOptions: ws.ServerOptions = options.wsOptions || {};
  wsOptions.server = server;
  const wsServer = new ws.Server(wsOptions);

  wsServer.on("connection", (socket: ws, request: express.Request) => {
    if ("upgradeReq" in socket) {
      request = (socket as any).upgradeReq;
    }

    (request as any).ws = socket;
    (request as any).wsHandled = false;

    request.url = websocketUrl(request.url as any);

    const dummyResponse = new http.ServerResponse(request);

    dummyResponse.writeHead = function writeHead(
      statusCode: number
    ): http.ServerResponse {
      if (statusCode > 200) {
        (dummyResponse as any)._header = "";
        socket.close();
      }
      return dummyResponse;
    };

    (app as any).handle(request, dummyResponse, () => {
      if (!(request as any).wsHandled) {
        socket.close();
      }
    });
  });

  return {
    app: app as expressWs.Application,
    getWss: function getWss(): ws.Server {
      return wsServer;
    },
    applyTo: function applyTo(router: expressWs.RouterLike) {
      addWsMethod(router);
    },
  };
}

// Add the namespace to match the type declaration
namespace expressWs {
  export interface Options {
    leaveRouterUntouched?: boolean;
    wsOptions?: ws.ServerOptions;
  }

  export interface RouterLike {
    get: express.IRouterMatcher<any>;
    [key: string]: any;
    [key: number]: any;
  }

  export interface Instance {
    app: Application;
    applyTo(target: RouterLike): void;
    getWss(): ws.Server;
  }

  export type Application = express.Application & WithWebsocketMethod;
  export type Router = express.Router & WithWebsocketMethod;

  export type WebsocketRequestHandler = (
    ws: ws,
    req: express.Request,
    next: express.NextFunction
  ) => void;
  export type WebsocketMethod<T> = (
    route: core.PathParams,
    ...middlewares: WebsocketRequestHandler[]
  ) => T;

  export interface WithWebsocketMethod {
    ws: WebsocketMethod<this>;
  }
}

export = expressWs;
