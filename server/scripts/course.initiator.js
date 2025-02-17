import mongoose from 'mongoose';
import Course from '../models/course.model.js';

export const initCourses = async () => {
  try {
    // Drop the existing courses collection to start fresh
    await Course.collection.drop();

    // Define the course structure
    const predCourses = [
      {
        courseCode: 'CS201',
        courseName: 'Advanced Programming',
        section: '001',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'CS201',
        courseName: 'Advanced Programming',
        section: '002',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'CS201',
        courseName: 'Advanced Programming',
        section: '003',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'MATH301',
        courseName: 'Linear Algebra',
        section: '001',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'MATH301',
        courseName: 'Linear Algebra',
        section: '002',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'MATH301',
        courseName: 'Linear Algebra',
        section: '003',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'ENG202',
        courseName: 'Modern Poetry',
        section: '001',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'ENG202',
        courseName: 'Modern Poetry',
        section: '002',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'ENG202',
        courseName: 'Modern Poetry',
        section: '003',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'PHY201',
        courseName: 'Introduction to Mechanics',
        section: '001',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'PHY201',
        courseName: 'Introduction to Mechanics',
        section: '002',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'PHY201',
        courseName: 'Introduction to Mechanics',
        section: '003',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'CHEM201',
        courseName: 'Organic Chemistry',
        section: '001',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'CHEM201',
        courseName: 'Organic Chemistry',
        section: '002',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'CHEM201',
        courseName: 'Organic Chemistry',
        section: '003',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'BIO201',
        courseName: 'Genetics',
        section: '001',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'BIO201',
        courseName: 'Genetics',
        section: '002',
        semester: 'Fall 2025',
        students: [],
      },
      {
        courseCode: 'BIO201',
        courseName: 'Genetics',
        section: '003',
        semester: 'Fall 2025',
        students: [],
      },
    ];    

    // Insert the predefined courses into the database
    await Course.insertMany(predCourses);

    console.log('Courses initialized successfully!');
  } catch (error) {
    console.error('Error initializing courses:', error);
  }
};

