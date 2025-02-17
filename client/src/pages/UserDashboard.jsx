import React, { useEffect, useState } from "react";
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Select,
    MenuItem,
    Stack,
    Alert,
    CircularProgress,
} from "@mui/material";
import { usePostAuthenticated } from "../api/tanstack-get-post.js";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

// Sections
const sections = ["001", "002", "003"];

const UserDashboard = () => {
    const { isPending: coursesFetched, mutateAsync: getAllCourses } = usePostAuthenticated();
    const { isPending: addingCourse, mutateAsync: addACourse } = usePostAuthenticated();
    const { isPending: gettingCourese, mutateAsync: getCoursesForUser } = usePostAuthenticated();
    const { isPending: deletingCourse, mutateAsync: deleteCourseById } = usePostAuthenticated();
    const { isPending: updatingCourse, mutateAsync: updateSectionOfCourse } = usePostAuthenticated();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState({ courseCode: "", courseName: "" });
    const [selectedSection, setSelectedSection] = useState(""); 
    const [newSection, setNewSection] = useState("");
    const [error, setError] = useState("");
    const [editingCourse, setEditingCourse] = useState(null);
    const [currentSemester, setCurrentSemester] = useState("Winter 2025");
    const [availableCourses, setAvailableCourses] = useState([]);
    const authUser = useAuthUser()

    // Fetch available courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getAllCourses({ postData: null, url: "course/getAllUnique" }).then((res) => {
                    if (res.data.success) {
                        setAvailableCourses(res.data.courses);
                    }
                })

            } catch (error) {
                console.error("Error fetching courses:", error.message);
                setError("Failed to fetch courses.");
            }
        };
        fetchData();
    }, [getAllCourses]);

    // Fetch available courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getCoursesForUser({ postData: { userId: authUser.user_id }, url: "course/getCoursesByStudentId" }).then((res) => {
                    if (res.data.success) {
                        setCourses(res.data.courses);
                    }
                })

            } catch (error) {
                console.error("Error fetching courses:", error.message);
                setError("Failed to fetch courses.");
            }
        };
        fetchData();
    }, [getCoursesForUser]);

    // Handle adding a course
    const handleAddCourse = async () => {
        if (!selectedCourse.courseCode || !selectedSection) {
            setError("Please select a course and section.");
            return;
        }

        if (courses.some(course => course.courseCode === selectedCourse.courseCode)) {
            setError("Course already added. Drop it to change the section.");
            return;
        }


        const addingCourse = {
            userId: authUser.user_id,
            courseCode: selectedCourse.courseCode,
            section: selectedSection,
        }
        await addACourse({ postData: addingCourse, url: "course/enroll" }).then((res) => {
            if (res.data.success) {
                const newCourse = {
                    courseCode: selectedCourse.courseCode,
                    courseName: selectedCourse.courseName,
                    section: selectedSection,
                };
                setCourses([...courses, newCourse]);
                setSelectedCourse({ courseCode: "", courseName: "" });
                setSelectedSection("");
                setError("");
            } else {
                setError(res.data.message)
            }
            console.log(res)
        })
        console.log(courses)

    };

    // Handle dropping a course
    const handleDropCourse = async (cd) => {
        const deletedCourse = {
            userId: authUser.user_id,
            courseCode: cd.courseCode,
            section: cd.section
        }
        await deleteCourseById({ postData: deletedCourse, url: "course/removeStudentFromCourse" }).then((res) => {
            if (res.data.success) {
                const updatedCourses = courses.filter((course) => course.courseCode !== cd.courseCode);
                setCourses(updatedCourses);
            } else {
                setError(res.data.message)
            }
            console.log(res)
        })

    };

    // Handle editing a course's section
    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setNewSection(course.section);
    };

    // Save the updated section
    const handleSaveChanges = async () => {
        if (!newSection) return;
        const sectionUpdateData = {
            userId: authUser.user_id,
            courseCode: editingCourse.courseCode,
            oldSection: editingCourse.section,
            newSection: newSection
        }

        await updateSectionOfCourse({ postData: sectionUpdateData, url: "course/updateStudentsSection" }).then((res) => {
            if (res.data.success) {
                const updatedCourses = courses.map((course) =>
                    course.courseCode === editingCourse.courseCode ? { ...course, section: newSection } : course
                );

                setCourses(updatedCourses);
                setEditingCourse(null);
                setNewSection("");
                setError("");
            } else {
                setError(res.data.message)
            }
            console.log(res)
        })
    };

    // Reset editing mode
    const handleReset = () => {
        setEditingCourse(null);
        setNewSection("");
        setError("");
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                📚 Student Dashboard
            </Typography>
            <Typography variant="h6" gutterBottom>
                Current semester: {currentSemester}
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="h6">Add a Course</Typography>
            {coursesFetched ? <CircularProgress /> :

                <Stack direction="row" spacing={2} alignItems="center">
                    {/* Course selection dropdown */}
                    <Select
                        value={selectedCourse.courseCode}
                        onChange={(e) => {
                            const course = availableCourses.find(c => c.courseCode === e.target.value);
                            setSelectedCourse(course || { courseCode: "", courseName: "" });
                        }}
                        displayEmpty
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="" disabled>Select a course</MenuItem>
                        {availableCourses.map((course) => (
                            <MenuItem key={course.courseCode} value={course.courseCode}>
                                {course.courseName}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* Section selection dropdown */}
                    <Select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>000</MenuItem>
                        {sections.map((section) => (
                            <MenuItem key={section} value={section}>
                                {section}
                            </MenuItem>
                        ))}
                    </Select>

                    <Button variant="contained" color="primary" disabled={coursesFetched} onClick={handleAddCourse} sx={{ height: 55, width: 100 }}>
                        Enroll
                    </Button>
                </Stack>}


            {/* Course table */}
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Course Name</b></TableCell>
                            <TableCell><b>Section</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No courses enrolled yet.
                                </TableCell>
                            </TableRow>
                        ) : gettingCourese || addingCourse || coursesFetched || deletingCourse || updatingCourse ? <TableRow>
                            <TableCell colSpan={3} align="center">
                                <CircularProgress />
                            </TableCell>
                        </TableRow> :
                            (
                                courses.map((course) => (
                                    <TableRow key={course.courseCode} sx={{ height: 100 }}>
                                        <TableCell>{course.courseName}</TableCell>
                                        <TableCell>
                                            {editingCourse && editingCourse.courseCode === course.courseCode ? (
                                                <Select
                                                    value={newSection}
                                                    onChange={(e) => setNewSection(e.target.value)}
                                                    displayEmpty
                                                >
                                                    {sections.map((section) => (
                                                        <MenuItem key={section} value={section}>
                                                            {section}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            ) : (
                                                course.section
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingCourse && editingCourse.courseCode === course.courseCode ? (
                                                <>
                                                    <Button
                                                        color="warning"
                                                        variant="contained"
                                                        onClick={handleSaveChanges}
                                                        sx={{ marginRight: 2 }}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        color="error"
                                                        variant="contained"
                                                        onClick={handleReset}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        color="warning"
                                                        variant="contained"
                                                        onClick={() => handleEditCourse(course)}
                                                        sx={{ marginRight: 2 }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        color="error"
                                                        variant="contained"
                                                        onClick={() => handleDropCourse(course)}
                                                    >
                                                        Drop
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default UserDashboard;
