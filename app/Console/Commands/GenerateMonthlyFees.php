<?php

namespace App\Console\Commands;

use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateMonthlyFees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:generate-monthly {--month=} {--year=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly fee records for all active students';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting monthly fee generation...');

        // Get current academic year
        $academicYear = AcademicYear::where('is_current', true)->first();

        if (!$academicYear) {
            $this->error('No active academic year found!');
            return 1;
        }

        // Get month and year from options or use current date
        $month = $this->option('month') ?? now()->month;
        $year = $this->option('year') ?? now()->year;

        $this->info("Generating fees for: {$year}-{$month}");

        // Check if we're within academic year period
        $targetDate = Carbon::create($year, $month, 1);
        if ($targetDate->lt($academicYear->start_date) || $targetDate->gt($academicYear->end_date)) {
            $this->warn("Target date {$targetDate->format('Y-m-d')} is outside academic year period.");
        }

        // Get all active students
        $students = Student::with(['schoolClass', 'academicYear'])
            ->where('status', 'active')
            ->where('academic_year_id', $academicYear->id)
            ->get();

        if ($students->isEmpty()) {
            $this->warn('No active students found!');
            return 0;
        }

        $this->info("Found {$students->count()} active students");

        $generatedCount = 0;
        $skippedCount = 0;
        $errorCount = 0;

        $progressBar = $this->output->createProgressBar($students->count());
        $progressBar->start();

        foreach ($students as $student) {
            try {
                // Get fee structures for student's class
                $feeStructures = FeeStructure::with('feeType')
                    ->where('class_id', $student->class_id)
                    ->where('academic_year_id', $academicYear->id)
                    ->get();

                foreach ($feeStructures as $feeStructure) {
                    // Skip if not monthly fee
                    if ($feeStructure->feeType->frequency !== 'monthly') {
                        continue;
                    }

                    // Check if fee already generated for this student, month, year
                    $existingFee = FeeCollection::where('student_id', $student->id)
                        ->where('fee_type_id', $feeStructure->fee_type_id)
                        ->where('month', $month)
                        ->where('year', $year)
                        ->first();

                    if ($existingFee) {
                        $skippedCount++;
                        continue;
                    }

                    // Calculate due date from fee structure
                    $dueDate = $feeStructure->due_date ?? Carbon::create($year, $month, 10);

                    // Generate receipt number
                    $receiptNumber = 'FEE-' . date('Ymd') . '-' . str_pad(
                        FeeCollection::whereDate('created_at', today())->count() + 1,
                        6,
                        '0',
                        STR_PAD_LEFT
                    );

                    // Create fee collection record with pending status
                    FeeCollection::create([
                        'receipt_number' => $receiptNumber,
                        'student_id' => $student->id,
                        'fee_type_id' => $feeStructure->fee_type_id,
                        'academic_year_id' => $academicYear->id,
                        'month' => $month,
                        'year' => $year,
                        'amount' => $feeStructure->amount,
                        'late_fee' => 0,
                        'discount' => 0,
                        'total_amount' => $feeStructure->amount,
                        'paid_amount' => 0,
                        'payment_date' => $dueDate,
                        'status' => 'pending',
                        'remarks' => 'Auto-generated monthly fee',
                        'collected_by' => 1, // System generated
                    ]);

                    $generatedCount++;
                }
            } catch (\Exception $e) {
                $this->error("Error for student {$student->id}: " . $e->getMessage());
                $errorCount++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✓ Fee generation completed!");
        $this->info("Generated: {$generatedCount}");
        $this->info("Skipped (already exists): {$skippedCount}");
        if ($errorCount > 0) {
            $this->warn("Errors: {$errorCount}");
        }

        return 0;
    }
}
