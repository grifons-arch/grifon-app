import { randomUUID } from "crypto";
import pinoHttp from "pino-http";

export const requestLogger = pinoHttp({
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const id = typeof existing === "string" ? existing : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  redact: {
    paths: ["req.headers.authorization", "req.body.passwd"],
    remove: true
  }
});
