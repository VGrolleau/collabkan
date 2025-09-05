// src/components/ThemeToggleButton.tsx
'use client';
import { useTheme } from '@/context/ThemeContext';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>; // <- ça accepte className, title, etc.

export default function ThemeToggleButton(props: Props) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button type="button" {...props} onClick={toggleTheme}>
            {theme === 'dark' ? '🌙' : '☀️'}
        </button>
    );
}