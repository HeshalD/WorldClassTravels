import React, { useState } from 'react'
import VisaSelect from '../Components/VisaSelect'
import Footer from '../Components/Footer'
import VisaHero from '../Components/VisaHero'
function SelectVisaPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
        <VisaHero searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
        <VisaSelect searchQuery={searchQuery}/>
        <Footer/>
    </div>
  )
}

export default SelectVisaPage
