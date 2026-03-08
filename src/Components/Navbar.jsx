import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);

    const pages = [
        { name: "Home", path: "/" },
        { name: "Sessions", path: "/sessions" },
        { name: "Schedule", path: "/schedule" },
    ];

    const toggleMenu = () => setIsMenuOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMenuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                !hamburgerRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        const handleResize = () => {
            if (window.innerWidth >= 768) setIsMenuOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, [isMenuOpen]);

    const NavItem = ({ page, mobile, closeMenu }) => (
        <NavLink
            to={page.path}
            className={({ isActive }) => `
                flex items-center justify-center
                ${mobile ? 'w-full py-3' : 'px-4'}
                text-xl font-medium transition duration-300
                ${isActive ? 'text-black' : 'text-white hover:text-black'}
            `}
            onClick={closeMenu}
        >
            {page.name}
        </NavLink>
    );

    return (
        <nav className="sticky top-0 z-50 h-20 bg-red-600 shadow-md px-4 lg:px-6">
            <div className="flex justify-between items-center h-full max-w-7xl mx-auto">
                {/* Mobile Menu Button */}
                <button
                    ref={hamburgerRef}
                    onClick={toggleMenu}
                    className="md:hidden text-white hover:text-black transition cursor-pointer"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>

                {/* Logo */}
                <NavLink to="/" className="text-4xl md:text-6xl font-bold italic text-white">
                    F1
                </NavLink>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    {pages.map((page) => (
                        <NavItem key={page.path} page={page} />
                    ))}
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div 
                        ref={menuRef}
                        className="md:hidden absolute top-20 left-0 right-0 bg-red-600 z-50 py-4"
                        role="menu"
                    >
                        <div className="flex flex-col items-center gap-4">
                            {pages.map((page) => (
                                <NavItem 
                                    key={page.path} 
                                    page={page} 
                                    mobile
                                    closeMenu={() => setIsMenuOpen(false)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}