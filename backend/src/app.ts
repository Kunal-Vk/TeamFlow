import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import {env} from "./config/env";
import authRoutes from "./modules/auth/routes/auth.routes";


const app= express();

//Security header
app.use(helmet());

//Cross origin requests
app.use(cors({
    origin:env.CORS_ORIGIN
    })
);
//Body parser
app.use(express.json());

//Logger
app.use(morgan("dev"));

//Health check
app.get("/",(_req,res)=>{
    res.status(200).json({
        success:true,
        message:"Welcom",
    });
});

app.use("/api/auth", authRoutes);

export default app;