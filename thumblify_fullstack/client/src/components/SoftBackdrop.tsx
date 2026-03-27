const SoftBackdrop = () => {
    return (
        <div className='fixed inset-0 -z-10 pointer-events-none'>

            {/* Top Center Glow */}
            <div className='absolute left-1/2 top-20 -translate-x-1/2 w-[600px] h-[300px] 
                bg-gradient-to-tr from-blue-400/30 to-transparent 
                rounded-full blur-3xl' 
            />

            {/* Bottom Right Glow */}
            <div className='absolute right-12 bottom-10 w-[350px] h-[200px] 
                bg-gradient-to-bl from-blue-300/30 to-transparent 
                rounded-full blur-2xl' 
            />

        </div>
    );
};

export default SoftBackdrop;