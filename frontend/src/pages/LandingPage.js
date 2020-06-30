import React from 'react'
import Welcome from '../components/welcome';
import TopNavbar from '../Navbar'

const LandingPage = () => {
  return (
    <React.StrictMode>
      <TopNavbar />
      <Welcome />
    </React.StrictMode>
  );
};

export default LandingPage;