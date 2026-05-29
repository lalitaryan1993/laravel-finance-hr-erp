<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\Invoice;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use OpenAI\Laravel\Facades\OpenAI;
use Carbon\Carbon;

class AIAssistantController extends Controller
{
    public function index()
    {
        $conversations = AiConversation::where('user_id', auth()->id())
            ->latest()
            ->take(10)
            ->get(['id', 'uuid', 'title', 'updated_at']);

        return Inertia::render('AI/Assistant', [
            'conversations' => $conversations,
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message'         => 'required|string|max:2000',
            'conversation_id' => 'nullable|exists:ai_conversations,id',
        ]);

        $companyId = $request->user()->company_id;
        $message   = $request->message;

        // Gather financial context
        $context = $this->getFinancialContext($companyId);

        $systemPrompt = "You are an expert AI Financial Assistant for AI-FMS Enterprise Financial Management System.
You have access to the following current financial data for this company:
" . json_encode($context, JSON_PRETTY_PRINT) . "

Provide accurate, professional financial advice, analysis, and insights.
When asked about specific numbers, use the actual data provided.
Format currency as Indian Rupees (₹) unless the company uses a different currency.
Be concise but thorough. Always explain your reasoning.";

        $history = [];
        if ($request->conversation_id) {
            $conv = AiConversation::find($request->conversation_id);
            $history = $conv?->messages ?? [];
        }

        $messages = array_merge(
            $history,
            [['role' => 'user', 'content' => $message]]
        );

        try {
            $response = OpenAI::chat()->create([
                'model'    => config('openai.model', 'gpt-4o'),
                'messages' => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $messages
                ),
                'max_tokens'  => 1500,
                'temperature' => 0.7,
            ]);

            $reply = $response->choices[0]->message->content;
            $tokens = $response->usage->totalTokens;

            $messages[] = ['role' => 'assistant', 'content' => $reply];

            // Save conversation
            if ($request->conversation_id) {
                AiConversation::where('id', $request->conversation_id)->update([
                    'messages'    => $messages,
                    'token_usage' => DB::raw("token_usage + {$tokens}"),
                ]);
            } else {
                $title = $this->generateTitle($message);
                AiConversation::create([
                    'company_id'  => $companyId,
                    'user_id'     => $request->user()->id,
                    'title'       => $title,
                    'messages'    => $messages,
                    'token_usage' => $tokens,
                ]);
            }

            return response()->json([
                'reply'   => $reply,
                'tokens'  => $tokens,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'reply'  => "I'm unable to process your request at the moment. Please ensure your OpenAI API key is configured correctly.",
                'error'  => $e->getMessage(),
            ], 200);
        }
    }

    public function analyze(Request $request)
    {
        $companyId = $request->user()->company_id;
        $context   = $this->getFinancialContext($companyId);

        $prompt = "Analyze the financial health of this company based on the following data and provide:
1. Financial health score (0-100)
2. Top 3 strengths
3. Top 3 areas of concern
4. 3 actionable recommendations
5. Revenue trend analysis

Company data: " . json_encode($context);

        try {
            $response = OpenAI::chat()->create([
                'model'    => config('openai.model', 'gpt-4o'),
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert financial analyst.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 1000,
            ]);

            return response()->json(['analysis' => $response->choices[0]->message->content]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Analysis failed. Check OpenAI configuration.'], 200);
        }
    }

    public function forecast(Request $request)
    {
        $companyId = $request->user()->company_id;

        // Get last 12 months of revenue data
        $monthlyRevenue = Invoice::where('company_id', $companyId)
            ->where('type', 'sales')
            ->where('status', '!=', 'draft')
            ->where('invoice_date', '>=', now()->subMonths(12))
            ->selectRaw("DATE_FORMAT(invoice_date, '%Y-%m') as month, SUM(grand_total) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $prompt = "Based on the following monthly revenue data for the last 12 months, provide a 6-month revenue forecast with confidence levels.
Data: " . json_encode($monthlyRevenue) . "
Format: Return as JSON with months and predicted values.";

        try {
            $response = OpenAI::chat()->create([
                'model'   => config('openai.model', 'gpt-4o'),
                'messages'=> [
                    ['role' => 'system', 'content' => 'You are a financial forecasting expert. Return only JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 500,
            ]);

            return response()->json(['forecast' => json_decode($response->choices[0]->message->content, true)]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Forecast failed.'], 200);
        }
    }

    private function getFinancialContext(int $companyId): array
    {
        $now = Carbon::now();
        return [
            'period'           => $now->format('F Y'),
            'total_revenue_mtd'=> Invoice::where('company_id', $companyId)->where('type', 'sales')
                                    ->where('status', '!=', 'draft')
                                    ->whereMonth('invoice_date', $now->month)->sum('grand_total'),
            'total_expenses_mtd'=> Expense::where('company_id', $companyId)
                                    ->whereNotIn('status', ['draft', 'rejected'])
                                    ->whereMonth('expense_date', $now->month)->sum('total_amount'),
            'outstanding_receivables' => Invoice::where('company_id', $companyId)
                                    ->where('type', 'sales')
                                    ->whereIn('payment_status', ['unpaid', 'partial'])
                                    ->sum('balance_due'),
            'overdue_invoices_count' => Invoice::where('company_id', $companyId)
                                    ->where('type', 'sales')
                                    ->where('due_date', '<', $now)
                                    ->whereNotIn('payment_status', ['paid'])->count(),
        ];
    }

    private function generateTitle(string $message): string
    {
        return strlen($message) > 50 ? substr($message, 0, 50) . '...' : $message;
    }
}
