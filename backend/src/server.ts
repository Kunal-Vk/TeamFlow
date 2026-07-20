import app from "./app";
import {env} from "./config/env";
import { connectDB } from "./database/db";

async function startServer(){
    await connectDB();


app.listen(env.PORT,()=>{
    console.log(`Teamflow runnong on http://localhost:${env.PORT}`);
});
}
startServer();