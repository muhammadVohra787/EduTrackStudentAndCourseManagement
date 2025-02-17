import express from "express";
const studentRoutes = express.Router();

import { authenticateStudent, isAdmin, getStudentsByCourseCode, signInStudent, getAllStudents, createStudent } from "../controllers/student.controller.js";
studentRoutes.post("/createStudent", createStudent);
studentRoutes.post("/adminCreatingUser", authenticateStudent, isAdmin,createStudent)
studentRoutes.post("/signInStudent",signInStudent)
studentRoutes.post("/getAllStudents", authenticateStudent, isAdmin,getAllStudents);
studentRoutes.post("/getStudentsByCourseCode", authenticateStudent, isAdmin, getStudentsByCourseCode)
export default studentRoutes;

