'use client'
import { CheckIcon, ChevronRightIcon, VideoIcon } from "lucide-react";
import TiltedImage from "../components/TiltImage";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {

    const navigate = useNavigate()

    const specialFeatures = [
        "No design skills needed",
        "Fast generation",
        "High CTR templates",
    ];

    return (
        <div className="relative flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 xl:px-32">

            {/* Blue Glow Background */}
            <div className="absolute top-30 -z-10 left-1/4 size-72 bg-blue-600 blur-[300px] opacity-30"></div>

            {/* Top Banner */}
            <motion.a
                href="#"
                className="group flex items-center gap-2 rounded-full p-1 pr-3 mt-44 text-blue-100 bg-blue-500/15"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <span className="bg-blue-700 text-white text-xs px-3.5 py-1 rounded-full">
                    NEW
                </span>
                <p className="flex items-center gap-1">
                    <span>Generate your first thumbnail for free</span>
                    <ChevronRightIcon size={16} className="group-hover:translate-x-0.5 transition duration-300" />
                </p>
            </motion.a>

            {/* Heading */}
            <motion.h1
                className="text-5xl/17 md:text-6xl/21 font-medium max-w-3xl text-center text-black"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                AI Thumbnail Generator for your{" "}
                <span className="bg-blue-600 text-white px-3 rounded-xl text-nowrap">
                    Videos.
                </span>
            </motion.h1>

            {/* Description */}
            <motion.p
                className="text-base text-center text-gray-600 max-w-lg mt-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                Stop wasting hours on design. Get high-converting thumbnails in seconds with our advanced AI.
            </motion.p>

            {/* Buttons */}
            <motion.div
                className="flex items-center gap-4 mt-8"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <button
                    onClick={() => navigate('/generate')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-7 h-11 transition"
                >
                    Generate now
                </button>

                <button className="flex items-center gap-2 border border-blue-300 hover:bg-blue-50 transition rounded-full px-6 h-11 text-blue-700">
                    <VideoIcon strokeWidth={1} />
                    <span>See how it works</span>
                </button>
            </motion.div>

            {/* Feature List */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-14 mt-12">
                {specialFeatures.map((feature, index) => (
                    <motion.p
                        className="flex items-center gap-2"
                        key={index}
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.3 }}
                    >
                        <CheckIcon className="size-5 text-blue-600" />
                        <span className="text-gray-600">{feature}</span>
                    </motion.p>
                ))}
            </div>

            <TiltedImage />
        </div>
    );
}