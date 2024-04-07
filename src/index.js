import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import { app } from "./app.js";

dotenv.config({ path: "./env" });

connectDB().then(() => {
   app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
   })
}).catch((error) => {
   console.error(`MONGODB Failed to connect for ${error}`);
   process.exit(1);
});