// server/routes/course.routes.js
import express from 'express';
import {removeStudentFromCourse, getCoursesByStudentId, extractUniqueCourses, enrollStudent, updateStudentsSection } from '../controllers/course.controller.js';
import { authenticateStudent } from '../controllers/student.controller.js';
const coursesRouter = express.Router();

// CRUD Routes for Courses
coursesRouter.post("/enroll", authenticateStudent, enrollStudent);
coursesRouter.post("/getAllUnique", authenticateStudent, extractUniqueCourses);
coursesRouter.post("/getCoursesByStudentId", authenticateStudent, getCoursesByStudentId);
coursesRouter.post("/removeStudentFromCourse", authenticateStudent, removeStudentFromCourse);
coursesRouter.post("/updateStudentsSection", authenticateStudent, updateStudentsSection);

export default coursesRouter;
