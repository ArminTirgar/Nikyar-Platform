import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, Typography, Grid } from '@mui/material';

function AdminAds() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
  axios.get('http://localhost:3001/api/ads')
    .then(res => {
      console.log('Fetched ads:', res.data); // 👈 See exact field names
      setAds(res.data);
    })
    .catch(err => console.error(err));
}, []);

  const updateStatus = (adID, newStatus) => {
    axios.put(`http://localhost:3001/api/ads/${adID}/status`, { status: newStatus })
      .then(res => {
        alert(res.data.message);
        setAds(ads.map(ad => ad.AdID === adID ? { ...ad, Status: newStatus } : ad));
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '40px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        مدیریت آگهی‌ها
      </Typography>

      <Grid container spacing={3}>
        {ads.map(ad => (
          <Grid item xs={12} sm={6} md={4} key={ad.AdID}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6">{ad.Title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  وضعیت: {ad.Status}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2, mr: 1 }}
                  onClick={() => updateStatus(ad.AdID, 'published')}
                >
                  تأیید
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={() => updateStatus(ad.AdID, 'rejected')}
                >
                  رد کردن
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default AdminAds;
