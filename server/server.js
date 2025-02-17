import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { mongoose } from './db.js'; 
import dotenv from "dotenv";
import studentRoutes from "./routes/student.routes.js";
import coursesRouter from "./routes/course.routes.js";

import { initCourses } from "./scripts/course.initiator.js";
import { enrollStudentsInCourses } from "./scripts/student.intiator.js";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();

const port = process.env.PORT || 7100;
 
const app = express();
   
app.use(cors()); 

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static("public", {
  setHeaders: (res, path, stat) => {
    if (path.endsWith(".js") || path.endsWith(".jsx")) {
      res.set("Content-Type", "application/javascript");
    }
  },
}));
 
mongoose;
app.options("*", cors());
 
app.use("/api", studentRoutes)
app.use("/api/course",coursesRouter)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

wait(1000).then( async ()=>{
  await initCourses().then(async()=>{
    wait(1000).then(async()=>{
      await enrollStudentsInCourses() 
    })
  }) 
})
   