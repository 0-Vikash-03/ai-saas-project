'use client'
import SectionTitle from "../components/SectionTitle";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { featuresData } from "../data/features";
import type { IFeature } from "../types";
import heroImage from '../assets/ai.png';

export default function FeaturesSection() {
    return (
        <div id="features" className="px-4 md:px-16 lg:px-24 xl:px-32 py-20 bg-white">

            <SectionTitle
                text1="Features"
                text2="Why use our generator?"
                text3="Create stunning thumbnails that get clicks, without the hassle."
            />

            {/* Feature Cards */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-16 px-6">
                {featuresData.map((feature: IFeature, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 250 }}
                        className="max-w-80 w-full"
                    >
                        <div className="p-6 rounded-xl space-y-4 border border-gray-200 bg-white shadow-sm hover:shadow-md transition">

                            <img src={feature.icon} alt={feature.title} />

                            <h3 className="text-base font-semibold text-black">
                                {feature.title}
                            </h3>

                            <p className="text-gray-600 line-clamp-2 pb-4">
                                {feature.description}
                            </p>

                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Showcase Section */}
            <div className="mt-40 relative mx-auto max-w-5xl">

                {/* Blue glow background */}
                <div className="absolute -z-10 w-80 h-80 -top-10 -left-20 rounded-full bg-blue-400/30 blur-3xl"></div>

                <motion.p
                    className="text-gray-700 text-lg text-left max-w-3xl"
                    initial={{ y: 100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Our AI understands what makes a video go viral and designs thumbnails accordingly.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-10">

                    <motion.div
                        className="md:col-span-2"
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <img
                            className="h-full w-auto rounded-lg shadow-md"
                            src={heroImage}
                            alt="features showcase"
                        />
                    </motion.div>

                    <motion.div
                        className="md:col-span-1"
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                    >
                        <img
                            src="/assets/features-showcase-2.png"
                            alt="features showcase"
                            className="rounded-lg shadow-md hover:-translate-y-1 transition duration-300"
                        />

                        <h3 className="text-2xl font-semibold mt-6 text-black">
                            Boost your views with AI-optimized designs
                        </h3>

                        <p className="text-gray-600 mt-2">
                            Stop guessing and start ranking. Our AI creates designs proven to capture attention.
                        </p>

                        <a
                            href="#"
                            className="group flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 transition font-medium"
                        >
                            Start generating free
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition duration-300" />
                        </a>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}