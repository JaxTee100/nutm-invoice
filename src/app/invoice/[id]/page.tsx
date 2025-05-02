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

    useEffect(() => {
        const fetchInvoice = async () => {
            const res = await fetch(`${baseApi}/api/invoices/${id}`);
            const data = await res.json();
            setInvoice(data);
        };
        fetchInvoice();
    }, [id]);

    const generatePDF = (): Blob | undefined => {
        if (!invoice) return;

        const doc = new jsPDF();

        // Add header text
        doc.setTextColor(34, 139, 34); // ForestGreen
        doc.setFontSize(18);
        doc.text(`Invoice for ${invoice.studentName}`, 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Email: ${invoice.studentEmail}`, 14, 30);
        doc.text(`Program: ${invoice.program}`, 14, 36);

        // Extract table data dynamically
        const tableData = [
            ['Field', 'Details'],
            ['Email', invoice.studentEmail],
            ['Registration No', invoice.regNumber],
            ['Program', invoice.program],
            ['Tuition', `₦${invoice.tuition.toLocaleString()}`],
            ['Hostel', `₦${invoice.hostelFee.toLocaleString()}`],
            ['Scholarship Discount', `-₦${invoice.scholarshipDiscount.toLocaleString()}`],
            ['Total', `₦${invoice.total.toLocaleString()}`],
        ];

        // Add table to PDF
        autoTable(doc, {
            startY: 45,
            head: [tableData[0]],
            body: tableData.slice(1),
            styles: {
                fontSize: 11,
                cellPadding: 4,
            },
            headStyles: {
                fillColor: [144, 238, 144], // LightGreen
                textColor: [0, 100, 0],     // DarkGreen
                halign: 'center',
            },
            bodyStyles: {
                textColor: [34, 34, 34],
            },
            alternateRowStyles: {
                fillColor: [240, 255, 240], // HoneyDew
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [0, 100, 0] },
            },
        });

        // Add payment account details
        doc.setTextColor(34, 139, 34);
        doc.text('Payment Account Details:', 14, doc.lastAutoTable.finalY + 10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Account Name: Greenleaf Education Ltd`, 14, doc.lastAutoTable.finalY + 16);
        doc.text(`Bank: EcoBank Nigeria`, 14, doc.lastAutoTable.finalY + 22);
        doc.text(`Account Number: 1234567890`, 14, doc.lastAutoTable.finalY + 28);
        doc.setTextColor(85, 107, 47);
        doc.setFontSize(10);
        doc.text(`Please use your registration number as the payment reference.`, 14, doc.lastAutoTable.finalY + 34);

        // Save and return the PDF
        doc.save(`invoice-${id}.pdf`);
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
                    <p><span className="font-medium">Account Name:</span> Greenleaf Education Ltd</p>
                    <p><span className="font-medium">Bank:</span> EcoBank Nigeria</p>
                    <p><span className="font-medium">Account Number:</span> 1234567890</p>
                    <p className="mt-2 text-sm text-green-700 italic">Please use your registration number as the payment reference.</p>
                </div>
            </motion.div>
        </main>
    );
}