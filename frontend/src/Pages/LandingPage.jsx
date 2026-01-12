import React from 'react'
import HeroSection from '../Components/HeroSection.jsx';
import TicketingSection from '../Components/TicketingSection.jsx';
import TravelSlider from '../Components/TravelSlider.jsx';
import Footer from '../Components/Footer.jsx';
import WhyChooseUs from '../Components/WhyChooseUs.jsx';
import CurvedLoop from '../Components/CurvedLetters.jsx';

function LandingPage() {
  return (
    <div>
      <HeroSection />
      <WhyChooseUs />
      <TicketingSection />
      <CurvedLoop
        marqueeText="| Get Ready For Your Next Adventure | Book Your Dream Vacation Today  "
        speed={2}
        curveAmount={0}
        direction="right"
        interactive={true}
        className="custom-text-style"
      />
      <TravelSlider />
      <Footer />
    </div>
  )
}

export default LandingPage