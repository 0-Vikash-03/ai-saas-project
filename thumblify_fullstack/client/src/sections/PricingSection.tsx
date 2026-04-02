'use client'

import SectionTitle from "../components/SectionTitle"
import { DollarSignIcon, RocketIcon, CrownIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function PricingSection() {

    const BASE_URL =
        import.meta.env.VITE_API_URL ||
        "https://ai-saas-project-66sm.onrender.com";

    const plans = [
        {
            icon: DollarSignIcon,
            title: "Starter Plan",
            price: 9
        },
        {
            icon: RocketIcon,
            title: "Pro Plan",
            price: 19
        },
        {
            icon: CrownIcon,
            title: "Premium Plan",
            price: 39
        }
    ];

    // ✅ Dummy Payment Function
    const handlePayment = async (plan: any) => {
        alert(`Processing payment for ${plan.title}...`);

        try {
            const res = await fetch(`${BASE_URL}/api/payment/pay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    plan: plan.title,
                    amount: plan.price,
                    userId: "demoUser"
                })
            });

            if (!res.ok) {
                throw new Error("Request failed");
            }

            const data = await res.json();

            if (data.status === "success") {
                localStorage.setItem("userPlan", plan.title);
                localStorage.setItem("txnId", data.transactionId);

                alert(`✅ Payment Successful!\nPlan: ${plan.title}`);

                window.location.href = "/dashboard";
            } else {
                alert("❌ Payment Failed!");
            }

        } catch (error) {
            console.error("Payment Error:", error);
            alert("❌ Server error! Check backend.");
        }
    };

    return (
        <div
            id="pricing-info"
            className="px-4 md:px-16 lg:px-24 xl:px-32 py-24 bg-white"
        >

            <SectionTitle
                text1="Our Pricing"
                text2="Simple Plans for Creators"
                text3="Choose a plan that fits your needs."
            />

            <div className="flex flex-wrap justify-center gap-8 mt-20">

                {plans.map((item, index) => {
                    const Icon = item.icon;

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
                                ${item.price} / month
                            </p>

                            {/* ✅ PAYMENT BUTTON */}
                            <button
                                onClick={() => handlePayment(item)}
                                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Buy Now
                            </button>

                        </motion.div>
                    );
                })}

            </div>
        </div>
    );
}