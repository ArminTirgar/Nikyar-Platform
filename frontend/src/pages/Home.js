import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, 
  Grid, Card, CardContent, CardMedia 
} from '@mui/material';
import { UserContext } from '../components/UserContext';
import charity_image from "../assets/images/charity_final.png";
import { FaDollarSign } from "react-icons/fa";
import { IoPersonCircleOutline } from "react-icons/io5";
import '../Home.css';

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const [recentAds, setRecentAds] = useState([]);

  const userName = user && user.FirstName && user.LastName 
    ? `${user.FirstName} ${user.LastName}` 
    : 'Guest';

  // 🟢 Fetch 3 most recent published ads
  useEffect(() => {
    axios.get('http://localhost:3001/api/ads/recent')
      .then(res => {
        console.log('Fetched recent ads:', res.data);
        setRecentAds(res.data);
      })
      .catch(err => console.error('Error fetching recent ads:', err));
  }, []);

  return (
    <div>
      {/* 🔵 Top Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            پلتفرم نیک‌یار
          </Typography>
          {user ? (
            <>
              <Typography variant="h6" sx={{ mr: 2 }}>
                خوش آمدید، {userName}
              </Typography>
              <Button color="inherit" onClick={logout}>خروج</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/register">ثبت‌نام</Button>
              <Button color="inherit" component={Link} to="/login">ورود</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container>
        {/* 🟡 Hero Section */}
        <Box
          my={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <div className="centeral_picture">
            <img src={charity_image} className="picture" alt="charity" />
          </div>
          <Typography variant="h3" component="h1" gutterBottom className="title">
            با تو، نیکی ادامه دارد
          </Typography>

          <nav>
            <Button variant="contained" color="primary" component={Link} to="/ads" sx={{ m: 1 }}>
              نمایش آگهی‌ها
            </Button>
            <Button variant="contained" color="primary" component={Link} to="/search" sx={{ m: 1 }}>
              دسته‌بندی آگهی‌ها
            </Button>
            <Button variant="contained" color="primary" component={Link} to="/ads" sx={{ m: 1 }}>
              کمک مالی مستقیم <FaDollarSign />
            </Button>
            <Button variant="contained" color="primary" component={Link} to="/profile" sx={{ m: 1 }}>
              اطلاعات حساب کاربری
            </Button>
            <Button variant="contained" color="primary" component={Link} to="/dashboard" sx={{ m: 1 }}>
              پنل کاربری <IoPersonCircleOutline />
            </Button>
          </nav>
        </Box>

        {/* 🟢 Recent Ads Section */}
        <Box my={5}>
          <Typography variant="h4" align="center" gutterBottom>
            آگهی‌های اخیر
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {recentAds.length > 0 ? (
              recentAds.map(ad => (
                <Grid item key={ad.AdID} xs={12} sm={6} md={4}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={ad.PhotoPath || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={ad.Title}
                    />
                    <CardContent>
                      <Typography variant="h6">{ad.Title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        قیمت: {ad.Price?.toLocaleString()} تومان
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography align="center" color="text.secondary">
                هیچ آگهی‌ای هنوز منتشر نشده است.
              </Typography>
            )}
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
