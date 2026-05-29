export const CURRENCIES = [
    // South Asia
    { code: 'INR', name: 'Indian Rupee',          symbol: '₹'   },
    { code: 'BDT', name: 'Bangladeshi Taka',       symbol: '৳'   },
    { code: 'PKR', name: 'Pakistani Rupee',        symbol: '₨'   },
    { code: 'LKR', name: 'Sri Lankan Rupee',       symbol: 'Rs'  },
    { code: 'NPR', name: 'Nepalese Rupee',         symbol: 'रू'  },
    { code: 'MVR', name: 'Maldivian Rufiyaa',      symbol: 'Rf'  },

    // Americas
    { code: 'USD', name: 'US Dollar',              symbol: '$'   },
    { code: 'CAD', name: 'Canadian Dollar',        symbol: 'C$'  },
    { code: 'MXN', name: 'Mexican Peso',           symbol: 'MX$' },
    { code: 'BRL', name: 'Brazilian Real',         symbol: 'R$'  },
    { code: 'ARS', name: 'Argentine Peso',         symbol: 'AR$' },
    { code: 'CLP', name: 'Chilean Peso',           symbol: 'CL$' },
    { code: 'COP', name: 'Colombian Peso',         symbol: 'CO$' },
    { code: 'PEN', name: 'Peruvian Sol',           symbol: 'S/'  },
    { code: 'UYU', name: 'Uruguayan Peso',         symbol: '$U'  },

    // Europe
    { code: 'EUR', name: 'Euro',                   symbol: '€'   },
    { code: 'GBP', name: 'British Pound',          symbol: '£'   },
    { code: 'CHF', name: 'Swiss Franc',            symbol: 'Fr'  },
    { code: 'NOK', name: 'Norwegian Krone',        symbol: 'kr'  },
    { code: 'SEK', name: 'Swedish Krona',          symbol: 'kr'  },
    { code: 'DKK', name: 'Danish Krone',           symbol: 'kr'  },
    { code: 'PLN', name: 'Polish Zloty',           symbol: 'zł'  },
    { code: 'CZK', name: 'Czech Koruna',           symbol: 'Kč'  },
    { code: 'HUF', name: 'Hungarian Forint',       symbol: 'Ft'  },
    { code: 'RON', name: 'Romanian Leu',           symbol: 'lei' },
    { code: 'BGN', name: 'Bulgarian Lev',          symbol: 'лв'  },
    { code: 'HRK', name: 'Croatian Kuna',          symbol: 'kn'  },
    { code: 'RSD', name: 'Serbian Dinar',          symbol: 'din' },
    { code: 'UAH', name: 'Ukrainian Hryvnia',      symbol: '₴'   },
    { code: 'RUB', name: 'Russian Ruble',          symbol: '₽'   },
    { code: 'TRY', name: 'Turkish Lira',           symbol: '₺'   },
    { code: 'GEL', name: 'Georgian Lari',          symbol: '₾'   },
    { code: 'AMD', name: 'Armenian Dram',          symbol: '֏'   },
    { code: 'AZN', name: 'Azerbaijani Manat',      symbol: '₼'   },
    { code: 'KZT', name: 'Kazakhstani Tenge',      symbol: '₸'   },

    // Middle East
    { code: 'AED', name: 'UAE Dirham',             symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal',            symbol: '﷼'   },
    { code: 'QAR', name: 'Qatari Riyal',           symbol: 'QR'  },
    { code: 'KWD', name: 'Kuwaiti Dinar',          symbol: 'KD'  },
    { code: 'BHD', name: 'Bahraini Dinar',         symbol: 'BD'  },
    { code: 'OMR', name: 'Omani Rial',             symbol: 'OMR' },
    { code: 'JOD', name: 'Jordanian Dinar',        symbol: 'JD'  },
    { code: 'ILS', name: 'Israeli Shekel',         symbol: '₪'   },
    { code: 'IQD', name: 'Iraqi Dinar',            symbol: 'IQD' },
    { code: 'EGP', name: 'Egyptian Pound',         symbol: 'E£'  },

    // Asia-Pacific
    { code: 'JPY', name: 'Japanese Yen',           symbol: '¥'   },
    { code: 'CNY', name: 'Chinese Yuan',           symbol: '¥'   },
    { code: 'HKD', name: 'Hong Kong Dollar',       symbol: 'HK$' },
    { code: 'SGD', name: 'Singapore Dollar',       symbol: 'S$'  },
    { code: 'AUD', name: 'Australian Dollar',      symbol: 'A$'  },
    { code: 'NZD', name: 'New Zealand Dollar',     symbol: 'NZ$' },
    { code: 'KRW', name: 'South Korean Won',       symbol: '₩'   },
    { code: 'TWD', name: 'Taiwan Dollar',          symbol: 'NT$' },
    { code: 'MYR', name: 'Malaysian Ringgit',      symbol: 'RM'  },
    { code: 'IDR', name: 'Indonesian Rupiah',      symbol: 'Rp'  },
    { code: 'THB', name: 'Thai Baht',              symbol: '฿'   },
    { code: 'PHP', name: 'Philippine Peso',        symbol: '₱'   },
    { code: 'VND', name: 'Vietnamese Dong',        symbol: '₫'   },
    { code: 'MMK', name: 'Myanmar Kyat',           symbol: 'K'   },
    { code: 'KHR', name: 'Cambodian Riel',         symbol: '៛'   },

    // Africa
    { code: 'ZAR', name: 'South African Rand',     symbol: 'R'   },
    { code: 'NGN', name: 'Nigerian Naira',         symbol: '₦'   },
    { code: 'KES', name: 'Kenyan Shilling',        symbol: 'KSh' },
    { code: 'GHS', name: 'Ghanaian Cedi',          symbol: 'GH₵' },
    { code: 'TZS', name: 'Tanzanian Shilling',     symbol: 'TSh' },
    { code: 'UGX', name: 'Ugandan Shilling',       symbol: 'USh' },
    { code: 'ETB', name: 'Ethiopian Birr',         symbol: 'Br'  },
    { code: 'MAD', name: 'Moroccan Dirham',        symbol: 'MAD' },
    { code: 'DZD', name: 'Algerian Dinar',         symbol: 'DA'  },
    { code: 'TND', name: 'Tunisian Dinar',         symbol: 'DT'  },
]

export const CURRENCY_MAP = Object.fromEntries(CURRENCIES.map(c => [c.code, c]))

export function getCurrencySymbol(code) {
    return CURRENCY_MAP[code]?.symbol ?? code
}
