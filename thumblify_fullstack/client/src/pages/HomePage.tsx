import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from '../sections/HeroSection';
import FeaturesSection from '../sections/FeaturesSection';
import TestimonialSection from '../sections/TestimonialSection';
import PricingSection from '../sections/PricingSection';
import ContactSection from '../sections/ContactSection';
import CTASection from '../sections/CTASection';

export default function HomePage() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [location]);

    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <TestimonialSection />
            <PricingSection />
            <ContactSection />
            <CTASection />
        </>
    );
}