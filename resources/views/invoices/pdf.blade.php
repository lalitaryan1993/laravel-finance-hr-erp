<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>{{ $invoice->invoice_number }}</title>
<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size:11.5px; color:#1a202c; background:#fff; }

    .page { padding:32px 38px 28px; }

    /* ── Utilities ─────────────────────────────────────────── */
    .w100    { width:100%; }
    .tr      { text-align:right; }
    .tc      { text-align:center; }
    .tl      { text-align:left; }
    .bold    { font-weight:bold; }
    .mono    { font-family:DejaVu Sans Mono, monospace; }
    .muted   { color:#718096; }
    .small   { font-size:9.5px; }
    .tiny    { font-size:9px; }

    /* ── Accent colour (all uses reference this class) ──────── */
    .accent-bg   { background:#1a56db; }
    .accent-text { color:#1a56db; }
    .accent-light{ background:#eff6ff; }
    .accent-border{ border:1px solid #bfdbfe; }

    /* ── Header ─────────────────────────────────────────────── */
    .header-table td { vertical-align:middle; }
    .doc-type  { font-size:24px; font-weight:bold; color:#1a202c; letter-spacing:0.5px; }
    .doc-num   { font-size:12px; font-family:DejaVu Sans Mono,monospace; color:#4a5568; margin-top:3px; }

    /* ── Colour strip ───────────────────────────────────────── */
    .strip { height:3px; background:#1a56db; border-radius:2px; margin:12px 0 14px; }

    /* ── Company address row ────────────────────────────────── */
    .co-address { font-size:9.5px; color:#718096; line-height:1.6; }

    /* ── Meta table (dates, ref) ────────────────────────────── */
    .meta-box  { background:#f7fafc; border:1px solid #e2e8f0; border-radius:5px; padding:10px 14px; }
    .meta-row  { margin-bottom:5px; }
    .meta-row:last-child { margin-bottom:0; }
    .meta-label{ font-size:9px; color:#718096; text-transform:uppercase; letter-spacing:0.6px; font-weight:bold; margin-bottom:1px; }
    .meta-val  { font-size:11px; font-weight:600; color:#2d3748; }

    /* ── Section title ──────────────────────────────────────── */
    .sec-title { font-size:8.5px; font-weight:bold; color:#718096; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:5px; border-bottom:1px solid #e2e8f0; padding-bottom:3px; }

    /* ── Party box ──────────────────────────────────────────── */
    .party-box { background:#f7fafc; border:1px solid #e2e8f0; border-radius:5px; border-left:3px solid #1a56db; padding:12px 14px; }
    .party-name{ font-size:14px; font-weight:bold; color:#1a202c; margin-bottom:2px; }
    .party-co  { font-size:10px; color:#718096; margin-bottom:3px; }
    .party-line{ font-size:10px; color:#4a5568; line-height:1.55; margin-top:2px; }

    /* ── Status badge ───────────────────────────────────────── */
    .badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:9.5px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; }
    .b-paid     { background:#d1fae5; color:#065f46; }
    .b-partial  { background:#fef3c7; color:#92400e; }
    .b-overdue  { background:#fee2e2; color:#991b1b; }
    .b-draft    { background:#f1f5f9; color:#475569; }
    .b-sent     { background:#dbeafe; color:#1e40af; }

    /* ── PAID watermark band ────────────────────────────────── */
    .paid-stamp { background:#d1fae5; border:1px solid #6ee7b7; border-radius:5px; padding:5px 14px; text-align:center; font-size:15px; font-weight:bold; color:#065f46; letter-spacing:3px; margin-bottom:10px; }

    /* ── Payment summary ────────────────────────────────────── */
    .pay-box { background:#f7fafc; border:1px solid #e2e8f0; border-radius:5px; padding:10px 14px; }
    .pay-bar-bg   { background:#e2e8f0; height:5px; border-radius:3px; margin-top:6px; }
    .pay-bar-fill { background:#10b981; height:5px; border-radius:3px; }

    /* ── Currency badge (foreign) ───────────────────────────── */
    .fx-badge { background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:4px 10px; font-size:10px; color:#1d4ed8; display:inline-block; margin-top:4px; }

    /* ── Items table ────────────────────────────────────────── */
    .items { width:100%; border-collapse:collapse; }
    .items thead tr { background:#1a56db; }
    .items thead th { padding:8px 9px; color:#fff; font-size:9.5px; font-weight:bold; text-transform:uppercase; letter-spacing:0.4px; }
    .items tbody tr { border-bottom:1px solid #f1f5f9; }
    .items tbody tr:last-child { border-bottom:none; }
    .items tbody td { padding:9px 9px; font-size:10.5px; vertical-align:top; }
    .items tbody tr:nth-child(even) td { background:#f9fafb; }
    .i-name  { font-weight:600; color:#1a202c; font-size:11px; }
    .i-desc  { color:#718096; font-size:9.5px; margin-top:2px; line-height:1.45; }
    .i-hsn   { color:#a0aec0; font-size:9px; font-family:DejaVu Sans Mono,monospace; margin-top:1px; }

    /* ── Totals ─────────────────────────────────────────────── */
    .totals { width:100%; border-collapse:collapse; }
    .totals td { padding:4px 8px; font-size:11px; }
    .t-label{ color:#718096; text-align:left; }
    .t-val  { font-family:DejaVu Sans Mono,monospace; text-align:right; }
    .t-sep td { border-top:1px solid #e2e8f0; padding-top:8px; }
    .t-grand td { background:#1a56db; color:#fff; padding:8px; font-size:13px; font-weight:bold; }
    .t-balance td { background:#fee2e2; color:#991b1b; font-weight:bold; }
    .t-inr td { background:#eff6ff; color:#1d4ed8; font-size:10px; }

    /* ── GST breakdown ──────────────────────────────────────── */
    .gst-box { background:#f7fafc; border:1px solid #e2e8f0; border-radius:4px; padding:8px 12px; font-size:10px; }
    .gst-row { margin-bottom:3px; }

    /* ── Notes / Terms ──────────────────────────────────────── */
    .note-box { background:#f7fafc; border-left:3px solid #1a56db; border-radius:0 4px 4px 0; padding:8px 12px; font-size:10px; color:#4a5568; line-height:1.6; }

    /* ── Export details ─────────────────────────────────────── */
    .export-box { background:#eff6ff; border:1px solid #bfdbfe; border-radius:5px; padding:10px 14px; font-size:10px; color:#1e40af; }

    /* ── Signature row ──────────────────────────────────────── */
    .sig-box { border-top:1px solid #4a5568; padding-top:4px; width:140px; font-size:9.5px; color:#718096; text-align:center; }

    /* ── Footer ─────────────────────────────────────────────── */
    .footer { border-top:1px solid #e2e8f0; margin-top:20px; padding-top:10px; text-align:center; font-size:9px; color:#a0aec0; line-height:1.7; }

    .divider { border:none; border-top:1px solid #e2e8f0; margin:14px 0; }
    .sp      { height:14px; }
    .sp-sm   { height:8px; }
</style>
</head>
<body>
<div class="page">

@php
    /* ── Currency helpers ─────────────────────────────────── */
    $symMap = [
        'INR'=>'₹',  'USD'=>'$',   'EUR'=>'€',  'GBP'=>'£',  'JPY'=>'¥',
        'CNY'=>'¥',  'AUD'=>'A$',  'CAD'=>'C$', 'SGD'=>'S$', 'NZD'=>'NZ$',
        'HKD'=>'HK$','AED'=>'AED', 'SAR'=>'SAR','QAR'=>'QR', 'KWD'=>'KD',
        'BHD'=>'BD',  'OMR'=>'OMR','JOD'=>'JD', 'CHF'=>'Fr', 'SEK'=>'kr',
        'NOK'=>'kr',  'DKK'=>'kr', 'PLN'=>'zł', 'CZK'=>'Kč', 'HUF'=>'Ft',
        'ZAR'=>'R',   'BRL'=>'R$', 'MXN'=>'MX$','ARS'=>'$',  'COP'=>'$',
        'MYR'=>'RM',  'IDR'=>'Rp', 'THB'=>'฿',  'PHP'=>'₱',  'KRW'=>'₩',
        'TWD'=>'NT$', 'VND'=>'₫',  'PKR'=>'₨',  'BDT'=>'৳',  'LKR'=>'Rs',
        'NPR'=>'रू',  'NGN'=>'₦',  'KES'=>'KSh','EGP'=>'E£', 'MAD'=>'MAD',
        'TRY'=>'₺',   'RUB'=>'₽',  'UAH'=>'₴',  'ILS'=>'₪',
    ];
    $currCode = $invoice->currency ?? 'INR';
    $sym      = $symMap[$currCode] ?? $currCode;
    $isFx     = $currCode !== 'INR';
    $exRate   = floatval($invoice->exchange_rate ?? 1);
    $fmt      = fn($n) => $sym . number_format(floatval($n), 2);
    $fmtInr   = fn($n) => '₹' . number_format(floatval($n), 2);

    /* ── Misc ─────────────────────────────────────────────── */
    $typeLabel = match($invoice->type) {
        'tax_invoice'    => 'TAX INVOICE',
        'sales'          => 'INVOICE',
        'proforma'       => 'PROFORMA INVOICE',
        'export_invoice' => 'EXPORT INVOICE',
        'export_proforma'=> 'EXPORT PROFORMA',
        'bill_of_supply' => 'BILL OF SUPPLY',
        'credit_note'    => 'CREDIT NOTE',
        'debit_note'     => 'DEBIT NOTE',
        'purchase'       => 'PURCHASE BILL',
        default          => 'INVOICE',
    };
    $isExport = in_array($invoice->type, ['export_invoice','export_proforma']);
    $isGst    = in_array($invoice->type, ['tax_invoice','sales','credit_note','debit_note','purchase']);

    $dueDate   = $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date) : null;
    $isOverdue = $dueDate && $dueDate->isPast() && $invoice->status !== 'paid';
    $statusKey = $isOverdue ? 'overdue' : ($invoice->status ?? 'draft');

    $grandTotal = floatval($invoice->grand_total);
    $paidAmt    = floatval($invoice->paid_amount ?? 0);
    $balDue     = floatval($invoice->balance_due ?? 0);
    $paidPct    = $grandTotal > 0 ? min(100, ($paidAmt / $grandTotal) * 100) : 0;
    $inrEquiv   = $isFx && $exRate > 0 ? $grandTotal * $exRate : null;

    /* ── Company logo ─────────────────────────────────────── */
    $logoPath = $company?->logo ? storage_path('app/public/' . $company->logo) : null;
    $logoB64  = ($logoPath && file_exists($logoPath))
        ? 'data:image/' . pathinfo($logoPath, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($logoPath))
        : null;

    /* ── Party logo ───────────────────────────────────────── */
    $partyLogoPath = $invoice->party?->logo ? storage_path('app/public/' . $invoice->party->logo) : null;
    $partyLogoB64  = ($partyLogoPath && file_exists($partyLogoPath))
        ? 'data:image/' . pathinfo($partyLogoPath, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($partyLogoPath))
        : null;
@endphp

{{-- ── HEADER ──────────────────────────────────────────────── --}}
<table class="w100 header-table">
    <tr>
        <td style="width:55%;vertical-align:middle;">
            <table><tr>
                @if($logoB64)
                <td style="padding-right:10px;vertical-align:middle;">
                    <img src="{{ $logoB64 }}" style="height:54px;width:54px;border-radius:8px;object-fit:contain;border:1px solid #e2e8f0;" />
                </td>
                @endif
                <td style="vertical-align:middle;">
                    <div style="font-size:20px;font-weight:bold;color:#1a202c;line-height:1.2;">{{ $company?->name ?? config('app.name') }}</div>
                    @if($company?->legal_name && $company->legal_name !== $company->name)
                    <div style="font-size:9.5px;color:#718096;margin-top:1px;">{{ $company->legal_name }}</div>
                    @endif
                    @if($company?->tax_id)
                    <div style="font-size:9.5px;color:#718096;font-family:DejaVu Sans Mono,monospace;margin-top:1px;">GSTIN: {{ $company->tax_id }}</div>
                    @endif
                    @if($company?->pan_number)
                    <div style="font-size:9.5px;color:#718096;font-family:DejaVu Sans Mono,monospace;">PAN: {{ $company->pan_number }}</div>
                    @endif
                </td>
            </tr></table>
        </td>
        <td style="width:45%;text-align:right;vertical-align:top;">
            <div class="doc-type">{{ $typeLabel }}</div>
            <div class="doc-num">{{ $invoice->invoice_number }}</div>
            <div style="margin-top:6px;">
                <span class="badge b-{{ $statusKey }}">{{ ucfirst($statusKey) }}</span>
                @if($isFx)
                &nbsp;<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;">{{ $currCode }}</span>
                @endif
                @if($isExport)
                &nbsp;<span class="badge" style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;">EXPORT</span>
                @endif
            </div>
        </td>
    </tr>
</table>

{{-- Accent strip --}}
<div class="strip"></div>

{{-- ── COMPANY ADDRESS + INVOICE META ──────────────────────── --}}
<table class="w100">
    <tr>
        <td style="width:55%;vertical-align:top;padding-right:16px;">
            <div class="co-address">
                @if($company?->address_line1){{ $company->address_line1 }}<br>@endif
                @if($company?->address_line2){{ $company->address_line2 }}<br>@endif
                {{ collect([$company?->city,$company?->state,$company?->country])->filter()->implode(', ') }}
                @if($company?->pincode) – {{ $company->pincode }}@endif
                @if($company?->email)<br>{{ $company->email }}@endif
                @if($company?->phone)&nbsp; | &nbsp;{{ $company->phone }}@endif
            </div>
        </td>
        <td style="width:45%;vertical-align:top;">
            <div class="meta-box">
                <table class="w100" style="border-collapse:collapse;">
                    <tr>
                        <td style="width:50%;padding-right:8px;vertical-align:top;">
                            <div class="meta-row">
                                <div class="meta-label">Invoice Date</div>
                                <div class="meta-val">{{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d M Y') }}</div>
                            </div>
                            @if($dueDate)
                            <div class="meta-row" style="margin-top:6px;">
                                <div class="meta-label">Due Date</div>
                                <div class="meta-val" style="{{ $isOverdue ? 'color:#dc2626;' : '' }}">{{ $dueDate->format('d M Y') }}</div>
                            </div>
                            @endif
                        </td>
                        <td style="width:50%;vertical-align:top;">
                            <div class="meta-row">
                                <div class="meta-label">Currency</div>
                                <div class="meta-val mono">{{ $currCode }}</div>
                            </div>
                            @if($isFx && $exRate > 0)
                            <div class="meta-row" style="margin-top:6px;">
                                <div class="meta-label">Exchange Rate</div>
                                <div class="meta-val">1 {{ $currCode }} = ₹{{ $exRate }}</div>
                            </div>
                            @endif
                            @if($invoice->place_of_supply)
                            <div class="meta-row" style="margin-top:6px;">
                                <div class="meta-label">Place of Supply</div>
                                <div class="meta-val">{{ $invoice->place_of_supply }}</div>
                            </div>
                            @endif
                            @if($invoice->reference_number)
                            <div class="meta-row" style="margin-top:6px;">
                                <div class="meta-label">Reference #</div>
                                <div class="meta-val mono">{{ $invoice->reference_number }}</div>
                            </div>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>

<div class="sp"></div>

{{-- ── BILL TO + PAYMENT SUMMARY ────────────────────────────── --}}
<table class="w100">
    <tr>
        {{-- Bill To --}}
        <td style="width:52%;vertical-align:top;padding-right:14px;">
            <div class="sec-title">{{ $invoice->party_type === 'vendor' ? 'Vendor / Supplier' : 'Bill To' }}</div>
            <div class="party-box">
                <table><tr>
                    @if($partyLogoB64)
                    <td style="padding-right:9px;vertical-align:top;">
                        <img src="{{ $partyLogoB64 }}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid #e2e8f0;" />
                    </td>
                    @endif
                    <td style="vertical-align:top;">
                        <div class="party-name">{{ $invoice->party?->name ?? '—' }}</div>
                        @if($invoice->party?->company_name && $invoice->party->company_name !== $invoice->party->name)
                        <div class="party-co">{{ $invoice->party->company_name }}</div>
                        @endif
                    </td>
                </tr></table>

                @if($invoice->party?->gst_number)
                <div class="party-line mono" style="margin-top:5px;">GSTIN: {{ $invoice->party->gst_number }}</div>
                @endif
                @if($invoice->party?->pan_number)
                <div class="party-line mono">PAN: {{ $invoice->party->pan_number }}</div>
                @endif

                @php
                    $addrParts = collect([
                        $invoice->party?->billing_address,
                        collect([$invoice->party?->billing_city, $invoice->party?->billing_state])->filter()->implode(', '),
                        $invoice->party?->billing_pincode ? '– ' . $invoice->party->billing_pincode : null,
                    ])->filter();
                    $addrCountry = ($invoice->party?->billing_country && $invoice->party->billing_country !== 'India') ? $invoice->party->billing_country : null;
                @endphp
                @if($addrParts->isNotEmpty())
                <div class="party-line" style="margin-top:5px;">
                    {{ $addrParts->implode(', ') }}
                    @if($addrCountry), {{ $addrCountry }}@endif
                </div>
                @endif
                @if($invoice->party?->email)
                <div class="party-line" style="margin-top:4px;">{{ $invoice->party->email }}</div>
                @endif
                @if($invoice->party?->mobile ?? $invoice->party?->phone)
                <div class="party-line">{{ $invoice->party->mobile ?? $invoice->party->phone }}</div>
                @endif
            </div>
        </td>

        {{-- Payment / Amount Summary --}}
        <td style="width:48%;vertical-align:top;">

            @if($invoice->status === 'paid')
            <div class="paid-stamp">✓ PAID IN FULL</div>
            @endif

            <div class="sec-title">Amount Summary</div>
            <div class="pay-box">
                <table class="w100" style="border-collapse:collapse;">
                    <tr>
                        <td style="font-size:10px;color:#718096;">Invoice Total</td>
                        <td class="tr bold mono" style="font-size:14px;color:#1a202c;">{{ $fmt($grandTotal) }}</td>
                    </tr>
                    @if($isFx && $inrEquiv)
                    <tr>
                        <td style="font-size:9.5px;color:#1d4ed8;">≈ INR Equivalent</td>
                        <td class="tr mono" style="font-size:10px;color:#1d4ed8;">{{ $fmtInr($inrEquiv) }}</td>
                    </tr>
                    @endif
                    @if($paidAmt > 0)
                    <tr style="border-top:1px solid #e2e8f0;">
                        <td style="font-size:10px;color:#065f46;padding-top:5px;">Amount Paid</td>
                        <td class="tr mono" style="font-size:10.5px;color:#065f46;padding-top:5px;">{{ $fmt($paidAmt) }}</td>
                    </tr>
                    <tr>
                        <td style="font-size:10px;font-weight:bold;color:#{{ $balDue > 0 ? 'dc2626' : '065f46' }};">Balance Due</td>
                        <td class="tr mono bold" style="font-size:11px;color:#{{ $balDue > 0 ? 'dc2626' : '065f46' }};">{{ $fmt($balDue) }}</td>
                    </tr>
                    @endif
                </table>
                @if($paidAmt > 0)
                <div class="pay-bar-bg" style="margin-top:8px;">
                    <div class="pay-bar-fill" style="width:{{ $paidPct }}%;"></div>
                </div>
                <div style="font-size:9px;color:#718096;margin-top:3px;text-align:right;">{{ number_format($paidPct,1) }}% paid</div>
                @endif
            </div>

            @if($isExport && ($invoice->lut_bond_number || $invoice->port_of_loading || $invoice->port_of_discharge || $invoice->country_of_origin))
            <div class="sp-sm"></div>
            <div class="sec-title">Export Details</div>
            <div class="export-box">
                <table style="border-collapse:collapse;font-size:9.5px;">
                    @if($invoice->country_of_origin)
                    <tr><td style="color:#1d4ed8;width:110px;padding-bottom:3px;">Country of Origin</td><td style="font-weight:600;padding-bottom:3px;">{{ $invoice->country_of_origin }}</td></tr>
                    @endif
                    @if($invoice->lut_bond_number)
                    <tr><td style="color:#1d4ed8;padding-bottom:3px;">LUT / Bond</td><td class="mono" style="font-weight:600;padding-bottom:3px;">{{ $invoice->lut_bond_number }}</td></tr>
                    @endif
                    @if($invoice->port_of_loading)
                    <tr><td style="color:#1d4ed8;padding-bottom:3px;">Port of Loading</td><td style="font-weight:600;padding-bottom:3px;">{{ $invoice->port_of_loading }}</td></tr>
                    @endif
                    @if($invoice->port_of_discharge)
                    <tr><td style="color:#1d4ed8;padding-bottom:3px;">Port of Discharge</td><td style="font-weight:600;padding-bottom:3px;">{{ $invoice->port_of_discharge }}</td></tr>
                    @endif
                    @if($invoice->shipping_bill_no)
                    <tr><td style="color:#1d4ed8;">Shipping Bill</td><td class="mono" style="font-weight:600;">{{ $invoice->shipping_bill_no }}</td></tr>
                    @endif
                </table>
            </div>
            @endif

        </td>
    </tr>
</table>

<div class="sp"></div>

{{-- ── LINE ITEMS ───────────────────────────────────────────── --}}
<table class="items">
    <thead>
        <tr>
            <th class="tc" style="width:26px;">#</th>
            <th class="tl">Item / Description</th>
            <th class="tc" style="width:58px;">HSN/SAC</th>
            <th class="tr" style="width:50px;">Qty</th>
            <th class="tr" style="width:82px;">Unit Price</th>
            <th class="tr" style="width:46px;">Disc%</th>
            <th class="tr" style="width:46px;">Tax%</th>
            <th class="tr" style="width:90px;">Amount</th>
        </tr>
    </thead>
    <tbody>
        @forelse($invoice->items as $idx => $item)
        <tr>
            <td class="tc muted small">{{ $idx + 1 }}</td>
            <td>
                <div class="i-name">{{ $item->item_name }}</div>
                @if($item->description)
                <div class="i-desc">{{ $item->description }}</div>
                @endif
                @if($item->hsn_sac_code)
                <div class="i-hsn">HSN/SAC: {{ $item->hsn_sac_code }}</div>
                @endif
            </td>
            <td class="tc" style="font-size:9.5px;font-family:DejaVu Sans Mono,monospace;color:#a0aec0;">{{ $item->hsn_sac_code ?: '—' }}</td>
            <td class="tr" style="font-size:10.5px;">{{ rtrim(rtrim(number_format(floatval($item->quantity),3),'0'),'.') }} {{ $item->unit }}</td>
            <td class="tr mono" style="font-size:10.5px;">{{ $sym . number_format(floatval($item->unit_price),2) }}</td>
            <td class="tr" style="font-size:10.5px;color:#{{ floatval($item->discount_percent) > 0 ? '16a34a' : 'a0aec0' }}">
                {{ floatval($item->discount_percent) > 0 ? $item->discount_percent.'%' : '—' }}
            </td>
            <td class="tr" style="font-size:10.5px;color:#{{ floatval($item->tax_rate) > 0 ? '1d4ed8' : 'a0aec0' }}">
                {{ floatval($item->tax_rate) > 0 ? $item->tax_rate.'%' : '—' }}
            </td>
            <td class="tr mono bold" style="font-size:11px;">{{ $sym . number_format(floatval($item->total_amount),2) }}</td>
        </tr>
        @empty
        <tr><td colspan="8" class="tc muted" style="padding:14px;">No items</td></tr>
        @endforelse
    </tbody>
</table>

<div class="sp"></div>

{{-- ── TOTALS + GST BREAKDOWN ───────────────────────────────── --}}
<table class="w100">
    <tr>
        {{-- Left: GST breakdown + Amount in words --}}
        <td style="width:52%;vertical-align:top;padding-right:16px;">

            @if($isGst && floatval($invoice->tax_amount) > 0)
            <div class="sec-title">GST Breakdown</div>
            <div class="gst-box">
                @php
                    $isIgst   = $invoice->place_of_supply && ($company?->state ?? '') !== $invoice->place_of_supply;
                    $totalTax = floatval($invoice->tax_amount);
                @endphp
                @if($isIgst || floatval($invoice->igst_amount ?? 0) > 0)
                <div class="gst-row" style="display:table;width:100%;">
                    <span style="color:#718096;">IGST</span>
                    <span style="float:right;font-family:DejaVu Sans Mono,monospace;">{{ $fmt($totalTax) }}</span>
                </div>
                @else
                <table class="w100" style="border-collapse:collapse;font-size:10px;">
                    <tr>
                        <td style="color:#718096;padding:2px 0;">CGST (50%)</td>
                        <td class="tr mono">{{ $fmt($totalTax / 2) }}</td>
                    </tr>
                    <tr>
                        <td style="color:#718096;padding:2px 0;">SGST (50%)</td>
                        <td class="tr mono">{{ $fmt($totalTax / 2) }}</td>
                    </tr>
                    <tr style="border-top:1px solid #e2e8f0;">
                        <td style="color:#1a202c;font-weight:bold;padding-top:4px;">Total GST</td>
                        <td class="tr mono bold" style="padding-top:4px;">{{ $fmt($totalTax) }}</td>
                    </tr>
                </table>
                @endif
            </div>
            <div class="sp-sm"></div>
            @endif

            {{-- Amount in words --}}
            @php
                $inWords = function(float $n) use (&$inWords): string {
                    $ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                             'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                             'Seventeen','Eighteen','Nineteen'];
                    $tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
                    $n = (int) abs($n);
                    if ($n === 0) return 'Zero';
                    $str = '';
                    if ($n >= 10000000) { $str .= $inWords($n/10000000).' Crore '; $n %= 10000000; }
                    if ($n >= 100000)   { $str .= $inWords($n/100000).' Lakh ';   $n %= 100000; }
                    if ($n >= 1000)     { $str .= $inWords($n/1000).' Thousand '; $n %= 1000; }
                    if ($n >= 100)      { $str .= $ones[(int)($n/100)].' Hundred '; $n %= 100; }
                    if ($n >= 20)       { $str .= $tens[(int)($n/10)].' '; $n %= 10; }
                    if ($n > 0)         { $str .= $ones[$n].' '; }
                    return trim($str);
                };
                $paise  = round(($grandTotal - floor($grandTotal)) * 100);
                $words  = $inWords($grandTotal);
                $subUnit = $isFx ? 'Cents' : 'Paise';
                $mainUnit= match($currCode) {
                    'USD'=>'US Dollars','EUR'=>'Euros','GBP'=>'Pounds Sterling',
                    'AED'=>'Dirhams','SGD'=>'Singapore Dollars',
                    default => 'Rupees',
                };
                $wordsStr = $words . ' ' . $mainUnit;
                if ($paise > 0) $wordsStr .= ' and ' . $inWords($paise) . ' ' . $subUnit;
                $wordsStr .= ' Only';
            @endphp
            <div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 12px;">
                <div style="font-size:8.5px;color:#718096;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Amount in Words</div>
                <div style="font-size:10.5px;font-weight:600;color:#1a202c;line-height:1.5;">{{ $wordsStr }}</div>
            </div>

        </td>

        {{-- Right: Totals --}}
        <td style="width:48%;vertical-align:top;">
            <table class="totals" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
                <tr>
                    <td class="t-label">Subtotal</td>
                    <td class="t-val">{{ $fmt($invoice->subtotal) }}</td>
                </tr>
                @if(floatval($invoice->discount_amount ?? 0) > 0)
                <tr>
                    <td class="t-label" style="color:#16a34a;">Discount</td>
                    <td class="t-val" style="color:#16a34a;">− {{ $fmt($invoice->discount_amount) }}</td>
                </tr>
                @endif
                @if(floatval($invoice->tax_amount) > 0)
                <tr>
                    <td class="t-label">Tax (GST)</td>
                    <td class="t-val">{{ $fmt($invoice->tax_amount) }}</td>
                </tr>
                @endif
                <tr class="t-sep"><td>&nbsp;</td><td></td></tr>
                <tr class="t-grand">
                    <td class="t-label" style="color:#fff;font-weight:bold;">Grand Total</td>
                    <td class="t-val" style="color:#fff;font-size:14px;">{{ $fmt($grandTotal) }}</td>
                </tr>
                @if($isFx && $inrEquiv)
                <tr class="t-inr">
                    <td class="t-label" style="color:#1d4ed8;font-size:9.5px;">≈ INR Equiv. (@ {{ $exRate }})</td>
                    <td class="t-val" style="color:#1d4ed8;font-size:10px;">{{ $fmtInr($inrEquiv) }}</td>
                </tr>
                @endif
                @if($balDue > 0 && $paidAmt > 0)
                <tr class="t-balance">
                    <td class="t-label" style="color:#991b1b;">Balance Due</td>
                    <td class="t-val" style="color:#991b1b;">{{ $fmt($balDue) }}</td>
                </tr>
                @endif
            </table>
        </td>
    </tr>
</table>

{{-- ── NOTES & TERMS ────────────────────────────────────────── --}}
@if($invoice->customer_notes || $invoice->terms_conditions)
<hr class="divider">
<table class="w100">
    <tr>
        @if($invoice->customer_notes)
        <td style="width:50%;padding-right:10px;vertical-align:top;">
            <div class="sec-title">Notes</div>
            <div class="note-box">{{ $invoice->customer_notes }}</div>
        </td>
        @endif
        @if($invoice->terms_conditions)
        <td style="width:50%;padding-left:10px;vertical-align:top;">
            <div class="sec-title">Terms &amp; Conditions</div>
            <div class="note-box">{{ $invoice->terms_conditions }}</div>
        </td>
        @endif
    </tr>
</table>
@endif

{{-- ── BANK DETAILS ──────────────────────────────────────────── --}}
@if($company?->settings && (isset($company->settings['bank_name']) || isset($company->settings['account_number'])))
<hr class="divider">
<div class="sec-title">Bank Details for Payment</div>
<table style="font-size:10px;color:#4a5568;border-collapse:collapse;">
    @if($company->settings['bank_name'] ?? null)<tr><td style="width:130px;color:#718096;padding:2px 0;">Bank Name</td><td style="font-weight:600;">{{ $company->settings['bank_name'] }}</td></tr>@endif
    @if($company->settings['account_number'] ?? null)<tr><td style="color:#718096;padding:2px 0;">Account Number</td><td class="mono" style="font-weight:600;">{{ $company->settings['account_number'] }}</td></tr>@endif
    @if($company->settings['ifsc_code'] ?? null)<tr><td style="color:#718096;padding:2px 0;">IFSC Code</td><td class="mono" style="font-weight:600;">{{ $company->settings['ifsc_code'] }}</td></tr>@endif
    @if($company->settings['account_name'] ?? null)<tr><td style="color:#718096;padding:2px 0;">Account Name</td><td style="font-weight:600;">{{ $company->settings['account_name'] }}</td></tr>@endif
</table>
@endif

{{-- ── SIGNATURE ROW ─────────────────────────────────────────── --}}
<div style="height:40px;"></div>
<table class="w100">
    <tr>
        <td style="vertical-align:bottom;">
            @if($company?->name)
            <div class="sig-box">Authorised Signatory for<br><strong>{{ $company->name }}</strong></div>
            @endif
        </td>
        <td class="tr" style="vertical-align:bottom;font-size:9px;color:#a0aec0;">
            @if($invoice->status === 'paid')
            <div style="background:#d1fae5;border:1px solid #6ee7b7;border-radius:4px;padding:4px 12px;display:inline-block;color:#065f46;font-weight:bold;letter-spacing:1px;font-size:11px;">✓ PAID</div>
            @endif
        </td>
    </tr>
</table>

{{-- ── FOOTER ───────────────────────────────────────────────── --}}
<div class="footer">
    <div>This is a computer-generated document. No signature is required.</div>
    <div>{{ $company?->name }} &nbsp;·&nbsp; {{ $invoice->invoice_number }} &nbsp;·&nbsp; Generated {{ now()->format('d M Y, h:i A') }}</div>
</div>

</div>
</body>
</html>
