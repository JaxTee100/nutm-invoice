'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Invoice {
  _id: string;
  studentName: string;
  invoiceNumber: string;
  total: number;
  createdAt: string;
}
const baseApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${baseApi}/api/invoices`);
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error loading invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDelete = async (_id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this invoice?');
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`${baseApi}/api/invoices/${_id}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) throw new Error('Failed to delete invoice');
  
      // Update UI by removing the deleted invoice using _id
      setInvoices((prev) => prev.filter((invoice) => invoice._id !== _id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center text-emerald-700 mb-8"
      >
        Invoice Manager
      </motion.h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p className="text-center text-gray-500">No invoices found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl">
          <table className="min-w-full bg-white rounded-xl overflow-hidden">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Student Name</th>
                <th className="px-6 py-3 text-left">Invoice #</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {invoices.map((invoice, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="border-b hover:bg-lime-50"
                  >
                    <td className="px-6 py-4 font-medium">{invoice.studentName}</td>
                    <td className="px-6 py-4">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-emerald-700 font-semibold">
                      ₦{invoice.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {/* <Link href={`/invoice/${invoice.id}`}>
                        <button className="bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600 transition duration-200">
                          Update
                        </button>
                      </Link> */}
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
