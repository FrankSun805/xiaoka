import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "relative font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "w-full py-4 px-8 rounded-full bg-white text-black hover:bg-gray-100 shadow-xl shadow-white/10",
    secondary: "w-full py-4 px-8 rounded-full bg-surfaceHighlight text-white hover:bg-zinc-700",
    glass: "w-full py-4 px-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20",
    icon: "p-4 rounded-full bg-surfaceHighlight text-white hover:bg-zinc-700 aspect-square"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : children}
    </button>
  );
};