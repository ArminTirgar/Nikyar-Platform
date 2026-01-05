import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Grid } from '@mui/material';

const ads = [
  {
    id: 1,
    title: 'Help Children in Need',
    description: 'Join us in providing food and education for underprivileged children.',
    image: '/images/charity1.jpg',
  },
  {
    id: 2,
    title: 'Medical Aid for Families',
    description: 'Support low-income families with basic medical supplies.',
    image: '/images/charity2.jpg',
  },
  {
    id: 3,
    title: 'Warm Clothes Campaign',
    description: 'Help us collect and distribute warm clothes for the homeless.',
    image: '/images/charity3.jpg',
  },
];

function PreviousAds() {
  return (
    <div style={{ padding: '40px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        آگهی‌های قبلی
      </Typography>

      <Grid container spacing={3}>
        {ads.map((ad) => (
          <Grid item xs={12} sm={6} md={4} key={ad.id}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={ad.image}
                alt={ad.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {ad.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: '60px' }}>
                  {ad.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  مشاهده جزئیات
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default PreviousAds;
