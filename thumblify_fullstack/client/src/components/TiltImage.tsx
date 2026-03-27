import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import heroImage from '../assets/hero_img.png';

const springValues = {
    damping: 30,
    stiffness: 100,
    mass: 2,
};

export default function TiltedImage({ rotateAmplitude = 3 }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useMotionValue(0), springValues);
    const rotateY = useSpring(useMotionValue(0), springValues);
    const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

    const [lastY, setLastY] = useState(0);

    function handleMouse(e: any) {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;

        const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

        rotateX.set(rotationX);
        rotateY.set(rotationY);

        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);

        const velocityY = offsetY - lastY;
        rotateFigcaption.set(-velocityY * 0.6);
        setLastY(offsetY);
    }

    function handleMouseLeave() {
        rotateX.set(0);
        rotateY.set(0);
        rotateFigcaption.set(0);
    }

    return (
        <motion.figure
            ref={ref}
            className='relative w-full h-full mt-16 max-w-4xl mx-auto flex flex-col items-center justify-center'
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 320, damping: 70, mass: 1 }}
        >
            <motion.div
                className='relative w-full max-w-4xl'
                style={{ rotateX, rotateY }}
            >
                {/* Blue Glow Border */}
                <div className="p-[2px] rounded-[16px] bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
                    <motion.img
                        src={heroImage}
                        className='w-full rounded-[14px] bg-black'
                        alt='hero section showcase'
                    />
                </div>
            </motion.div>
        </motion.figure>
    );
}