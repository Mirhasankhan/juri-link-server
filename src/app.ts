import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import router from "./app/routes";
import sendResponse from "./app/utils/sendResponse";
import bodyParser from "body-parser";
import handleWebHook from "./app/helpers/stripe.webhook";

const app: Application = express();

app.post(
  "/api/v1/stripe/payment-webhook",
  express.raw({ type: "application/json" }),
  handleWebHook
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000", "https://juri-link-frontend.vercel.app"],
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Server is running now",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
