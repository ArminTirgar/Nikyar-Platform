import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Paper, CssBaseline, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../components/UserContext';

const NewAd = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userID: user ? user.UserID : '',
    businessID: null,
    title: '',
    description: '',
    price: '',
    categoryID: '',
    photoPath: '',
    cityID: ''
  });

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the categories!', error);
      });

    axios.get('http://localhost:3001/api/cities')
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the cities!', error);
      });
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({ ...prevData, userID: user.UserID }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'businessID' && value === '' ? null : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const adData = {
      ...formData,
      businessID: formData.businessID === '' ? null : formData.businessID
    };

    // چک کردن مقدار userID
    if (!adData.userID) {
      toast.error('User ID is missing!');
      return;
    }

    // لاگ کردن داده‌هایی که به سرور ارسال می‌شود
    console.log('Submitting Ad Data:', adData);

    axios.post('http://localhost:3001/api/ads', adData)
      .then(response => {
        console.log('Ad created successfully:', response.data); // اضافه کردن لاگ برای موفقیت
        toast.success('Ad created successfully');
        setTimeout(() => {
          navigate('/ads');
        }, 2000);
      })
      .catch(error => {
        console.error('There was an error creating the ad!', error.response ? error.response.data : error); // اضافه کردن لاگ برای خطا
        toast.error(`There was an error creating the ad: ${error.response ? error.response.data.details : 'Unknown error'}`);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <ToastContainer />
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography component="h1" variant="h5">
            ساخت اگهی جدید
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '10px' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              name="title"
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="price"
              label="Price"
              name="price"
              onChange={handleChange}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="categoryID"
                name="categoryID"
                value={formData.categoryID}
                onChange={handleChange}
                label="Category"
                required
              >
                {categories.length === 0 ? (
                  <MenuItem value="">
                    <em>دسته بندی ای یافت نشد </em>
                  </MenuItem>
                ) : (
                  categories.map(category => (
                    <MenuItem key={category.CategoryID} value={category.CategoryID}>
                      {category.Name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="photoPath"
              label="Photo URL"
              name="photoPath"
              onChange={handleChange}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                id="cityID"
                name="cityID"
                value={formData.cityID}
                onChange={handleChange}
                label="City"
                required
              >
                {cities.length === 0 ? (
                  <MenuItem value="">
                    <em>شهری موجود نیست</em>
                  </MenuItem>
                ) : (
                  cities.map(city => (
                    <MenuItem key={city.CityID} value={city.CityID}>
                      {city.CityName} - {city.ProvinceName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={{ margin: '10px 0' }}
            >
              Create Ad
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewAd;
