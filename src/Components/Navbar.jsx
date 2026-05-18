import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";

const navVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 20 } },
};

const linkVariants = {
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400 } },
  tap: { scale: 0.95 },
};

const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

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
        <motion.div
            variants={linkVariants}
            whileHover="hover"
            whileTap="tap"
        >
            <NavLink
                to={page.path}
                className={({ isActive }) => `
                    flex items-center justify-center
                    ${mobile ? 'w-full py-3' : 'px-4'}
                    text-xl font-medium transition-colors duration-300
                    ${isActive ? 'text-black' : 'text-white hover:text-black'}
                `}
                onClick={closeMenu}
            >
                {page.name}
            </NavLink>
        </motion.div>
    );

    return (
        <motion.nav
            variants={navVariants}
            initial="hidden"
            animate="visible"
            className="sticky top-0 z-50 h-20 bg-red-600 shadow-lg px-4 lg:px-6"
        >
            <div className="flex justify-between items-center h-full max-w-7xl mx-auto">
                <button
                    ref={hamburgerRef}
                    onClick={toggleMenu}
                    className="md:hidden text-white hover:text-black transition-colors duration-300 cursor-pointer"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                >
                    <motion.div
                        key={isMenuOpen ? "close" : "menu"}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                    </motion.div>
                </button>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <NavLink to="/" className="text-4xl md:text-6xl font-bold italic text-white block">
                        F1
                    </NavLink>
                </motion.div>

                <div className="hidden md:flex items-center gap-4">
                    {pages.map((page) => (
                        <NavItem key={page.path} page={page} />
                    ))}
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            ref={menuRef}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="md:hidden absolute top-20 left-0 right-0 bg-red-600 z-50 overflow-hidden"
                            role="menu"
                        >
                            <div className="flex flex-col items-center gap-4 py-4">
                                {pages.map((page) => (
                                    <NavItem
                                        key={page.path}
                                        page={page}
                                        mobile
                                        closeMenu={() => setIsMenuOpen(false)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
}
