'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

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

    // === Header: Logo and Title ===
    doc.addImage(logoDataUrl, 'JPG', 14, 10, 58, 22); // Left aligned logo

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 196, 12, { align: 'right' }); // Right aligned invoice title

    // === Invoice Date ===
    const invoiceDate = new Date();
    const formattedInvoiceDate = invoiceDate.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.setFontSize(10);
    doc.setTextColor(34, 139, 34);
    doc.text(`Invoice Date: ${formattedInvoiceDate}`, 192, 67, { align: 'right' });

    // === Institution Header Info ===
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Nigerian University of Technology and Management', 105, 41, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('6, Freetown Road Apapa Lagos, Nigeria.', 105, 46, { align: 'center' });
    doc.text('Email: bursar@nutm.edu.ng', 105, 52, { align: 'center' });

    // === BILL TO Section ===
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 14, 64);

    doc.setFont('helvetica', 'normal');
    doc.text(`${invoice.studentName.toUpperCase()}`, 14, 69);

    // // === Amount Due Summary ===
    // doc.setFontSize(12);
    // doc.setFont('helvetica', 'bold');
    // doc.text('Amount Due:', 133, 67);
    // doc.text(
    //   `N${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    //   193,
    //   67,
    //   { align: 'right' }
    // );

    // === Table: Line Items ===
    const tableBody = [
      [
        'Tuition Fee balance',
        '1',
        Number(invoice.tuition).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Number(invoice.tuition).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ],
    ];

    if (invoice.hostelFee) {
      const formatted = Number(invoice.hostelFee).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      tableBody.push(['Hostel Fee balance', '1', formatted, formatted]);
    }

    if (invoice.acceptanceFee) {
      const formatted = Number(invoice.acceptanceFee).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      tableBody.push(['Acceptance Fee balance', '1', formatted, formatted]);
    }

    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Quantity', 'Rate (N)', 'Amount (N)']],
      body: tableBody,
      styles: { fontSize: 10, cellPadding: { top: 2, right: 2, bottom: 2, left: 2 } },
      headStyles: {
        fillColor: [0, 158, 91], // green
        textColor: 255,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 40 },
      },
    });

    // === Summary: Total and Amount Due ===
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total:', 146, y);
    doc.text(
      `${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      193,
      y,
      { align: 'right' }
    );

    y += 6;
    doc.text('Amount Due:', 146, y);
    doc.text(
      `${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      193,
      y,
      { align: 'right' }
    );

    // === Terms & Conditions ===
    y += 10;
    doc.setFontSize(11);
    doc.text('TERMS & CONDITIONS', 14, y);

    y += 6;
    doc.setFontSize(10);
    const terms = [
      '1. All fees are listed in naira, unless otherwise stated.',
      '2. Payments should be made according to the following account details:',
      '   Accommodation Fee:',
      '   Bank: Union Bank of Nigeria',
      '   Account Name: STEM Institute of Learning Ltd/Gte',
      '   Account Number: 0107033739',
      '   Acceptance & Tuition Fee:',
      '   Bank: Zenith Bank Plc.',
      '   Account Name: STEM Institute of Learning Ltd/Gte',
      '   Account Number: 1016804002',
      '3. Each student is responsible for ensuring their total balance is settled.',
      '4. For inquiries, please contact:',
      '   Email: bursar@nutm.edu.ng',
      '   Phone: 07064399591',
    ];

    terms.forEach((line, i) => {
  const yPos = y + i * 5;

  const accountDetailMatch = line.match(/^\s*(Bank:|Account Name:|Account Number:)\s*(.*)$/);
  const shouldIndent = line.trim().startsWith('Accommodation Fee:') ||
                       line.trim().startsWith('Acceptance & Tuition Fee:') ||
                       accountDetailMatch;

  const xPos = shouldIndent ? 20 : 14;

  // Special styling for "Accommodation Fee:"
  if (line.trim() === 'Accommodation Fee:') {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 160, 89); // green
    doc.text(line.trim(), xPos, yPos);
    doc.setTextColor(0, 0, 0); // reset to black
    return;
  }
  if (line.trim() === 'Acceptance & Tuition Fee:') {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 160, 89); // green
    doc.text(line.trim(), xPos, yPos);
    doc.setTextColor(0, 0, 0); // reset to black
    return;
  }

  if (accountDetailMatch) {
    const label = accountDetailMatch[1];
    const value = accountDetailMatch[2];

    doc.setFont('helvetica', 'bold');
    doc.text(label, xPos, yPos);

    const labelWidth = doc.getTextWidth(label);
    const extraSpacing = 2;

    doc.setFont('helvetica', 'normal');
    doc.text(value, xPos + labelWidth + extraSpacing, yPos);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // ensure default black
    doc.text(line, xPos, yPos);
  }
});


   // === Footer Note at the Bottom ===
const pageWidth = 210; // A4 width in mm
const footerHeight = 10;
const footerText =
  'STEM Institute of Learning Ltd/Gte is the promoter of the Nigerian University of Technology and Management';
const footerFontSize = 8;

// Y-position: bottom of A4 minus margin
const footerY = 297 - 4;

// Set background rectangle
doc.setFillColor(0, 0, 0); // black
doc.rect(0, footerY - 3, pageWidth, footerHeight, 'F'); // 'F' = fill

// Set footer text
doc.setFontSize(footerFontSize);
doc.setTextColor(255, 255, 255); // white
doc.setFont('helvetica', 'normal');

// Center the text horizontally
const textWidth = doc.getTextWidth(footerText);
const centerX = (pageWidth - textWidth) / 2;

doc.text(footerText, centerX, footerY);


    // === Save File ===
    doc.save(`invoice-${invoice.studentName}.pdf`);
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
    <main className="flex flex-col justify-center items-center gap-6">

      <Link href={'/invoice/new'} className=' w-full max-w-3xl flex justify-end'>
        <Button className='bg-slate-700 text-white font-semibold  hover:bg-slate-500 cursor-pointer'>Create New Invoice</Button>
      </Link>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className='max-w-3xl mx-auto p-6  shadow-lg'>

        <h1 className="text-2xl font-bold text-green-800 mb-6">Invoice for {invoice.studentName}</h1>





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
            {
              invoice.hostelFee > 0 && <TableRow>
                <TableCell>Hostel</TableCell>
                <TableCell>₦{invoice.hostelFee.toLocaleString()}</TableCell>
              </TableRow>
            }

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
          <h2 className='text-slate-900 font-bold '>Terms and Conditions</h2>
          <ul className="list-decimal list-inside text-gray-800 space-y-4  leading-relaxed">
            <li className='lg:text-lg'>
              All fees are listed in naira, unless otherwise stated.
            </li>

            <li className='text-lg'>
              Payments should be made according to the following account details for each respective fee type:
              <ul className="list-disc list-inside pl-4 mt-2 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold lg:text-lg">Accommodation Fee:</span><br />
                  <span className="block font-bold lg:text-lg ml-4">
                    Bank: Union Bank of Nigeria<br />
                    Account Name: STEM Institute of Learning Ltd/Gte<br />
                    Account Number: 0107033739
                  </span>
                </li>
                <li>
                  <span className="font-semibold mb-3 lg:text-lg">Acceptance & Tuition Fee:</span><br />
                  <span className="block font-bold lg:text-lg ml-4">
                    Bank: Zenith Bank Plc.<br />
                    Account Name: STEM Institute of Learning Ltd/Gte<br />
                    Account Number: 1016804002
                  </span>
                </li>
              </ul>

            </li>

            <li className='lg:text-lg'>
              Each student is responsible for ensuring that the total balance on their student account is settled.
            </li>

            <li className='lg:text-lg'>
              <span className="font-medium">For any inquiries or assistance, please contact:</span><br />
              <span className="ml-4 block">
                Email: <a href="mailto:bursar@nutm.edu.ng" className="text-blue-600 underline">bursar@nutm.edu.ng</a><br />
                Phone: <a href="tel:07064399591" className="text-blue-600 underline">0706 439 9591</a>
              </span>
            </li>
          </ul>

        </div>
      </motion.div>
    </main>
  );
}
