'use client'

import SectionTitle from "../components/SectionTitle"
import { DollarSignIcon, RocketIcon, CrownIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function PricingInfoSection() {

    const plans = [
        {
            icon: DollarSignIcon,
            title: "Starter Plan",
            price: "$9 / month",
            description: "Basic thumbnail generation with limited AI credits. Perfect for beginners starting their channel."
        },
        {
            icon: RocketIcon,
            title: "Pro Plan",
            price: "$19 / month",
            description: "Generate more thumbnails with advanced AI tools and priority processing."
        },
        {
            icon: CrownIcon,
            title: "Premium Plan",
            price: "$39 / month",
            description: "Unlimited thumbnail generation with all premium features and fastest AI processing."
        }
    ]

    return (
        <div id="pricing-info" className="px-4 md:px-16 lg:px-24 xl:px-32 py-24 bg-white">

            <SectionTitle
                text1="Our Pricing"
                text2="Simple Plans for Creators"
                text3="Choose a plan that fits your thumbnail creation needs."
            />

            <div className="flex flex-wrap justify-center gap-8 mt-20">

                {plans.map((item, index) => {
                    const Icon = item.icon

                    return (
                        <motion.div
                            key={index}
                            initial={{ y: 100, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: index * 0.2,
                                type: "spring",
                                stiffness: 200
                            }}
                            className="w-72 bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >

                            <div className="flex justify-center mb-4">
                                <Icon className="w-10 h-10 text-blue-600" />
                            </div>

                            <h3 className="text-xl font-semibold text-black">
                                {item.title}
                            </h3>

                            <p className="text-blue-600 font-semibold mt-2">
                                {item.price}
                            </p>

                            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                                {item.description}
                            </p>

                            {/* Pricing Button */}
                            <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                                Get Started
                            </button>

                        </motion.div>
                    )
                })}

            </div>
        </div>
    )
}