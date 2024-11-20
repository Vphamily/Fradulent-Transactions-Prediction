import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

function Form() {
  // State for storing form data
  const [formData, setFormData] = useState({
    type: 'PAYMENT',
    amount: '',
    oldbalanceOrg: '',
    newbalanceOrig: '',
    oldbalanceDest: '',
    newbalanceDest: ''
    
  });

  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle changes in text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to validate the form data
  const validateForm = () => {
    // Ensure no negative values for numerical fields
    for (const [key, value] of Object.entries(formData)) {
      if (key !== 'type' && Number(value) < 0) {
        setError(`${key} cannot be negative`);
        return false;
      }
    }
    return true;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const balance_change = Number(formData.oldbalanceOrg) - Number(formData.newbalanceOrig);
      const transaction_ratio = Number(formData.amount) / (Number(formData.oldbalanceOrg) + 1);

      const processedData = {
        ...formData,
        amount: Number(formData.amount), // Ensure numeric value
        oldbalanceOrg: Number(formData.oldbalanceOrg), // Ensure numeric value
        newbalanceOrig: Number(formData.newbalanceOrig), // Ensure numeric value
        oldbalanceDest: Number(formData.oldbalanceDest), // Ensure numeric value
        newbalanceDest: Number(formData.newbalanceDest), // Ensure numeric value
        balance_change,
        transaction_ratio,
      };
      console.log("Calculated values:", { balance_change, transaction_ratio });
      // Log the processedData after initialization
      console.log("Sending data:", processedData);
  
      const response = await axios.post('http://127.0.0.1:5000/predict', processedData);
      setPrediction(response.data);
      console.log("Response:", response.data);
    } catch (err) {
      setError('Error fetching prediction. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
      
  

  // JSX for the form
  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        mt: 4,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Fraud Detection
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          select
          label="Transaction Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          margin="normal"
          required
        >
          <MenuItem value="TRANSFER">TRANSFER</MenuItem>
          <MenuItem value="CASH_OUT">CASH_OUT</MenuItem>
          <MenuItem value="CASH_IN">CASH_IN</MenuItem>
          <MenuItem value="DEBIT">DEBIT</MenuItem>
          <MenuItem value="PAYMENT">PAYMENT</MenuItem>
          <MenuItem value="CREDIT">CREDIT</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          fullWidth
          label="Original Balance"
          name="oldbalanceOrg"
          type="number"
          value={formData.oldbalanceOrg}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          fullWidth
          label="New Original Balance"
          name="newbalanceOrig"
          type="number"
          value={formData.newbalanceOrig}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          fullWidth
          label="Destination Old Balance"
          name="oldbalanceDest"
          type="number"
          value={formData.oldbalanceDest}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <TextField
          fullWidth
          label="Destination New Balance"
          name="newbalanceDest"
          type="number"
          value={formData.newbalanceDest}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 0, step: "0.01" }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
        </Button>
      </form>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {prediction && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Prediction Result
          </Typography>
          <Typography variant="body1" color="primary" fontWeight="bold">
            Fraud Status: {prediction.prediction === 1 ? 'Fraudulent' : 'Not Fraudulent'}
          </Typography>
          <Typography variant="body2">
            Probability: {prediction.fraud_probability}
          </Typography>
          <Typography variant="body2">
            Risk Level: {prediction.transaction_details.risk_level}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Form;
