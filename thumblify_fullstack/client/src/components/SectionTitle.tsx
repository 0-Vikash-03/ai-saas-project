import type { SectionTitleProps } from '../types';
import { motion } from 'framer-motion';

export default function SectionTitle({ text1, text2, text3 }: SectionTitleProps) {
    return (
        <>
            {/* Badge */}
            <motion.p
                className="text-center font-medium text-blue-600 mt-28 px-6 py-2 rounded-full bg-blue-50 border border-blue-200 w-max mx-auto"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 250 }}
            >
                {text1}
            </motion.p>

            {/* Heading */}
            <motion.h3
                className="text-3xl md:text-4xl font-semibold text-black text-center mx-auto mt-4"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 220 }}
            >
                {text2}
            </motion.h3>

            {/* Description */}
            <motion.p
                className="text-gray-600 text-center mt-3 max-w-xl mx-auto"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                {text3}
            </motion.p>
        </>
    );
}