import mongoose from 'mongoose';
import Student from '../models/student.model.js';
import Course from '../models/course.model.js';
import bcrypt from "bcrypt";
// Function to generate random student data
const generateRandomStudents = async (numStudents) => {
  await Student.collection.deleteMany();
  const students = [];
  for (let i = 0; i < numStudents; i++) {
    students.push({
      firstName: `Student${i}`,
      lastName: `LastName${i}`,
      studentId: `S${1000 + i}`,
      email: `student${i}@example.com`,
      password: 'password123',
      address: `Address ${i}`,
      city: `City ${i}`,
      phoneNumber: `1234567890`,
      program: `Program${i}`,
      favoriteTopic: `Topic${i}`,
      favoriteAssignment: `Assignment${i}`,
      strongestTechnicalSkill: `Skill${i}`,
      admin: false,
    });
  }
  return students;
};
 
// Function to enroll students in courses
export const enrollStudentsInCourses = async () => {
  try {
    console.log('Generating students...');
    const totalStudents = 24; //3x8
    const studentsData = await generateRandomStudents(totalStudents);

    console.log('Inserting students into the database...');
    const students = await Student.insertMany(studentsData);

    console.log('Fetching courses...');
    let courses = await Course.aggregate([
      {
        $group: {
          _id: "$courseCode",
          courseName: { $first: "$courseName" },
          courseId: { $first: "$_id" } 
        }
      },
      {
        $project: {
          _id: 0,
          courseCode: "$_id",
          courseName: 1,
          courseId: 1
        }
      }
    ]);

    console.log('Courses found:', courses);
    courses = courses.slice(0, 3);
    
    if (courses.length < 3) {
      console.log('Error: Less than 3 courses found. Make sure the database has at least 3 courses.');
      return;
    }

    console.log('Enrolling students in courses...');
    for (let i = 0; i < 3; i++) {
      const course = courses[i];
      const selectedStudents = students.slice(i * 8, (i + 1) * 8);

      console.log(`Enrolling in ${course.courseName} (${course.courseCode})`);
      console.log('Selected Students:', selectedStudents.map(s => s.email));

      await Course.updateOne(
        { _id: course.courseId }, 
        { $addToSet: { students: { $each: selectedStudents.map(s => s._id) } } }
      );
    }
    console.log(`${students.length} students generated and enrolled successfully!`);

    const adminUser = new Student({
      firstName: "Admin",
      lastName: "User",
      studentId: "000000",
      email: "s@b.com",
      password: "cat123",
      address: "N/A",
      city: "N/A",
      phoneNumber: "0000000000",
      program: "N/A",
      favoriteTopic: "N/A",
      favoriteAssignment: "N/A",
      strongestTechnicalSkill: "N/A",
      admin: true, 
    });

    await adminUser.save({ validateBeforeSave: false });
    console.log("Admin user added")
  
  } catch (error) {
    console.error('Error generating and enrolling students:', error);
  }
};


 