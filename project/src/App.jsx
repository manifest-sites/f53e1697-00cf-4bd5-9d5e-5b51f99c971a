import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import SquirrelApp from './components/SquirrelApp'

function App() {

  return (
    <Monetization>
      <SquirrelApp />
    </Monetization>
  )
}

export default App