import { MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { isLoggedIn, user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <motion.nav
                className='fixed top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 bg-blue-700 border-b border-blue-600 backdrop-blur-md'
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 70 }}
            >
                <Link to='/'>
                    <img src='/logo.svg' alt='logo' className='h-8 w-auto' />
                </Link>

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center gap-8 text-white font-medium'>
                    <Link to='/' className='hover:text-gray-200 transition'>Home</Link>
                    <Link to='/generate' className='hover:text-gray-200 transition'>Generate</Link>
                    <Link to='/content-generator' className='hover:text-gray-200 transition'>Script AI</Link>
                    <Link to='/blog-generator' className='hover:text-gray-200 transition'>Blog AI</Link>
                    <Link to='/video-generator' className='hover:text-gray-200 transition'>Video AI</Link>

                    {isLoggedIn ? (
                        <>
                            <Link to='/my-generation' className='hover:text-gray-200 transition'>
                                My Generations
                            </Link>
                            <Link to='/my-videos' className='hover:text-gray-200 transition'>
                                My Videos
                            </Link>
                        </>
                    ) : (
                        <Link to='#' className='hover:text-gray-200 transition'>About</Link>
                    )}

                    <Link to='/#contact' className='hover:text-gray-200 transition'>Contact us</Link>
                </div>

                {/* Right Section */}
                <div className='flex items-center gap-3'>
                    {isLoggedIn ? (
                        <div className='relative group'>
                            <button className='rounded-full size-9 bg-blue-600 text-white font-semibold'>
                                {user?.name?.charAt(0).toUpperCase()}
                            </button>
                            <div className='absolute hidden group-hover:block top-10 right-0 pt-2'>
                                <button
                                    onClick={logout}
                                    className='bg-white border border-gray-200 px-5 py-1.5 rounded-lg shadow-md hover:bg-blue-50 transition'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className='hidden md:block px-6 py-2.5 bg-white text-blue-700 hover:bg-gray-200 active:scale-95 transition-all rounded-full font-medium'
                        >
                            Get Started
                        </button>
                    )}

                    <button onClick={() => setIsOpen(true)} className='md:hidden text-white'>
                        <MenuIcon size={26} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Link onClick={() => setIsOpen(false)} to='/'>Home</Link>
                <Link onClick={() => setIsOpen(false)} to='/generate'>Generate</Link>
                <Link onClick={() => setIsOpen(false)} to='/content-generator'>Script AI</Link>
                <Link onClick={() => setIsOpen(false)} to='/blog-generator'>Blog AI</Link>
                <Link onClick={() => setIsOpen(false)} to='/video-generator'>Video AI</Link>

                {isLoggedIn ? (
                    <>
                        <Link onClick={() => setIsOpen(false)} to='/my-generation'>
                            My Generations
                        </Link>
                        <Link onClick={() => setIsOpen(false)} to='/my-videos'>
                            My Videos
                        </Link>
                    </>
                ) : (
                    <Link onClick={() => setIsOpen(false)} to='#'>About</Link>
                )}

                <Link onClick={() => setIsOpen(false)} to='/#contact'>Contact us</Link>

                {isLoggedIn ? (
                    <button
                        onClick={() => { setIsOpen(false); logout(); }}
                        className='text-red-500'
                    >
                        Logout
                    </button>
                ) : (
                    <Link onClick={() => setIsOpen(false)} to='/login'>Login</Link>
                )}

                <button
                    onClick={() => setIsOpen(false)}
                    className='absolute top-6 right-6 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
                >
                    <XIcon />
                </button>
            </div>
        </>
    );
}