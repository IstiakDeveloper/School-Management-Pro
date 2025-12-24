import React from 'react';

interface Collection {
    id: number;
    receipt_number: string;
    student: { user: { name: string }; admission_number: string };
    fee_type: { name: string };
    amount: number;
    paid_amount: number;
    payment_date: string;
    status: string;
    month: number;
    year: number;
}

interface PrintReportProps {
    collections: Collection[];
    onClose: () => void;
}

function getMonthName(month: number) {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PrintReport({ collections, onClose }: PrintReportProps) {
    React.useEffect(() => {
        // Hide sidebar and navbar when component mounts
        document.body.style.overflow = 'hidden';
        const appLayout = document.querySelector('aside');
        const navbar = document.querySelector('nav');
        if (appLayout) appLayout.style.display = 'none';
        if (navbar) navbar.style.display = 'none';

        // Auto print when component mounts
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => {
            // Restore sidebar and navbar when component unmounts
            document.body.style.overflow = '';
            if (appLayout) appLayout.style.display = '';
            if (navbar) navbar.style.display = '';
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="print-report">
            <style>{`
                @media print {
    @page {
        size: A4 portrait;
        margin: 20mm 15mm; /* Top/Bottom 20mm, Left/Right 15mm */
    }

    body * {
        visibility: hidden !important;
    }

    .print-report,
    .print-report * {
        visibility: visible !important;
    }

    body,
    html {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
    }

    .print-report {
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        left: auto !important;
        top: auto !important;
        transform: none !important;
    }

    .print-content {
        width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
    }

    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
    }

    .no-print {
        display: none !important;
        visibility: hidden !important;
    }

    table {
        width: 100% !important;
        page-break-inside: auto !important;
        border-collapse: collapse !important;
        margin: 15px auto !important;
    }

    tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
    }

    th, td {
        font-size: 11px !important;
        padding: 8px !important;
        border: 1px solid #333 !important;
        text-align: center !important;
    }

    th {
        background-color: #f5f5f5 !important;
        font-weight: 600 !important;
    }

    h1 {
        font-size: 20px !important;
        margin: 0 0 5px 0 !important;
        text-align: center !important;
        font-weight: 700 !important;
    }

    h2 {
        font-size: 16px !important;
        margin: 0 0 3px 0 !important;
        text-align: center !important;
        font-weight: 600 !important;
    }

    .text-sm {
        font-size: 11px !important;
        text-align: center !important;
        margin-bottom: 10px !important;
        color: #666 !important;
    }

    hr {
        border: none !important;
        border-top: 3px solid #000 !important;
        margin: 10px 0 15px 0 !important;
    }
}

@media screen {
    .print-report {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 9999;
        overflow: auto;
        padding: 40px;
    }

    .print-content {
        max-width: 800px;
        margin: 0 auto;
    }
}
            `}</style>

            {/* Close button for screen only */}
            <button
                onClick={onClose}
                className="no-print fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
                Close
            </button>

            {/* Print Content */}
            <div className="print-content max-w-[210mm] mx-auto bg-white">
                {/* Header */}
                <div className="text-center mb-6 border-b-4 border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">SCHOOL MANAGEMENT SYSTEM</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-1">Fee Collection Report</h2>
                    <p className="text-sm text-gray-600">Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-black px-3 py-2 text-left text-xs font-bold uppercase">Receipt</th>
                            <th className="border border-black px-3 py-2 text-left text-xs font-bold uppercase">Student</th>
                            <th className="border border-black px-3 py-2 text-left text-xs font-bold uppercase">Fee Type</th>
                            <th className="border border-black px-3 py-2 text-left text-xs font-bold uppercase">Month/Year</th>
                            <th className="border border-black px-3 py-2 text-right text-xs font-bold uppercase">Amount</th>
                            <th className="border border-black px-3 py-2 text-right text-xs font-bold uppercase">Paid</th>
                            <th className="border border-black px-3 py-2 text-left text-xs font-bold uppercase">Date</th>
                            <th className="border border-black px-3 py-2 text-center text-xs font-bold uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collections.map((collection) => (
                            <tr key={collection.id}>
                                <td className="border border-black px-3 py-2 text-xs">{collection.receipt_number}</td>
                                <td className="border border-black px-3 py-2 text-xs">
                                    <div className="font-medium">{collection.student.user.name}</div>
                                    <div className="text-gray-600">{collection.student.admission_number}</div>
                                </td>
                                <td className="border border-black px-3 py-2 text-xs">{collection.fee_type.name}</td>
                                <td className="border border-black px-3 py-2 text-xs">{getMonthName(collection.month)} {collection.year}</td>
                                <td className="border border-black px-3 py-2 text-xs text-right">৳{parseFloat(collection.amount.toString()).toLocaleString('en-IN')}</td>
                                <td className="border border-black px-3 py-2 text-xs text-right font-semibold">৳{parseFloat(collection.paid_amount.toString()).toLocaleString('en-IN')}</td>
                                <td className="border border-black px-3 py-2 text-xs">{formatDate(collection.payment_date)}</td>
                                <td className="border border-black px-3 py-2 text-xs text-center uppercase font-semibold">{collection.status}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100">
                            <td colSpan={4} className="border border-black px-3 py-2 text-xs font-bold text-right">Total:</td>
                            <td className="border border-black px-3 py-2 text-xs font-bold text-right">
                                ৳{collections.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0).toLocaleString('en-IN')}
                            </td>
                            <td className="border border-black px-3 py-2 text-xs font-bold text-right">
                                ৳{collections.reduce((sum, c) => sum + parseFloat(c.paid_amount.toString()), 0).toLocaleString('en-IN')}
                            </td>
                            <td colSpan={2} className="border border-black"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
