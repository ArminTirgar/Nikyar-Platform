import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Paper, CssBaseline, MenuItem, Select, InputLabel, FormControl, Grid, Card, CardContent, CardMedia } from '@mui/material';

const SearchAds = () => {
  const [filters, setFilters] = useState({
    categoryID: '',
    name: '',
    minPrice: '',
    maxPrice: '',
    hasPhoto: ''
  });
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the categories!', error);
      });
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams[key] = filters[key];
      }
    });

    axios.get('http://localhost:3001/api/ads/search', { params: queryParams })
      .then(response => {
        setResults(response.data);
      })
      .catch(error => {
        console.error('There was an error searching the ads!', error);
      });
  };

  return (
    <Container component="main">
      <CssBaseline />
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography component="h1" variant="h5">
            دسته بندی 
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="categoryID"
                    name="categoryID"
                    value={filters.categoryID}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category.CategoryID} value={category.CategoryID}>
                        {category.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="minPrice"
                  label="Min Price"
                  name="minPrice"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="maxPrice"
                  label="Max Price"
                  name="maxPrice"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel id="has-photo-label">Has Photo</InputLabel>
                  <Select
                    labelId="has-photo-label"
                    id="hasPhoto"
                    name="hasPhoto"
                    value={filters.hasPhoto}
                    onChange={handleChange}
                    label="Has Photo"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={{ margin: '20px 0' }}
            >
              Search
            </Button>
          </form>
        </Box>
      </Paper>
      <Grid container spacing={4} style={{ marginTop: '20px' }}>
        {results.length === 0 ? (
          <Typography variant="h6" style={{ margin: '20px' }}>
            No results found.
          </Typography>
        ) : (
          results.map(ad => (
            <Grid item key={ad.AdID} xs={12} sm={6} md={4}>
              <Card>
                {ad.PhotoPath && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={ad.PhotoPath}
                    alt={ad.Title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {ad.Title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {ad.Price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default SearchAds;
