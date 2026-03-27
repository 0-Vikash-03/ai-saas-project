import { MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth(); // ✅ FIXED
    const isLoggedIn = !!user; // ✅ derive login state

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
                {/* Logo */}
                <Link to='/'>
                    <img src='/logo.svg' alt='logo' className='h-8 w-auto' />
                </Link>

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center gap-8 text-white font-medium'>
                    <Link to='/'>Home</Link>
                    <Link to='/generate'>Generate</Link>
                    <Link to='/content-generator'>Script AI</Link>
                    <Link to='/blog-generator'>Blog AI</Link>
                    <Link to='/video-generator'>Video AI</Link>

                    {isLoggedIn && (
                        <>
                            <Link to='/my-generation'>My Generations</Link>
                            <Link to='/my-videos'>My Videos</Link>
                        </>
                    )}

                    <Link to='/#contact'>Contact</Link>
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
                                    className='bg-white px-5 py-1.5 rounded-lg shadow-md'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')} // ✅ FIXED NAVIGATION
                            className='hidden md:block px-6 py-2.5 bg-white text-blue-700 rounded-full font-medium'
                        >
                            Get Started
                        </button>
                    )}

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsOpen(true)} className='md:hidden text-white'>
                        <MenuIcon size={26} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-8 md:hidden transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Link onClick={() => setIsOpen(false)} to='/'>Home</Link>
                <Link onClick={() => setIsOpen(false)} to='/generate'>Generate</Link>
                <Link onClick={() => setIsOpen(false)} to='/content-generator'>Script AI</Link>
                <Link onClick={() => setIsOpen(false)} to='/blog-generator'>Blog AI</Link>
                <Link onClick={() => setIsOpen(false)} to='/video-generator'>Video AI</Link>

                {isLoggedIn && (
                    <>
                        <Link onClick={() => setIsOpen(false)} to='/my-generation'>
                            My Generations
                        </Link>
                        <Link onClick={() => setIsOpen(false)} to='/my-videos'>
                            My Videos
                        </Link>
                    </>
                )}

                <Link onClick={() => setIsOpen(false)} to='/#contact'>Contact</Link>

                {isLoggedIn ? (
                    <button
                        onClick={() => {
                            logout();
                            setIsOpen(false);
                        }}
                        className='text-red-500'
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            navigate('/login');
                            setIsOpen(false);
                        }}
                        className='text-blue-600 font-medium'
                    >
                        Login / Get Started
                    </button>
                )}

                <button
                    onClick={() => setIsOpen(false)}
                    className='absolute top-6 right-6 p-2 bg-blue-600 text-white rounded-lg'
                >
                    <XIcon />
                </button>
            </div>
        </>
    );
}