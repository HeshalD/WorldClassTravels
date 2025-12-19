import './App.css';
import { Routes, Route } from "react-router-dom"
import Header from "./Components/Header.jsx"      
import HeroSection from './Components/HeroSection.jsx';
import TicketingSection from './Components/TicketingSection.jsx';
import TravelSlider from './Components/TravelSlider.jsx';
import Footer from './Components/Footer.jsx';

function App() {

  return (
      <div className='w-full'>
        <HeroSection/>
        <TicketingSection/>
        <TravelSlider/>
        <Footer/>
      </div>
  );
}

export default App;
