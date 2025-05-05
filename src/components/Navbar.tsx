import React from 'react'
import NextLink from 'next/link';
import Image from 'next/image';
import Logo from '../assets/nutm-logo.jpg';

const Navbar = () => {
  return (
    <header className="w-full z-50  p-4">
          {/* Logo */}
          <NextLink href="/" className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </NextLink>

         

        
     
    </header>
  )
}

export default Navbar