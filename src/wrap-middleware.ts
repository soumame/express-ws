import * as express from "express";
import * as ws from "ws";

export default function wrapMiddleware(
  middleware: expressWs.WebsocketRequestHandler
): express.RequestHandler {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if ((req as any).ws !== null && (req as any).ws !== undefined) {
      (req as any).wsHandled = true;
      try {
        // Unpack the `.ws` property and call the actual handler.
        middleware((req as any).ws, req, next);
      } catch (err) {
        // If an error is thrown, let's send that on to any error handling
        next(err);
      }
    } else {
      // This wasn't a WebSocket request, so skip this middleware.
      next();
    }
  };
}

// 必要に応じて、expressWs名前空間を再宣言します
declare namespace expressWs {
  type WebsocketRequestHandler = (
    ws: ws,
    req: express.Request,
    next: express.NextFunction
  ) => void;
}
