'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

const baseApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await fetch(`${baseApi}/api/invoices/${id}`);
      const data = await res.json();
      setInvoice(data);
    };

    const loadLogo = async () => {
      const res = await fetch('/nutm-logo.jpg');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(blob);
    };

    fetchInvoice();
    loadLogo();
  }, [id]);

  const generatePDF = (): Blob | undefined => {
    if (!invoice || !logoDataUrl) return;
  
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
    // Add logo (base64 image)
    doc.addImage(logoDataUrl, 'JPG', 14, 10, 30, 15);
  
    // INVOICE heading
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 170, 12);
  
    
  
    // Invoice and dates
    doc.setFontSize(10);
    doc.text(`Invoice Date: January 20, 2025`, 150, 20);
    doc.text(`Due Date: February 05, 2025`, 150, 25);

    // Header info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Nigerian University of Technology and Management', 95, 35);
    doc.setFontSize(12);
    doc.text('6, Freetown Road Apapa Lagos, Nigeria.', 132, 40);
    doc.text('Email: bursar@nutm.edu.ng', 150, 45);
  
    // BILL TO
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`${invoice.studentName}`, 14, 50);
  
    
  
    // Amount Due
    doc.setFontSize(12);
    doc.text(`Amount Due: ₦${Number(invoice.total).toLocaleString()}`, 120, 54);
  
    // Table
    autoTable(doc, {
      startY: 60,
      head: [['Description', 'Quantity', 'Rate (₦)', 'Amount (₦)']],
      body: [
        ['Tuition Fee balance - Year 1', '1', `${invoice.tuition}`, `${invoice.tuition}`],
        ['Hostel Fee balance - Year 1', '1', `${invoice.hostelFee && invoice.hostelFee}`, `${invoice.hostelFee}`],
        ['Hostel Fee balance - Year 1', '1', `${invoice.acceptanceFee && invoice.acceptanceFee}`, `${invoice.acceptanceFee}`],
      ],
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: 255,
        halign: 'left',
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });
  
    // Summary: Total and Amount Due
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total', 150, y);
    doc.text(`${invoice.total}`, 200, y, { align: 'right' });
  
    y += 6;
    doc.text('Amount Due', 150, y);
    doc.text(`${invoice.total}`, 200, y, { align: 'right' });
  
    // Terms & Conditions
    y += 10;
    doc.setFontSize(11);
    doc.text('TERMS & CONDITIONS', 14, y);
    y += 6;
    doc.setFontSize(9);
    const terms = [
      '1. All fees are listed in naira, unless otherwise stated',
      '2. Payments should be made according to the following account details for each respective fee type:',
      '   Accommodation Fee:',
      '   Bank: Union Bank of Nigeria',
      '   Account Name: STEM Institute of Learning Ltd/Gte',
      '   Account Number: 0107033739',
      '   Acceptance & Tuition Fee:',
      '   Bank: Zenith Bank Plc.',
      '   Account Name: STEM Institute of Learning Ltd/Gte',
      '   Account Number: 1016804002',
      '3. Each student is responsible for ensuring that the total balance on their student account is settled.',
      '4. For any inquiries or assistance, please contact:',
      '   Email: bursar@nutm.edu.ng',
      '   Phone: 07064399591',
    ];
    terms.forEach((line, i) => {
      doc.text(line, 14, y + i * 5);
    });
  
    // Footer note
    y += terms.length * 5 + 10;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(
      'STEM Institute of Learning Ltd/Gte is the promoter of the Nigerian University of Technology and Management',
      14,
      y
    );
  
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    return doc.output('blob');
  };
  

  const sendEmail = async () => {
    if (!invoice) return;
    const pdfBlob = generatePDF();
    if (!pdfBlob) return alert('Failed to generate the PDF.');

    const formData = new FormData();
    formData.append('pdf', pdfBlob, `invoice-${invoice._id}.pdf`);

    try {
      const res = await fetch(`${baseApi}/api/email/${invoice._id}/send`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Invoice sent via email!');
      } else {
        alert('Error sending email: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong while sending the email.');
    }
  };

  if (!invoice) return <p className="text-center text-green-700 animate-pulse">Loading Invoice...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 bg-green-50 rounded-2xl shadow-lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold text-green-800 mb-6">Invoice for {invoice.studentName}</h1>

        <Table>
          <TableHeader>
            <TableRow className="bg-green-200">
              <TableHead className="text-green-900">Field</TableHead>
              <TableHead className="text-green-900">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>{invoice.studentEmail}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Registration No</TableCell>
              <TableCell>{invoice.regNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Program</TableCell>
              <TableCell>{invoice.program}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tuition</TableCell>
              <TableCell>₦{invoice.tuition.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Hostel</TableCell>
              <TableCell>₦{invoice.hostelFee.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Scholarship Discount</TableCell>
              <TableCell className="text-red-500">-₦{invoice.scholarshipDiscount.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="bg-green-100 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-green-700 text-xl">₦{invoice.total.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-6 flex gap-4">
          <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 text-white">
            Download PDF
          </Button>
          <Button onClick={sendEmail} className="bg-green-800 hover:bg-green-900 text-white">
            Send Email
          </Button>
        </div>

        <div className="mt-10 p-4 bg-green-100 rounded-xl">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Payment Account Details</h2>
          <p><span className="font-medium">Account Name:</span> STEM Institute of Learning Ltd/Gte</p>
          <p><span className="font-medium">Bank:</span> Union Bank of Nigeria</p>
          <p><span className="font-medium">Account Number:</span>  0107033739</p>
          <p className="mt-2 text-sm text-green-700 italic">Please use your registration number as the payment reference.</p>
        </div>
      </motion.div>
    </main>
  );
}
