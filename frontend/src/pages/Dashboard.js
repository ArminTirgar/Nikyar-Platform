import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, IconButton, Avatar, Paper, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserContext } from '../components/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';


const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.UserID) {
      console.log('Fetching ads for user:', user.UserID);
      axios.get(`http://localhost:3001/api/ads/user/${user.UserID}`)
        .then(response => {
          console.log('Ads data:', response.data);
          setAds(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('There was an error fetching the ads!', error);
          setLoading(false);
        });
    } else {
      console.log('User ID is not defined');
      setLoading(false);
    }
  }, [user]);

  const handleDelete = (adID) => {
    console.log('Deleting ad with ID:', adID);
    axios.delete(`http://localhost:3001/api/ads/${adID}`)
      .then(response => {
        console.log('Ad deleted:', response.data);
        setAds(ads.filter(ad => ad.AdID !== adID));
      })
      .catch(error => {
        console.error('There was an error deleting the ad!', error);
      });
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Manage your ads and profile here.
        </Typography>

        <Box my={4}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Box display="flex" alignItems="center">
              <Avatar>{user?.FirstName?.charAt(0)}</Avatar>
              <Box ml={2}>
                <Typography variant="h6">{user?.FirstName} {user?.LastName}</Typography>
                <Typography variant="body2">{user?.Email}</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* ✅ Show admin control button only if user is admin */}
        {user?.IsAdmin === 1 && (
          <Box textAlign="center" my={2}>
           <Button
             variant="contained"
             color="secondary"
             onClick={() => navigate('/admin')}>
           مدیریت آگهی‌ها
             </Button>
           </Box>
         )}

        <Box my={4}>
          <Typography variant="h5" gutterBottom>
            Your Ads
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {ads.length > 0 ? (
                ads.map(ad => (
                  <Grid item xs={12} sm={6} md={4} key={ad.AdID}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="h2">
                          {ad.Title}
                        </Typography>
                        <Typography color="textSecondary">
                          {ad.Price} $
                        </Typography>
                        <Typography variant="body2" component="p">
                          {ad.Description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Status: {ad.Status}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => navigate(`/edit-ad/${ad.AdID}`)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(ad.AdID)}>
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography>No ads found</Typography>
              )}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
