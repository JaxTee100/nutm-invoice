'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <motion.div
        className="text-center max-w-xl space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-5xl font-bold text-green-700 leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Effortless Invoice Generation for Students
        </motion.h1>

        <motion.p
          className="text-green-900 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Quickly create and manage student invoices with our streamlined, intuitive tool.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-6 cursor-pointer rounded-full text-lg font-semibold shadow-md"
            onClick={() => router.push('/invoice/new')}
          >
            Create New Invoice
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
