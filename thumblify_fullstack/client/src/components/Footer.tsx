import { footerData } from '../data/footer';
import { DribbbleIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { IFooterLink } from '../types';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className='bg-blue-700 border-t border-blue-600 flex flex-wrap justify-center md:justify-between overflow-hidden gap-10 md:gap-20 mt-40 py-12 px-6 md:px-16 lg:px-24 xl:px-32 text-sm text-white'>
            
            {/* LEFT SECTION */}
            <motion.div
                className='flex flex-wrap items-start gap-10 md:gap-32'
                initial={{ x: -150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 70 }}
            >
                <Link to='/'>
                    <img
                        className='size-9'
                        src='/favicon.svg'
                        alt='footer logo'
                    />
                </Link>

                {footerData.map((section, index) => (
                    <div key={index}>
                        <p className='text-white font-semibold'>
                            {section.title}
                        </p>

                        <ul className='mt-3 space-y-2'>
                            {section.links.map((link: IFooterLink, index: number) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className='text-blue-100 hover:text-white transition'
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.div>

            {/* RIGHT SECTION */}
            <motion.div
                className='flex flex-col max-md:items-center max-md:text-center gap-3 items-end'
                initial={{ x: 150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 70 }}
            >
                <p className='max-w-64 text-blue-100'>
                    Making every creator grow faster with AI-powered thumbnails.
                </p>

                <div className='flex items-center gap-4 mt-2'>
                    <a href='#' target='_blank' rel='noreferrer'>
                        <DribbbleIcon className='size-5 text-blue-100 hover:text-white transition' />
                    </a>

                    <a href='#' target='_blank' rel='noreferrer'>
                        <LinkedinIcon className='size-5 text-blue-100 hover:text-white transition' />
                    </a>

                    <a href='#' target='_blank' rel='noreferrer'>
                        <TwitterIcon className='size-5 text-blue-100 hover:text-white transition' />
                    </a>

                    <a href='#' target='_blank' rel='noreferrer'>
                        <YoutubeIcon className='size-6 text-blue-100 hover:text-white transition' />
                    </a>
                </div>

                <p className='mt-4 text-blue-200 text-sm'>
                    © {new Date().getFullYear()} Thumblify - Vikash
                </p>
            </motion.div>
        </footer>
    );
}