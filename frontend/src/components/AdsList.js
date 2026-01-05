import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdsList = () => {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/api/ads/published')
      .then(response => {
        setAds(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the ads!', error);
      });
  }, []);

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          لیست اگهی ها
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/new-ad')} style={{ marginBottom: '20px' }}>
          اضافه کردن اگهی جدید
        </Button>
        <Grid container spacing={4}>
          {ads.map(ad => (
            <Grid item key={ad.AdID} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={ad.ImageUrl || 'https://via.placeholder.com/150'}
                  alt={ad.Title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {ad.Title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {ad.Description}
                  </Typography>
                  <Typography variant="h6" component="div" color="textPrimary">
                    {ad.Price} تومان
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AdsList;
