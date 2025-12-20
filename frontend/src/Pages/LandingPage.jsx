import React from 'react'
import HeroSection from '../Components/HeroSection.jsx';
import TicketingSection from '../Components/TicketingSection.jsx';
import TravelSlider from '../Components/TravelSlider.jsx';
import Footer from '../Components/Footer.jsx';

function LandingPage() {
  return (
    <div>
        <HeroSection/>
        <TicketingSection/>
        <TravelSlider/>
        <Footer/>
    </div>
  )
}

export default LandingPage