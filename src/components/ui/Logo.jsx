import { useTheme } from '../../context/ThemeContext.jsx';

const Logo = ({ size = 'default' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Size classes based on prop
  const sizeClasses = {
    small: 'text-xl',
    default: 'text-2xl',
    large: 'text-3xl',
  };
  
  return (
    <div className="flex items-center">
      <span className={`font-bold ${sizeClasses[size] || sizeClasses.default}`}>
        <span className="text-primary-600 dark:text-primary-500">Fit</span>
        <span>Club</span>
      </span>
    </div>
  );
};

export default Logo;