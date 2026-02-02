import React from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

interface Loan {
    id: number;
    loan_number: string;
    loan_amount: number;
    installment_count: number;
    loan_date: string;
    first_installment_date: string;
    purpose: string | null;
    remarks: string | null;
}

interface EditLoanModalProps {
    show: boolean;
    loan: Loan | null;
    onClose: () => void;
}

export default function EditLoanModal({ show, loan, onClose }: EditLoanModalProps) {
    const form = useForm({
        loan_amount: loan?.loan_amount.toString() || '',
        installment_count: loan?.installment_count.toString() || '',
        loan_date: loan?.loan_date || '',
        first_installment_date: loan?.first_installment_date || '',
        purpose: loan?.purpose || '',
        remarks: loan?.remarks || '',
    });

    React.useEffect(() => {
        if (loan) {
            form.setData({
                loan_amount: loan.loan_amount.toString(),
                installment_count: loan.installment_count.toString(),
                loan_date: loan.loan_date,
                first_installment_date: loan.first_installment_date,
                purpose: loan.purpose || '',
                remarks: loan.remarks || '',
            });
        }
    }, [loan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loan) return;

        form.put(`/accounting/welfare-loans/${loan.id}`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!show || !loan) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-orange-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-2xl font-bold">Edit Loan - {loan.loan_number}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.data.loan_amount}
                                onChange={(e) => form.setData('loan_amount', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Installments <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.data.installment_count}
                                onChange={(e) => form.setData('installment_count', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                    </div>

                    {form.data.loan_amount && form.data.installment_count && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-800">
                                Monthly Installment: ৳{(parseFloat(form.data.loan_amount) / parseInt(form.data.installment_count)).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.data.loan_date}
                                onChange={(e) => form.setData('loan_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Installment Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.data.first_installment_date}
                                onChange={(e) => form.setData('first_installment_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                        <textarea
                            value={form.data.purpose}
                            onChange={(e) => form.setData('purpose', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                        <textarea
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-800">
                            ⚠️ Changes will adjust the account balance accordingly
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
                        >
                            {form.processing ? 'Updating...' : 'Update Loan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
