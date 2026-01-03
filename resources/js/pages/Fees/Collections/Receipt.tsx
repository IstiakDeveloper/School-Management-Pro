import React, { useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Printer,
    Download,
    ArrowLeft,
    Calendar,
    User,
    CreditCard,
    Building,
    FileText,
    CheckCircle,
    Mail,
    Phone
} from 'lucide-react';

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
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
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

    return (
        <AuthenticatedLayout>
            <Head title={`Receipt - ${collection.receipt_number}`} />

            <div className="p-6">
                {/* Action Buttons - Hidden on Print */}
                <div className="no-print mb-6 flex justify-between items-center">
                    <button
                        onClick={() => router.visit('/fee-collections')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Collections
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                            <Printer className="w-4 h-4" />
                            Print Receipt
                        </button>
                    </div>
                </div>

                {/* Receipt Content - Visible on Screen */}
                <div className="screen-only bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">School Management Pro</h1>
                            <p className="text-indigo-100">Fee Payment Receipt</p>
                            <div className="mt-4 pt-4 border-t border-indigo-400">
                                <p className="text-sm">123 School Street, Education City, Country</p>
                                <p className="text-sm">Phone: +880 1234-567890 | Email: info@school.edu</p>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Info Bar */}
                    <div className="bg-gray-50 px-8 py-4 border-b-2 border-indigo-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-600">Receipt Number</p>
                                <p className="text-2xl font-bold text-indigo-600">{collection.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Payment Date</p>
                                <p className="text-lg font-semibold text-gray-800">{formatDate(collection.payment_date)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="p-8 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Student Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Student Name</p>
                                <p className="font-semibold text-gray-900">{collection.student.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Admission Number</p>
                                <p className="font-semibold text-gray-900">{collection.student.admission_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Class</p>
                                <p className="font-semibold text-gray-900">{collection.student.school_class.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold text-gray-900">{collection.student.user.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fee Details */}
                    <div className="p-8 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Fee Details
                        </h3>
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Late Fee</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Discount</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {relatedCollections.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-gray-800">{item.fee_type.name}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {getMonthName(item.month)} {item.year}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-800">
                                                ৳{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-600">
                                                {item.late_fee > 0 ? `৳${item.late_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                {item.discount > 0 ? `-৳${item.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                ৳{item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-indigo-50">
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-right font-bold text-gray-800">
                                            Grand Total:
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-indigo-600 text-xl">
                                            ৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="p-8 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            Payment Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    {getPaymentMethodLabel(collection.payment_method)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Payment Status</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    {collection.status.toUpperCase()}
                                </span>
                            </div>
                            {collection.remarks && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Remarks</p>
                                    <p className="text-gray-800 italic">{collection.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-gray-50">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Collected By</p>
                                <p className="font-semibold text-gray-900">{collection.collector?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Generated on: {formatDate(collection.created_at)}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="border-t-2 border-gray-400 pt-2 mt-8 w-48">
                                    <p className="text-sm text-gray-600">Authorized Signature</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                            <p className="text-xs text-gray-500">
                                This is a computer-generated receipt and does not require a signature.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                For any queries, please contact the accounts department.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Print Only - Two Receipt Copies */}
                <div className="print-only" ref={printRef}>
                    {/* School Copy */}
                    <div className="receipt-copy">
                        <div className="receipt-header">
                            <div className="text-center">
                                <h1 className="school-name">School Management Pro</h1>
                                <p className="receipt-title">Fee Payment Receipt</p>
                                <p className="copy-label">(School Copy)</p>
                                <div className="school-info">
                                    <p>123 School Street, Education City, Country</p>
                                    <p>Phone: +880 1234-567890 | Email: info@school.edu</p>
                                </div>
                            </div>
                        </div>

                        <div className="receipt-info">
                            <div>
                                <p className="label">Receipt Number</p>
                                <p className="receipt-number">{collection.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="label">Payment Date</p>
                                <p className="value">{formatDate(collection.payment_date)}</p>
                            </div>
                        </div>

                        <div className="section">
                            <h3 className="section-title">Student Information</h3>
                            <div className="info-grid">
                                <div>
                                    <p className="label">Student Name</p>
                                    <p className="value">{collection.student.user.name}</p>
                                </div>
                                <div>
                                    <p className="label">Admission Number</p>
                                    <p className="value">{collection.student.admission_number}</p>
                                </div>
                                <div>
                                    <p className="label">Class</p>
                                    <p className="value">{collection.student.school_class.name}</p>
                                </div>
                                <div>
                                    <p className="label">Email</p>
                                    <p className="value">{collection.student.user.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="section">
                            <h3 className="section-title">Fee Details</h3>
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
                                    {relatedCollections.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.fee_type.name}</td>
                                            <td>{getMonthName(item.month)} {item.year}</td>
                                            <td className="text-right">৳{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td className="text-right">{item.late_fee > 0 ? `৳${item.late_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                            <td className="text-right">{item.discount > 0 ? `-৳${item.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                            <td className="text-right font-bold">৳{item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="text-right font-bold">Grand Total:</td>
                                        <td className="text-right grand-total">৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="section">
                            <h3 className="section-title">Payment Information</h3>
                            <div className="info-grid">
                                <div>
                                    <p className="label">Payment Method</p>
                                    <p className="value">{getPaymentMethodLabel(collection.payment_method)}</p>
                                </div>
                                <div>
                                    <p className="label">Payment Status</p>
                                    <p className="value">{collection.status.toUpperCase()}</p>
                                </div>
                                {collection.remarks && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <p className="label">Remarks</p>
                                        <p className="value">{collection.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="footer">
                            <div>
                                <p className="label">Collected By</p>
                                <p className="value">{collection.collector?.name || 'N/A'}</p>
                                <p className="generated-on">Generated on: {formatDate(collection.created_at)}</p>
                            </div>
                            <div className="signature">
                                <div className="signature-line">
                                    <p className="label">Authorized Signature</p>
                                </div>
                            </div>
                        </div>

                        <div className="disclaimer">
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                            <p>For any queries, please contact the accounts department.</p>
                        </div>
                    </div>

                    {/* Page break before Student Copy */}
                    <div className="page-break"></div>

                    {/* Student Copy */}
                    <div className="receipt-copy">
                        <div className="receipt-header">
                            <div className="text-center">
                                <h1 className="school-name">School Management Pro</h1>
                                <p className="receipt-title">Fee Payment Receipt</p>
                                <p className="copy-label">(Student Copy)</p>
                                <div className="school-info">
                                    <p>123 School Street, Education City, Country</p>
                                    <p>Phone: +880 1234-567890 | Email: info@school.edu</p>
                                </div>
                            </div>
                        </div>

                        <div className="receipt-info">
                            <div>
                                <p className="label">Receipt Number</p>
                                <p className="receipt-number">{collection.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="label">Payment Date</p>
                                <p className="value">{formatDate(collection.payment_date)}</p>
                            </div>
                        </div>

                        <div className="section">
                            <h3 className="section-title">Student Information</h3>
                            <div className="info-grid">
                                <div>
                                    <p className="label">Student Name</p>
                                    <p className="value">{collection.student.user.name}</p>
                                </div>
                                <div>
                                    <p className="label">Admission Number</p>
                                    <p className="value">{collection.student.admission_number}</p>
                                </div>
                                <div>
                                    <p className="label">Class</p>
                                    <p className="value">{collection.student.school_class.name}</p>
                                </div>
                                <div>
                                    <p className="label">Email</p>
                                    <p className="value">{collection.student.user.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="section">
                            <h3 className="section-title">Fee Details</h3>
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
                                    {relatedCollections.map((item) => (
                                        <tr key={`student-${item.id}`}>
                                            <td>{item.fee_type.name}</td>
                                            <td>{getMonthName(item.month)} {item.year}</td>
                                            <td className="text-right">৳{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td className="text-right">{item.late_fee > 0 ? `৳${item.late_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                            <td className="text-right">{item.discount > 0 ? `-৳${item.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                            <td className="text-right font-bold">৳{item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="text-right font-bold">Grand Total:</td>
                                        <td className="text-right grand-total">৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="section">
                            <h3 className="section-title">Payment Information</h3>
                            <div className="info-grid">
                                <div>
                                    <p className="label">Payment Method</p>
                                    <p className="value">{getPaymentMethodLabel(collection.payment_method)}</p>
                                </div>
                                <div>
                                    <p className="label">Payment Status</p>
                                    <p className="value">{collection.status.toUpperCase()}</p>
                                </div>
                                {collection.remarks && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <p className="label">Remarks</p>
                                        <p className="value">{collection.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="footer">
                            <div>
                                <p className="label">Collected By</p>
                                <p className="value">{collection.collector?.name || 'N/A'}</p>
                                <p className="generated-on">Generated on: {formatDate(collection.created_at)}</p>
                            </div>
                            <div className="signature">
                                <div className="signature-line">
                                    <p className="label">Authorized Signature</p>
                                </div>
                            </div>
                        </div>

                        <div className="disclaimer">
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                            <p>For any queries, please contact the accounts department.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                /* Screen Only - Hide print version on screen */
                .print-only {
                    display: none;
                }

                .screen-only {
                    display: block;
                }

                @media print {
                    /* Hide everything except print content */
                    body * {
                        visibility: hidden;
                    }

                    /* Hide screen version and navigation */
                    .screen-only,
                    .no-print,
                    nav,
                    header,
                    footer:not(.receipt-copy footer),
                    aside,
                    .sidebar {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    /* Show only print version */
                    .print-only,
                    .print-only * {
                        display: block !important;
                        visibility: visible !important;
                    }

                    .print-only {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    /* A4 Page Settings */
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    /* Receipt Copy Styling - Exactly 50% of A4 height, 100% width */
                    .receipt-copy {
                        width: 100%;
                        height: 50vh;
                        margin: 0;
                        padding: 12px;
                        box-sizing: border-box;
                        font-size: 10pt;
                        line-height: 1.4;
                        color: #000;
                        background: white;
                        border: 1px solid #000;
                        overflow: visible;
                    }

                    .receipt-copy:first-child {
                        border-bottom: none;
                    }

                    /* Page break between receipts - removed */
                    .page-break {
                        display: none;
                        margin: 0;
                        padding: 0;
                        height: 0;
                    }

                    /* Header Styling - Professional */
                    .receipt-header {
                        background: #4b5563 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: white !important;
                        padding: 10px;
                        margin-bottom: 8px;
                        text-align: center;
                    }

                    .school-name {
                        font-size: 16pt;
                        font-weight: bold;
                        margin: 0 0 2px 0;
                        color: white !important;
                    }

                    .receipt-title {
                        font-size: 10pt;
                        margin: 2px 0;
                        color: #e5e7eb !important;
                    }

                    .copy-label {
                        font-size: 9pt;
                        font-weight: bold;
                        margin: 2px 0 0 0;
                        color: #fef3c7 !important;
                    }

                    .school-info {
                        margin-top: 6px;
                        padding-top: 6px;
                        border-top: 1px solid rgba(255, 255, 255, 0.3);
                        font-size: 8pt;
                        color: #e5e7eb !important;
                    }

                    .school-info p {
                        margin: 1px 0;
                        color: #e5e7eb !important;
                    }

                    /* Receipt Info Bar */
                    .receipt-info {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        padding: 8px 10px;
                        margin-bottom: 8px;
                        border: 1px solid #d1d5db;
                    }

                    .receipt-number {
                        font-size: 12pt;
                        font-weight: bold;
                        color: #1f2937 !important;
                        margin: 0;
                    }

                    /* Section Styling */
                    .section {
                        margin-bottom: 8px;
                        padding-bottom: 6px;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .section:last-of-type {
                        border-bottom: none;
                    }

                    .section-title {
                        font-size: 10pt;
                        font-weight: bold;
                        margin: 0 0 5px 0;
                        color: #1f2937 !important;
                    }

                    /* Info Grid */
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }

                    .info-grid .label {
                        font-size: 8pt;
                        color: #6b7280 !important;
                        margin: 0 0 2px 0;
                    }

                    .info-grid .value {
                        font-size: 9pt;
                        font-weight: 600;
                        color: #000 !important;
                        margin: 0;
                    }

                    .receipt-info .label {
                        font-size: 8pt;
                        color: #6b7280 !important;
                        margin: 0 0 2px 0;
                    }

                    .receipt-info .value {
                        font-size: 10pt;
                        font-weight: 600;
                        color: #000 !important;
                        margin: 0;
                    }

                    /* Fee Table */
                    .fee-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 5px;
                        font-size: 8pt;
                    }

                    .fee-table th {
                        background: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        padding: 5px 4px;
                        text-align: left;
                        font-weight: 600;
                        color: #374151 !important;
                        border: 1px solid #d1d5db;
                    }

                    .fee-table td {
                        padding: 4px;
                        border: 1px solid #d1d5db;
                        color: #000 !important;
                    }

                    .fee-table tbody tr {
                        background: white !important;
                    }

                    .fee-table tfoot {
                        background: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .fee-table tfoot td {
                        padding: 5px 4px;
                        font-weight: bold;
                        color: #000 !important;
                    }

                    .grand-total {
                        font-size: 11pt !important;
                        color: #1f2937 !important;
                        font-weight: bold !important;
                    }

                    /* Footer */
                    .footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        margin-top: 8px;
                        padding-top: 6px;
                    }

                    .footer .label {
                        font-size: 8pt;
                        color: #6b7280 !important;
                        margin: 0 0 2px 0;
                    }

                    .footer .value {
                        font-size: 9pt;
                        font-weight: 600;
                        color: #000 !important;
                        margin: 0;
                    }

                    .generated-on {
                        font-size: 7pt;
                        color: #9ca3af !important;
                        margin: 3px 0 0 0;
                    }

                    .signature {
                        text-align: right;
                    }

                    .signature-line {
                        border-top: 1px solid #6b7280;
                        padding-top: 3px;
                        margin-top: 20px;
                        width: 140px;
                    }

                    /* Disclaimer */
                    .disclaimer {
                        margin-top: 8px;
                        padding-top: 6px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        font-size: 7pt;
                        color: #9ca3af !important;
                    }

                    .disclaimer p {
                        margin: 2px 0;
                        color: #9ca3af !important;
                    }

                    /* Text alignment utilities */
                    .text-center {
                        text-align: center !important;
                    }

                    .text-right {
                        text-align: right !important;
                    }

                    .text-left {
                        text-align: left !important;
                    }

                    .font-bold {
                        font-weight: bold !important;
                    }

                    /* Avoid page breaks inside receipts */
                    .receipt-copy {
                        page-break-inside: avoid;
                    }

                    .section {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
