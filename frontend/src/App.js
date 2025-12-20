import './App.css';
import { Routes, Route } from "react-router-dom"
import LandingPage from './Pages/LandingPage';   


function App() {

  return (
      <div className='w-full'>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
        </Routes>
      </div>
  );
}

export default App;
