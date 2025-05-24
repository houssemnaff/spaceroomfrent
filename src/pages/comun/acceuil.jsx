import React, { useState } from "react";
import Navbar from "../../components/layouts/navbar";
import { Hero } from "../../components/Hero";
import { Avis } from "../../components/avis";
import { CTASection } from "../../components/CTASection";
import { Footer } from "../../components/Footer";
import { Features } from "../../components/Features";



const Acceuil = () => {


  return (
    <>
      <Navbar />
      <Hero />
      <Features />
    
      <CTASection />
      <Footer />
    </>
  );
}
export default Acceuil;
