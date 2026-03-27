'use client'

import React, { useEffect, useState } from 'react';
import SoftBackdrop from './SoftBackdrop';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [state, setState] = useState<'login' | 'register'>('login');
    const { user, login, signUp } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (state === 'login') {
                await login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await signUp({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });
            }
        } catch (err: any) {
            console.log("ERROR:", err.response?.data);
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user]);

    return (
        <>
            <SoftBackdrop />

            <div className='min-h-screen flex items-center justify-center bg-white'>
                <form
                    onSubmit={handleSubmit}
                    className='w-full sm:w-96 text-center bg-white border border-gray-200 shadow-xl rounded-2xl px-8'
                >
                    <h1 className='text-gray-900 text-3xl mt-10 font-semibold'>
                        {state === 'login' ? 'Login' : 'Sign Up'}
                    </h1>

                    <p className='text-gray-500 text-sm mt-2'>
                        Please sign in to continue
                    </p>

                    {/* Name Field */}
                    {state !== 'login' && (
                        <div className='flex items-center mt-6 w-full border border-gray-300 focus-within:border-blue-500 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all'>
                            <input
                                type='text'
                                name='name'
                                placeholder='Name'
                                className='w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none'
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className='flex items-center w-full mt-4 border border-gray-300 focus-within:border-blue-500 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all'>
                        <input
                            type='email'
                            name='email'
                            placeholder='Email address'
                            className='w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className='flex items-center mt-4 w-full border border-gray-300 focus-within:border-blue-500 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all'>
                        <input
                            type='password'
                            name='password'
                            placeholder='Password'
                            className='w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className='mt-4 text-left'>
                        <button
                            type='button'
                            className='text-sm text-blue-600 hover:underline'
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        className='mt-4 w-full h-11 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition font-medium'
                    >
                        {state === 'login' ? 'Login' : 'Sign Up'}
                    </button>

                    {/* Toggle */}
                    <p
                        onClick={() =>
                            setState((prev) =>
                                prev === 'login' ? 'register' : 'login'
                            )
                        }
                        className='text-gray-500 text-sm mt-5 mb-10 cursor-pointer'
                    >
                        {state === 'login'
                            ? "Don't have an account?"
                            : 'Already have an account?'}
                        <span className='text-blue-600 hover:underline ml-1'>
                            Click here
                        </span>
                    </p>
                </form>
            </div>
        </>
    );
};

export default Login;