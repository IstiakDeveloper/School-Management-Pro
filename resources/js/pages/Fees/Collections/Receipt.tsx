import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Printer, Download, ArrowLeft } from 'lucide-react';

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getMonthName(month: number): string {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

interface FeeType {
    name: string;
}

interface Collection {
    id: number;
    receipt_number: string;
    student: {
        user: { name: string; email: string; phone: string };
        admission_number: string;
        school_class: { name: string };
    };
    fee_type: FeeType;
    amount: number;
    late_fee: number;
    discount: number;
    paid_amount: number;
    total_amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    month: number;
    year: number;
    remarks: string;
    collector: { name: string };
    created_at: string;
}

interface RelatedCollection {
    id: number;
    fee_type: FeeType;
    amount: number;
    late_fee: number;
    discount: number;
    total_amount: number;
    month: number;
    year: number;
}

interface Props {
    collection: Collection;
    relatedCollections: RelatedCollection[];
    totalAmount: number;
}

export default function Receipt({ collection, relatedCollections, totalAmount }: Props) {
    const handlePrint = () => {
        window.print();
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            cash: 'Cash',
            bank_transfer: 'Bank Transfer',
            cheque: 'Cheque',
            mobile_banking: 'Mobile Banking',
            online: 'Online Payment',
        };
        return labels[method] || method;
    };

    const ReceiptContent = ({ copyType }: { copyType: string }) => (
        <div className="receipt-box">
            {/* Header */}
            <div className="receipt-header">
                <h1 className="school-name">Mousumi Bidyaniketon</h1>
                <p className="school-address">Ukilpara, Naogaon Sadar, Naogaon</p>
                <p className="school-contact">Phone: +8801713-758424 | Email: mubn2020@gmail.com</p>
                <div className="title-bar">
                    <span className="title">FEE PAYMENT RECEIPT</span>

                </div>
            </div>

            {/* Receipt Number & Date */}
            <div className="info-bar">
                <div>
                    <span className="info-label">Receipt No: </span>
                    <span className="info-value">{collection.receipt_number}</span>
                </div>
                <div>
                    <span className="info-label">Date: </span>
                    <span className="info-value">{formatDate(collection.payment_date)}</span>
                </div>
            </div>

            {/* Student Information */}
            <div className="info-grid">
                <div className="info-item">
                    <span className="info-label">Student Name:</span>
                    <span className="info-value">{collection.student.user.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Class:</span>
                    <span className="info-value">{collection.student.school_class.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Admission No:</span>
                    <span className="info-value">{collection.student.admission_number}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Payment Method:</span>
                    <span className="info-value">{getPaymentMethodLabel(collection.payment_method)}</span>
                </div>
            </div>

            {/* Fee Table */}
            <table className="fee-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Period</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Late Fee</th>
                        <th className="text-right">Discount</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {relatedCollections.map((item, index) => (
                        <tr key={`${copyType}-${index}`}>
                            <td>{item.fee_type.name}</td>
                            <td className="text-center">{getMonthName(item.month)} {item.year}</td>
                            <td className="text-right">৳{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{item.late_fee > 0 ? `৳${item.late_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                            <td className="text-right">{item.discount > 0 ? `-৳${item.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                            <td className="text-right strong">৳{item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-right strong">TOTAL AMOUNT PAID:</td>
                        <td className="text-right total-amount">৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Remarks */}
            {collection.remarks && (
                <div className="remarks">
                    <span className="info-label">Remarks: </span>
                    <span>{collection.remarks}</span>
                </div>
            )}

            {/* Footer */}
            <div className="receipt-footer">
                <div className="footer-left">
                    <div>
                        <span className="info-label">Collected By: </span>
                        <span>{collection.collector?.name || 'N/A'}</span>
                    </div>
                    <p className="footer-note">This is a computer-generated receipt.</p>
                </div>
                <div className="footer-right">
                    <div className="signature-area">
                        <div className="signature-line"></div>
                        <p className="signature-label">Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Receipt - ${collection.receipt_number}`} />

            <div className="receipt-container">
                {/* Action Buttons */}
                <div className="action-buttons no-print">
                    <button onClick={() => router.visit('/fee-collections')} className="btn-back">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Collections
                    </button>
                    <div className="btn-group">
                        <button onClick={handlePrint} className="btn-download">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button onClick={handlePrint} className="btn-print">
                            <Printer className="w-4 h-4" />
                            Print Receipt
                        </button>
                    </div>
                </div>

                {/* Receipt Preview */}
                <div className="receipt-preview">
                    <ReceiptContent copyType="School Copy" />
                </div>
            </div>

            {/* Styles */}
            <style>{`
                /* Common Styles - Screen */
                .receipt-container {
                    padding: 20px;
                    background: #f5f5f5;
                    min-height: 100vh;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    max-width: 210mm;
                    margin-left: auto;
                    margin-right: auto;
                }

                .btn-group {
                    display: flex;
                    gap: 10px;
                }

                .btn-back, .btn-download, .btn-print {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-back {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-back:hover {
                    background: #e5e7eb;
                }

                .btn-download {
                    background: #10b981;
                    color: white;
                }

                .btn-download:hover {
                    background: #059669;
                }

                .btn-print {
                    background: #6366f1;
                    color: white;
                }

                .btn-print:hover {
                    background: #4f46e5;
                }

                .receipt-preview {
                    max-width: 210mm;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }

                .receipt-box {
                    padding: 20px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #000;
                    border: 2px solid #000;
                    margin: 10mm;
                    background: white;
                }

                .receipt-box:first-child {
                    margin-bottom: 5mm;
                }

                /* Header */
                .receipt-header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }

                .school-name {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 0 0 5px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .school-address {
                    font-size: 12px;
                    margin: 3px 0;
                }

                .school-contact {
                    font-size: 10px;
                    margin: 3px 0 0 0;
                    color: #333;
                }

                .title-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                    padding: 5px 0;
                    border-top: 1px solid #000;
                    border-bottom: 1px solid #000;
                }

                .title {
                    font-size: 14px;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                }

                .copy-badge {
                    font-size: 11px;
                    font-weight: bold;
                    padding: 3px 10px;
                    border: 1px solid #000;
                }

                /* Info Bar */
                .info-bar {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    margin-bottom: 12px;
                    border-bottom: 1px solid #000;
                    font-size: 12px;
                }

                /* Info Grid */
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px 15px;
                    margin-bottom: 15px;
                    padding: 10px 0;
                    border-bottom: 1px solid #000;
                }

                .info-item {
                    font-size: 11px;
                }

                .info-label {
                    font-weight: normal;
                    color: #000;
                }

                .info-value {
                    font-weight: 600;
                    margin-left: 5px;
                }

                /* Fee Table */
                .fee-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 10px;
                }

                .fee-table th {
                    background: #f0f0f0;
                    padding: 6px 4px;
                    border: 1px solid #000;
                    font-weight: bold;
                    text-align: left;
                }

                .fee-table td {
                    padding: 5px 4px;
                    border: 1px solid #000;
                }

                .fee-table tbody tr {
                    background: white;
                }

                .fee-table tfoot tr {
                    background: #e8e8e8;
                }

                .fee-table tfoot td {
                    padding: 8px 4px;
                    border: 1.5px solid #000;
                    font-weight: bold;
                }

                .text-center {
                    text-align: center;
                }

                .text-right {
                    text-align: right;
                }

                .strong {
                    font-weight: bold;
                }

                .total-amount {
                    font-size: 13px !important;
                    font-weight: bold;
                }

                /* Remarks */
                .remarks {
                    margin: 10px 0;
                    padding: 8px;
                    border: 1px solid #000;
                    background: #f9f9f9;
                    font-size: 10px;
                }

                /* Footer */
                .receipt-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #000;
                    font-size: 10px;
                }

                .footer-left {
                    flex: 1;
                }

                .footer-note {
                    font-size: 9px;
                    color: #666;
                    font-style: italic;
                    margin-top: 8px;
                }

                .footer-right {
                    text-align: right;
                }

                .signature-area {
                    margin-top: 30px;
                }

                .signature-line {
                    width: 120px;
                    border-top: 1px solid #000;
                    margin-bottom: 5px;
                }

                .signature-label {
                    font-size: 9px;
                    color: #000;
                }

                /* Print Styles */
                @media print {
                    /* Hide EVERYTHING first */
                    body * {
                        visibility: hidden;
                    }

                    /* Then show only receipt */
                    .receipt-preview,
                    .receipt-preview * {
                        visibility: visible !important;
                    }

                    /* Hide sidebar, nav, header completely */
                    aside, nav, header, .sidebar, [class*="sidebar"], [class*="Sidebar"] {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }

                    /* Reset all margins and paddings on containers */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                    }

                    body > div,
                    body > div > div,
                    body > div > div > div,
                    body > div > div > div > div,
                    main, [class*="main"], [class*="Main"], [class*="content"], [class*="Content"] {
                        margin: 0 !important;
                        padding: 0 !important;
                        margin-left: 0 !important;
                        padding-left: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        position: static !important;
                        left: 0 !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .receipt-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }

                    .receipt-preview {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        box-shadow: none !important;
                        max-width: 100% !important;
                        width: 200mm !important;
                        height: auto !important;
                        margin: 0 !important;
                    }

                    .receipt-box {
                        padding: 6mm;
                        margin: 0;
                        border: 1.5pt solid #000;
                        page-break-inside: avoid;
                        page-break-after: avoid;
                        height: auto;
                        max-height: 140mm;
                        box-sizing: border-box;
                    }

                    .school-name {
                        font-size: 16pt;
                    }

                    .school-address {
                        font-size: 10pt;
                    }

                    .school-contact {
                        font-size: 8pt;
                    }

                    .title {
                        font-size: 11pt;
                    }

                    .copy-badge {
                        font-size: 9pt;
                    }

                    .info-bar {
                        font-size: 10pt;
                    }

                    .info-grid {
                        gap: 6px 12px;
                    }

                    .info-item {
                        font-size: 9pt;
                    }

                    .fee-table {
                        font-size: 8pt;
                    }

                    .fee-table th {
                        padding: 1.5mm;
                    }

                    .fee-table td {
                        padding: 1.5mm;
                    }

                    .total-amount {
                        font-size: 11pt !important;
                    }

                    .remarks {
                        font-size: 8pt;
                    }

                    .receipt-footer {
                        font-size: 8pt;
                    }

                    .footer-note {
                        font-size: 7pt;
                    }

                    .signature-label {
                        font-size: 7pt;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
