import express,{Request,Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
const { APP_BASE_RUN_MSG } = require("./constants/message");
const { APP_PORT } = require("./constants/envKeys");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req:Request, res:Response) => {
	res.send(APP_BASE_RUN_MSG);
});

app.listen(APP_PORT, () => console.log(APP_BASE_RUN_MSG));
