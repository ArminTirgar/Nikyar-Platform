import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/UserContext';
import { Container, TextField, Button, Typography, Box, Paper, CssBaseline, Grid } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const userID = user ? user.UserID : null;

  useEffect(() => {
    if (userID) {
      axios.get(`http://localhost:3001/api/users/${userID}`)
        .then(response => {
          setProfile(response.data);
        })
        .catch(error => {
          console.error('یه هنگام دریافت پروفایل مشکلی پیش امد !', error);
        });
    }
  }, [userID]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3001/api/users/${userID}`, profile)
      .then(response => {
        setUser(response.data);
        toast.success('پروفایل با موفقیت به روزرسانی شد');
        setTimeout(() => {
          navigate('/');
        }, 2000); // Redirect after 2 seconds
      })
      .catch(error => {
        console.error('مشکلی در هنگم به روزرسانی پروفایل پیش امده', error.response.data);
        toast.error('شکلی در هنگم به روزرسانی پروفایل پیش امده');
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      
      <CssBaseline />
      <ToastContainer />
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography component="h1" variant="h5">
            Update Profile
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  value={profile.firstName || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="phoneNumber"
                  label="Phone Number"
                  name="phoneNumber"
                  value={profile.phoneNumber || ''}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={{ margin: '20px 0' }}
            >
              به روزرسانی پروفایل
            </Button>
          </form>
        </Box>
        
      </Paper>
    </Container>
  );
};

export default Profile;
