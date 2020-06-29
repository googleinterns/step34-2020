import React from 'react';
import TopNavbar from './Navbar';

const Profile = () => {
  return (
    <div>
      <TopNavbar />
      <div style={{
          display:"flex",
          margin:"100px 40px"}}>
        <div className="profilephoto">
          <img style={{width:"180px", height:"180px", borderRadius:"80px"}}
          src="https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60"/>
          <h4><br /> Tim</h4>
        </div>
        <div className="events">

        </div>
      </div>
    </div>
  )	
}

export default Profile;