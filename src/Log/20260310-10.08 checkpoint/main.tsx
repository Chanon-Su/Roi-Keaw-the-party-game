import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Menu from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    {/* <Board />  */}
    {/* <Testtherow /> */}
    <Menu />
    {/* <Game /> */}
  </StrictMode>,
)