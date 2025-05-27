'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';


const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [form, setForm] = useState({
    studentName: '',
    studentEmail: '',
    regNumber: '',         // Add this
    program: 'undergraduate',
    hostel: false,
    scholarship: false,
    scholarshipAmount: 0,
    paymentPlan: 'full',
  });

  const [invoice, setInvoice] = useState<any>(null);
  const router = useRouter();
  const generateInvoice = async () => {
    let tuition = 0;
    let acceptanceFee = 0;
    let hostelFee = 0;

    if (form.program === 'undergraduate') {
      tuition = 2000000;
      acceptanceFee = tuition * 0.1;
    } else if (form.program === 'postgraduate') {
      tuition = form.paymentPlan === 'installment' ? 2000000 : 8000000;
    }

    if (form.hostel) {
      hostelFee = form.paymentPlan === 'installment' ? 375000 : 750000;
    }

    const percentage = form.scholarship ? form.scholarshipAmount : 0;
    const scholarshipDiscount = (percentage / 100) * tuition;
    const total = tuition + acceptanceFee + hostelFee - scholarshipDiscount;

    const invoiceData = {
      ...form,
      tuition,
      acceptanceFee,
      hostelFee,
      scholarshipDiscount,
      total,
    };

    // POST to your backend (Node.js route)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    const result = await res.json();
    console.log('result', result);
    if (res.ok) {
      router.push(`/invoice/${result._id}`);
    } else {
      alert('Error creating invoice');
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <motion.h1
        className="text-4xl font-bold text-green-700 mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Invoice Generator
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-8 shadow-md border border-green-500">
          <CardContent className="space-y-5 pt-6">
            <Input
              type='text'
              placeholder="Student Name"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className="border-green-300 focus:ring-green-500"
            />
            <Input
              type='email'
              placeholder="Student Email"
              value={form.studentEmail}
              onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
              className="border-green-300 focus:ring-green-500"
            />
            <Input
              type='text'
              placeholder="Reg Number"
              value={form.regNumber}
              onChange={(e) => setForm({ ...form, regNumber: e.target.value })}
              className="border-green-300 focus:ring-green-500"
            />

            <Select
              value={form.program}
              onValueChange={(val) => setForm({ ...form, program: val })}
            >
              <SelectTrigger className="w-full border-green-300 focus:ring-green-500">
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent className='bg-green-100 rounded-md shadow-lg border border-green-300 z-50'>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={form.paymentPlan}
              onValueChange={(val) => setForm({ ...form, paymentPlan: val })}
            >
              <SelectTrigger className="w-full border-green-300 focus:ring-green-500">
                <SelectValue placeholder="Select Payment Plan" />
              </SelectTrigger>
              <SelectContent className='bg-green-100 rounded-md shadow-lg border border-green-300 z-50'>
                <SelectItem value="full">Full Payment</SelectItem>
                <SelectItem value="installment">Per Semester</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.hostel}
                onCheckedChange={(val) =>
                  setForm({ ...form, hostel: val as boolean })
                }
                className="border-green-400"
              />
              <label className="text-green-800">Include Hostel</label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.scholarship}
                onCheckedChange={(val) =>
                  setForm({ ...form, scholarship: val as boolean })
                }
                className="border-green-400"
              />
              <label className="text-green-800">Apply Scholarship</label>
            </div>

            {form.scholarship && (
              <Input
                type="number"
                placeholder="Scholarship Amount"
                value={form.scholarshipAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    scholarshipAmount: Number(e.target.value),
                  })
                }
                className="border-green-300"
              />
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer"
              onClick={generateInvoice}
            >
              Generate Invoice
            </Button>
          </CardContent>
        </Card>
      </motion.div>


    </main>
  );
}
