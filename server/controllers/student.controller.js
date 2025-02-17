import dotenv from "dotenv";
import Student from '../models/student.model.js';
import Course from '../models/course.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;

export const createStudent = async (req, res) => {
    try {
        const { email,studentId } = req.body;
        console.log(req.body)
        const res1 = await Student.findOne({ email });

        if (res1) {
            console.log( "Email already in use")
            return res.status(401).json({ message: "Email already in use", success: false });
        }

        const res2 = await Student.findOne({ studentId });
        
        if (res2) {
            console.log( "Student ID already in use")
            return res.status(401).json({ message: "Student Id already in use", success: false });
        }

        const student = new Student(req.body);
        await student.save();

        return res.status(200).json({
            message: 'Successfully signed up!',
            success: true,
            student:student,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const signInStudent = async (req, res) => {
    const { email, password } = req.body;
    console.log("Signin request", req.body)
    try {
        const student = await Student.findOne({ email });
        
        if (!student) {
            console.log( "Email or password don't match.")
            return res.status(401).json({ message: "Email or password don't match.", success: false });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        console.log(student.password , password)
        if (!isMatch) {
            return res.status(401).json({ message: "Email or password don't match.", success: false });
        }

        const sessionExpiry = '24h';
        const token = jwt.sign(
            { _id: student._id },
            JWT_SECRET,
            { expiresIn: sessionExpiry },
        );

        const jwtDecoded = jwt.decode(token);
        return res.status(200).json({
            success: true,
            student: student,
            message: 'Login was succesfull',
            token,
            expires: jwtDecoded.exp * 1000
        });
    } catch (error) {
        console.error('Error signing in:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select("firstName lastName email address city phoneNumber");
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getStudentsByCourseCode = async (req, res) => {
    const { courseCode } = req.body;
    console.log(courseCode);

    try {
        
        const courses = await Course.find({ courseCode })
            .populate('students', '_id firstName lastName email city phoneNumber');

            if (!courses || courses.length === 0) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
    
           
            const allStudents = courses.reduce((students, course) => {

                return students.concat(course.students);
            }, []);
    
            res.status(200).json({ success: true, students: allStudents });
    } catch (error) {
        console.error("Error fetching students by course:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const authenticateStudent = async (req, res, next) => {

    try {
        const token = req.header("Authorization")?.split(" ")[1]; 

        if (!token) {
            console.log("unauth -isStudent")
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const student = await Student.findById(decoded._id).select("-password");

        if (!student) {
            console.log("unauth -isStudent")
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        req.student = student; 
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.student || req.student.admin !== true) { 
        console.log("unauth -admin")
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
    next(); 
};
