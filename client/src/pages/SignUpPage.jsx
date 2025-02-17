import { useState } from 'react';
import { TextField, Container, Stack, Paper, Button, Modal, Box, Typography, Grid, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePost } from '../api/tanstack-get-post.js';
import { Link, useNavigate } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const SignUpSignIn = ({ firstPage }) => {
  const navigate = useNavigate();

  const [signUp, setSignUp] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    password: '',
    address: '',
    city: '',
    phoneNumber: '',
    program: '',
    favoriteTopic: '',
    favoriteAssignment: '',
    strongestTechnicalSkill: '',
  });

  const { isPending, mutateAsync } = usePost();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSignUpChange = (e) => {
    setSignUp({ ...signUp, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    const excluded = ['program', 'favoriteTopic','favoriteAssignment', 'strongestTechnicalSkill']
    // Required fields validation
    Object.keys(signUp).forEach((key) => {
      if (!signUp[key].trim()) {
        if (firstPage) {
          newErrors[key] = 'This field is required';
        } else {
          if (!excluded.includes(key)) {
            newErrors[key] = 'This field is required';
          }
        }
      }
    });

    // Email validation
    if (signUp.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(signUp.email)) {
      newErrors.email = 'Invalid email format (e.g. a@b.com)';
    }

    // Password length validation
    if (signUp.password && signUp.password.length <= 3) {
      newErrors.password = 'Password must be more than 3 characters';
    }

    // Student ID length validation
    if (signUp.studentId && signUp.studentId.length <= 3) {
      newErrors.studentId = 'Student ID must be more than 3 characters';
    }
    console.log(newErrors, firstPage)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUpSubmit = async () => {
    if (!validateForm()) return;

    try {
      await mutateAsync({ postData: signUp, url: 'createStudent' }).then((res) => {
        let msg=res.data.message
        
        if(!firstPage && res.data.success){
          msg="student added"
        }
        setModalOpen(true);
        if (firstPage && res.data.success) {
          navigate('/login');
        }
        setModalMessage(msg)
      });
    } catch (error) {
      setModalMessage('Sign-up failed. Please check your details and try again.');
      setModalOpen(true);
    }
  };

  return (
    <Container>
      <Typography variant="h6" textAlign="center" gutterBottom>
        {firstPage ? "Sign Up" : "Add a Student"}
      </Typography>

      <Grid container spacing={2}>
        {[
          { name: 'firstName', label: 'First Name' },
          { name: 'lastName', label: 'Last Name' },
          { name: 'studentId', label: 'Student ID' },
          { name: 'email', label: 'Email' },
          { name: 'password', label: 'Password', type: 'password' },
          { name: 'address', label: 'Address' },
          { name: 'city', label: 'City' },
          { name: 'phoneNumber', label: 'Phone Number' },
          ...(firstPage
            ? [
              { name: 'program', label: 'Program' },
              { name: 'favoriteTopic', label: 'Favorite Topic' },
              { name: 'favoriteAssignment', label: 'Favorite Assignment' },
              { name: 'strongestTechnicalSkill', label: 'Strongest Technical Skill' },
            ]
            : []),
        ].map((field, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Item>
              <TextField
                label={field.label}
                variant="filled"
                name={field.name}
                type={field.type || 'text'}
                value={signUp[field.name]}
                onChange={handleSignUpChange}
                fullWidth
                InputProps={{ style: { color: 'black' } }}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
              />
            </Item>
          </Grid>
        ))}
      </Grid>


      <Button variant="contained" onClick={signUpSubmit} disabled={isPending} sx={{ width: '100%' }}>
        {isPending ? <CircularProgress /> : 'Submit'}
      </Button>

      {firstPage && (
        <Typography sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link to="/login" underline="hover" sx={{ color: 'white' }}>
            Login here
          </Link>
        </Typography>
      )}

      {/* Modal for response messages */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">{modalMessage}</Typography>
          <Button onClick={() => setModalOpen(false)} sx={{ mt: 2 }} variant="contained">
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default SignUpSignIn;
