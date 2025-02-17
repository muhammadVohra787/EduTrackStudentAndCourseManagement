// server/controller/course.controller.js
import Course from '../models/course.model.js';
import mongoose from "mongoose";
// Enroll a student in a specific course and section
export const enrollStudent = async (req, res) => {
  const { courseCode, section, userId } = req.body;

  try {
    // Find the course with the specified courseCode and section
    const course = await Course.findOne({ courseCode, section });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course with the specified code and section not found.',
      });
    }

    if (course.students.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course.',
      });
    }

    course.students.push(userId);

    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Student enrolled successfully!',
      course,
    });

  } catch (error) {
    console.error('Error enrolling student:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Extract unique courses (ignoring sections)
export const extractUniqueCourses = async (req, res) => {
  console.log("new request")
  try {
    // Find all courses, grouped by courseCode (ignoring the section)
    const courses = await Course.aggregate([
      {
        $group: {
          _id: "$courseCode",
          courseName: { $first: "$courseName" }
        }
      },
      {
        $project: {
          _id: 0,
          courseCode: "$_id",  
          courseName: 1 
        }
      }
    ]);
    // Return the list of unique courses
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Error extracting unique courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};



export const getCoursesByStudentId = async (req, res) => {
  try {
      const { userId } = req.body;

      // Find all courses where the `students` array contains this studentId
      const courses = await Course.find({ students: userId });

      if (!courses.length) {
          return res.status(404).json({ success: false, message: "No courses found for this student." });
      }

      res.status(200).json({ success: true, courses });
  } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ success: false, message: "Server error." });
  }
};

export const removeStudentFromCourse = async (req, res) => {
  try {
      const { userId, courseCode, section } = req.body;

      if (!userId || !courseCode || !section) {
          return res.status(400).json({ success: false, message: "Missing required fields." });
      }

      // Find the course by courseCode and section
      const course = await Course.findOne({ courseCode, section });

      if (!course) {
          return res.status(404).json({ success: false, message: "Course not found." });
      }

      // Remove studentId from the students array
      course.students = course.students.filter(id => id.toString() !== userId);

      // Save updated course document
      await course.save();

      res.status(200).json({ success: true, message: "Student removed successfully." });
  } catch (error) {
      console.error("Error removing student from course:", error);
      res.status(500).json({ success: false, message: "Server error." });
  }
};


export const updateStudentsSection = async (req, res) => {
  try {
      const { userId, courseCode, oldSection, newSection } = req.body;

      if (!userId || !courseCode || !oldSection || !newSection) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // Step 1: Remove student from the old section
      const oldCourse = await Course.findOneAndUpdate(
          { courseCode, section: oldSection },
          { $pull: { students: userId } },
          { new: true } // Return updated document
      );

      if (!oldCourse) {
          return res.status(404).json({ success: false, message: "Old section not found" });
      }

      // Step 2: Add student to the new section
      const newCourse = await Course.findOneAndUpdate(
          { courseCode, section: newSection },
          { $addToSet: { students: userId } }, // Ensures no duplicates
          { new: true, upsert: true } // Create section if it doesn't exist
      );

      if (!newCourse) {
          return res.status(500).json({ success: false, message: "Failed to add student to new section" });
      }

      return res.status(200).json({ success: true, message: "Section updated successfully" });

  } catch (error) {
      console.error("Error updating student section:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

