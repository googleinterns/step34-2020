import React from 'react'
import TopNavbar from '../components/Navbar';
import MapView from '../components/MapView';

const MapViewPage = () => {
  return (
    <React.StrictMode>
      <TopNavbar />
      <MapView />
    </React.StrictMode>
  );
};

export default MapViewPage;