'use client';

import React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import Logo from '../assets/nutm-logo.jpg';

const Navbar = () => {
  return (
    <header className="w-full z-50 px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between bg-white shadow-md">
      {/* Logo */}
      <NextLink href="/" className="flex items-center gap-3">
        <Image
          src={Logo}
          alt="Logo"
          width={120}
          height={120}
          className="object-contain w-24 h-auto sm:w-32"
          priority
        />
      </NextLink>

      {/* Invoice Link */}
      <NextLink href="/invoice" className="text-lg sm:text-2xl font-bold text-green-700 hover:text-green-800 transition-colors duration-200">
        INVOICE
      </NextLink>
    </header>
  );
};

export default Navbar;
