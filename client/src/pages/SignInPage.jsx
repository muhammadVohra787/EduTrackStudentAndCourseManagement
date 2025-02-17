import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import { usePost } from "../api/tanstack-get-post";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useNavigate, useLocation } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signInContext = useSignIn();
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", success: false });
  const { isPending, mutateAsync } = usePost();

  // Handle input change
  const handleChange = (e) => {
    setSignIn({ ...signIn, [e.target.name]: e.target.value });

    // Remove error message when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  // Validate inputs
  const validate = () => {
    let newErrors = {};
    if (!signIn.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(signIn.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!signIn.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const signInSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await mutateAsync({ postData: signIn, url: "signInStudent" });

      setMessage({
        text: res.data.message,
        success: res.data.success,
      });

      if (res.data.success) {
        signInContext({
          expireIn: res.data.expires,
          userState: {
            user_id: res.data?.student?._id,
            role: res.data?.student?.admin ? "admin" : "student",
            name: res.data?.student?.firstName,
          },
          auth: {
            token: res.data.token,
            type: "Bearer",
          },
        });

        const redirectTo =
          location.state?.from?.pathname ||
          (res.data?.student?.admin ? "/dashboard/admin" : "/dashboard/student");
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      setMessage({ text: "An error occurred. Please try again.", success: false });
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>
        <Stack spacing={2}>
          {/* Fields using map */}
          {[
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" },
          ].map((field, index) => (
            <TextField
              key={index}
              label={field.label}
              variant="outlined"
              type={field.type}
              name={field.name}
              value={signIn[field.name]}
              onChange={handleChange}
              autoComplete={field.name === "email" ? "email" : "current-password"}
              fullWidth
              InputProps={{ style: { color: "black" } }}
              error={!!errors[field.name]}
              helperText={errors[field.name]}
            />
          ))}

          <Button
            variant="contained"
            onClick={signInSubmit}
            disabled={isPending}
            fullWidth
          >
            {isPending ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          {message.text && (
            <Typography color={message.success ? "success.main" : "error.main"}>
              {message.text}
            </Typography>
          )}
        </Stack>

        <Typography sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link href="/" underline="hover" sx={{ color: "white" }}>
            Register here
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default SignInPage;
