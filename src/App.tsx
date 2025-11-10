
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Second from './pages/Second'
import Chatbot1 from './components/Chatbot1'
import EmbedBot from './pages/EmbedBot'
function App() {

  return (
    <BrowserRouter>
    {/* <header>
      <Link to={'/'}>Home</Link>
      <Link to={'/second'}>Second</Link>
    </header> */}
    <Routes>
      <Route element={<Home />} path='/'/>
      <Route element={<Second />} path='/second'/>
      <Route element={<Chatbot1 theme='dark' type='first' domain={'E-learning'} data='Platform name: Ed-T platform , mentors: alice and bob , address: new delhi , 440026 ,  courses: mern stack , java full stack , alice teaches mern and bob teaches java'/>} path='/widget'/>
      <Route element={<EmbedBot />}  path='/embed' />
    </Routes>
    </BrowserRouter>
  )
}

export default App
