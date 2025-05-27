'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-8">
      <motion.div
        className="text-center w-full max-w-2xl space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 leading-tight px-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Effortless Invoice Generation for Students
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-green-900 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Quickly create and manage student invoices with our streamlined, intuitive tool.
        </motion.p>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-5 sm:px-6 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold shadow-md transition-all duration-300"
            onClick={() => router.push('/invoice/new')}
          >
            Create New Invoice
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
