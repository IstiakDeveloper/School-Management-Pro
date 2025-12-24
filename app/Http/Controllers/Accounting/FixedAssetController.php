<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\FixedAsset;
use App\Models\Account;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FixedAssetController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $assets = FixedAsset::query()
            ->when($request->search, fn($q) => $q->where('asset_name', 'like', "%{$request->search}%")
                ->orWhere('asset_code', 'like', "%{$request->search}%"))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        $totalValue = FixedAsset::where('status', 'active')->sum('current_value');
        $totalAssets = FixedAsset::count();

        return Inertia::render('Accounting/FixedAssets/Index', [
            'assets' => $assets,
            'filters' => $request->only(['search', 'category', 'status']),
            'stats' => [
                'total_value' => $totalValue,
                'total_assets' => $totalAssets,
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('manage_accounting');

        // Generate next asset code
        $lastAsset = FixedAsset::latest('id')->first();
        $nextNumber = $lastAsset ? (int) substr($lastAsset->asset_code, 3) + 1 : 1;
        $nextCode = 'FA-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Accounting/FixedAssets/Create', [
            'accounts' => Account::where('status', 'active')->get(),
            'nextAssetCode' => $nextCode,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'asset_name' => 'required|string|max:255',
            'asset_code' => 'required|string|max:50|unique:fixed_assets',
            'category' => 'required|string|max:100',
            'account_id' => 'required|exists:accounts,id',
            'purchase_price' => 'required|numeric|min:0',
            'purchase_date' => 'required|date',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:active,disposed,damaged',
        ]);

        DB::beginTransaction();
        try {
            // Set default depreciation rate to 0 if not provided
            $validated['depreciation_rate'] = $validated['depreciation_rate'] ?? 0;
            $validated['current_value'] = $validated['purchase_price'];

            $asset = FixedAsset::create($validated);

            // Create asset purchase transaction (not expense, but debit)
            $transactionNumber = 'TXN-' . date('Ymd') . '-' . str_pad(Transaction::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            $transaction = Transaction::create([
                'account_id' => $validated['account_id'],
                'transaction_number' => $transactionNumber,
                'type' => 'asset_purchase',
                'amount' => $validated['purchase_price'],
                'transaction_date' => $validated['purchase_date'],
                'description' => "Fixed Asset Purchase: {$asset->asset_name} ({$asset->asset_code})",
                'created_by' => auth()->id(),
            ]);

            // Deduct from account balance
            Account::find($validated['account_id'])->decrement('current_balance', $validated['purchase_price']);

            DB::commit();

            logActivity('create', "Created fixed asset: {$asset->asset_name} with transaction: {$transactionNumber}", FixedAsset::class, $asset->id);

            return redirect()->route('accounting.fixed-assets.index')
                ->with('success', 'Fixed asset purchased successfully and payment recorded');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to purchase fixed asset: ' . $e->getMessage());
        }
    }

    public function show(FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/FixedAssets/Show', [
            'asset' => $fixedAsset,
        ]);
    }

    public function edit(FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        return Inertia::render('Accounting/FixedAssets/Edit', [
            'asset' => $fixedAsset,
        ]);
    }

    public function update(Request $request, FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        $validated = $request->validate([
            'asset_name' => 'required|string|max:255',
            'asset_code' => 'required|string|max:50|unique:fixed_assets,asset_code,' . $fixedAsset->id,
            'category' => 'required|string|max:100',
            'purchase_price' => 'required|numeric|min:0',
            'purchase_date' => 'required|date',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'current_value' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,disposed,damaged',
        ]);

        $fixedAsset->update($validated);

        logActivity('update', "Updated fixed asset: {$fixedAsset->asset_name}", FixedAsset::class, $fixedAsset->id);

        return redirect()->route('accounting.fixed-assets.index')
            ->with('success', 'Fixed asset updated successfully');
    }

    public function destroy(FixedAsset $fixedAsset)
    {
        $this->authorize('manage_accounting');

        $fixedAsset->delete();

        logActivity('delete', "Deleted fixed asset", FixedAsset::class, $fixedAsset->id);

        return redirect()->route('accounting.fixed-assets.index')
            ->with('success', 'Fixed asset deleted successfully');
    }
}
