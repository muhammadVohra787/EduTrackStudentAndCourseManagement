import React, { useState, useEffect } from 'react';
import { Container, Typography, Accordion, AccordionSummary, Box, AccordionDetails, Grid, Divider, Button, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';
import { usePostAuthenticated } from '../api/tanstack-get-post';
import SignUpSignIn from './SignUpPage';

const CircularBox = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <CircularProgress sx={{ color: 'gray' }} />
        </Box>
    )
}

const AdminDashboard = () => {
    const { isPending: gettingAllStudents, mutateAsync: getAllStudents } = usePostAuthenticated();
    const { isPending: coursesFetched, mutateAsync: getAllCourses } = usePostAuthenticated();
    const { isPending: studentsForCourse, mutateAsync: getStudentsForCourse } = usePostAuthenticated();
    const [users, setUsers] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectCourseStudents, setSelectedCourseStudents] = useState([]);
    const [selectCourse, setSelectedCourse] = useState({});
    const [error, setError] = useState("");

    // Fetch all students
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllStudents({ postData: null, url: "/getAllStudents" });
                if (res.data.success) {
                    setUsers(res.data.students);
                }
            } catch (error) {
                console.error("Error fetching students:", error.message);
                setError("Failed to fetch students.");
            }
        };
        fetchData();
    }, [getAllStudents]);

    // Fetch available courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllCourses({ postData: null, url: "course/getAllUnique" });
                if (res.data.success) {
                    setAvailableCourses(res.data.courses);
                }
            } catch (error) {
                console.error("Error fetching courses:", error.message);
                setError("Failed to fetch courses.");
            }
        };
        fetchData();
    }, [getAllCourses]);

    const listStudentsByCourseName = async (course) => {
        setSelectedCourse(course);
        try {
            const res = await getStudentsForCourse({ postData: { courseCode: course.courseCode }, url: "getStudentsByCourseCode" });
            if (res.data.success) {
                setSelectedCourseStudents(res.data.students);
            }
        } catch (error) {
            console.error("Error fetching course students:", error.message);
            setError("Failed to fetch students for the selected course.");
        }
    };

    const columns = [
        { field: 'firstName', headerName: 'First Name', width: 120 },
        { field: 'lastName', headerName: 'Last Name', width: 120 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'city', headerName: 'City', width: 120 },
        { field: 'phoneNumber', headerName: 'Phone', width: 140 },
      ];

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography variant="h6">All Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {gettingAllStudents ? <CircularBox /> :
                        <DataGrid
                            rows={users}
                            columns={columns}
                            pageSize={5}
                            getRowId={(row) => row._id}
                            disableSelectionOnClick
                        />}
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                    <Typography variant="h6">Add a Student</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <SignUpSignIn firstPage={false} />
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3a-content" id="panel3a-header">
                    <Typography variant="h6">All Available Courses</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {availableCourses.map((course) => (
                        <Grid container spacing={2} alignItems="center" key={course.courseCode}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body1">{course.courseCode}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body1">{course.courseName}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button sx={{ mt: 2 }} variant="contained" disabled={coursesFetched || studentsForCourse} onClick={() => listStudentsByCourseName(course)}>
                                    List Students
                                </Button>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                        </Grid>
                    ))}
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
                    <Typography variant="h6">Course Students: {selectCourse?.courseName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {studentsForCourse ? <CircularBox /> :
                        <DataGrid
                            rows={selectCourseStudents}
                            columns={columns}
                            pageSize={5}
                            getRowId={(row) => row._id}
                            disableSelectionOnClick
                        />}
                </AccordionDetails>
            </Accordion>
        </Container>
    );
};

export default AdminDashboard;
