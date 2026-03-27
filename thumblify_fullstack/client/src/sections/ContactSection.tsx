'use client'
import { useState } from "react"
import SectionTitle from "../components/SectionTitle";
import { ArrowRightIcon, MailIcon, UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactSection() {

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const form = e.currentTarget
        setLoading(true)

        const formData = new FormData(form)

        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
        }

        try {
            const res = await fetch("http://localhost:3000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (result.success) {
                alert("Message saved successfully!")
                form.reset()
            } else {
                alert(result.message || "Something went wrong")
            }

        } catch (error) {
            console.error(error)
            alert("Server error")
        }

        setLoading(false)
    }

    return (
        <div id="contact" className="px-4 md:px-16 lg:px-24 xl:px-32 py-20 bg-white">

            <SectionTitle
                text1="Contact"
                text2="Grow your channel"
                text3="Have questions about our AI? Ready to scale your views? Let's talk."
            />

            <form
                onSubmit={handleSubmit}
                className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto mt-16 w-full"
            >

                {/* Name */}
                <motion.div initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <p className="mb-2 font-medium text-black">Your name</p>
                    <div className="flex items-center pl-3 rounded-lg border border-gray-300 focus-within:border-blue-600 bg-white shadow-sm">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="Enter your name"
                            className="w-full p-3 outline-none bg-transparent text-black"
                        />
                    </div>
                </motion.div>

                {/* Email */}
                <motion.div initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <p className="mb-2 font-medium text-black">Email id</p>
                    <div className="flex items-center pl-3 rounded-lg border border-gray-300 focus-within:border-blue-600 bg-white shadow-sm">
                        <MailIcon className="w-5 h-5 text-gray-500" />
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="Enter your email"
                            className="w-full p-3 outline-none bg-transparent text-black"
                        />
                    </div>
                </motion.div>

                {/* Message */}
                <motion.div className="sm:col-span-2" initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <p className="mb-2 font-medium text-black">Message</p>
                    <textarea
                        name="message"
                        rows={6}
                        required
                        placeholder="Enter your message"
                        className="resize-none w-full p-3 outline-none rounded-lg border border-gray-300 bg-white text-black focus:border-blue-600 shadow-sm"
                    />
                </motion.div>

                {/* Button */}
                <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-max flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-full transition-all disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Submit"}
                    <ArrowRightIcon className="w-5 h-5" />
                </motion.button>

            </form>
        </div>
    )
}