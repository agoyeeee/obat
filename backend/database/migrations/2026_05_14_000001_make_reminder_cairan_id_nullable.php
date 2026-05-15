<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('log_konsumsi_cairan', function (Blueprint $table): void {
            // Drop the foreign key constraint first
            $table->dropForeign(['reminder_cairan_id']);
            // Make the column nullable
            $table->unsignedBigInteger('reminder_cairan_id')->nullable()->change();
            // Re-add the foreign key constraint with cascadeOnDelete
            $table->foreign('reminder_cairan_id')->references('id')->on('reminder_cairan')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('log_konsumsi_cairan', function (Blueprint $table): void {
            // Drop the foreign key
            $table->dropForeign(['reminder_cairan_id']);
            // Revert to non-nullable
            $table->unsignedBigInteger('reminder_cairan_id')->change();
            // Re-add the foreign key constraint
            $table->foreign('reminder_cairan_id')->references('id')->on('reminder_cairan')->cascadeOnDelete();
        });
    }
};
