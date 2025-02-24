import React from 'react'
import Header from '../components/Header'
import Steps from '../components/Steps'
import Description from '../components/Description'
import Textimonials from '../components/Textimonials'
import GenerateBtn from '../components/GenerateBtn'

const Home = () => {
  return (
    <div>
      <Header/>
      <Steps/>
      <Description/>
      <Textimonials/>
      <GenerateBtn/>
    </div>
  )
}

export default Home
