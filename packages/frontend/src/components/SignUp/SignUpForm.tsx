import React, { useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

interface SignUpFormData {
  email: string;
  password: string;
  name: string;
}

const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    name: '',
  });
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [bitcoinAddress, setBitcoinAddress] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token) => {
      try {
        // Exchange public token for access token and create bitcoin address
        const response = await axios.post('/api/complete-signup', { public_token });
        setBitcoinAddress(response.data.bitcoinAddress);
      } catch (error) {
        console.error('Error completing signup:', error);
      }
    },
    onExit: () => {
      // Handle the case when user exits Plaid Link
      console.log('User exited Plaid Link');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, create the user account
      const response = await axios.post('/api/signup', formData);
      
      // If signup successful, get Plaid link token
      if (response.data.success) {
        const linkTokenResponse = await axios.post('/api/create-link-token');
        setLinkToken(linkTokenResponse.data.link_token);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md bg-white text-gray-900 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md bg-white text-gray-900 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md bg-white text-gray-900 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {!linkToken && (
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        )}
      </form>

      {linkToken && !bitcoinAddress && (
        <button
          onClick={() => ready && open()}
          disabled={!ready}
          className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Link Bank Account
        </button>
      )}

      {bitcoinAddress && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-green-800">Account created successfully!</p>
          <p className="text-sm text-green-600 mt-2">
            Your Bitcoin address: {bitcoinAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;
