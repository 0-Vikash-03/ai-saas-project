'use client'
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CTASection() {

    const navigate = useNavigate()

    return (
        <motion.div
            className="max-w-5xl py-16 mt-40 md:pl-20 md:w-full max-md:mx-4 md:mx-auto 
            flex flex-col md:flex-row max-md:gap-6 items-center justify-between 
            text-left bg-gradient-to-r from-blue-600 to-blue-700 
            rounded-2xl p-8 text-white shadow-xl"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >

            <div>
                <motion.h1
                    className="text-4xl md:text-[46px] md:leading-tight font-semibold"
                    initial={{ y: 80, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
                >
                    Ready to go viral?
                </motion.h1>

                <motion.p
                    className="text-lg mt-3 text-blue-100"
                    initial={{ y: 80, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
                >
                    Join thousands of creators using AI to boost their CTR.
                </motion.p>
            </div>

            <motion.button
                onClick={() => navigate('/generate')}
                className="px-12 py-3 bg-white text-blue-700 font-medium 
                hover:bg-blue-50 transition-all rounded-full text-sm mt-4 md:mt-0 shadow-md"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                Generate Free Thumbnail
            </motion.button>

        </motion.div>
    );
}