import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { APP_BASE_RUN_MSG } from "./constants/message";
import { APP_PORT } from "./constants/envKeys";
import { API_ROUTE } from "./constants/routeName";
import routes from "./routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(`/${API_ROUTE}`, routes);

app.get("/", (req: Request, res: Response) => {
  res.send(APP_BASE_RUN_MSG);
});

app.listen(APP_PORT, () => console.log(APP_BASE_RUN_MSG));
