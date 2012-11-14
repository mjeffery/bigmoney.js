(function(root){
	var __modules = {}, __defines = {};
	function uncommon(id) {
		if(!__modules.hasOwnProperty(id)) {
			
			if(!__defines.hasOwnProperty(id))
				throw new Error('The module "' + id + '" could not be found');
			
			var module = { exports: {} };
			Object.defineProperty(module, 'id', { //TODO? polyfill defineProperty
				writeable: false, 
				configurable: false, 
				enumerable: true, 
				value: new String(id) 
			});
			
			__defines[id].call(root, uncommon, module);
			__modules[id] = module.exports;	
		}
		
		return __modules[id];
	};
	
	uncommon.define = function(path, def) {
		if(__defines.hasOwnProperty(path))
			throw new Error('Attempting to redefine module "'+ module + '"');
			
		__defines[path] = def;
	}
	uncommon.define('underscore', function(require, module) { module.exports = root._; });
	uncommon.define('bigdecimal', function(require, module) { module.exports = root.bigdecimal; });

	uncommon.define('index.js', function(require, module) {
		module.exports.BigMoney = require('lib/BigMoney.js');
		module.exports.CurrencyUnit = require('lib/CurrencyUnit.js');
	});

	uncommon.define('lib/BigMoney.js', function(require, module) {
		var CurrencyUnit = require('lib/CurrencyUnit.js'), bigdecimal = require('bigdecimal'), _ = require('underscore');
		var BigDecimal = bigdecimal.BigDecimal, parseMoneyDecimal = /(.+)\ ([0-9]*)[.]([0-9]*)/, parseMoneyNoDecimal = /(.+)\ ([0-9]*)/;
		var BigMoney = function (currencyUnit, amount) {
		    this.toString = function () {
		        var code = this.currencyUnit.getCode(), amount = this.amount.toString();
		        return code + ' ' + amount;
		    };
		    this.plus = function (bigmoney) {
		        if (this._hasSameCurrencyUnit(bigmoney)) {
		            var amount = this.amount, amount2 = bigmoney.amount;
		            return new BigMoney(this.currencyUnit, amount.add(amount2).toString());
		        } else
		            throw new Error('This method only accepts a BigMoney value.');
		    };
		    this.dividedBy = function (value, roundingmode) {
		        if (this._isBigMoney(value) && this._hasSameCurrencyUnit(bigmoney)) {
		            return new BigMoney(this.currencyUnit, this.amount.divide(value.amount, roundingmode).setScale(this.currencyUnit.getDecimalPlaces(), roundingMode));
		        } else if (this._isBigMoney(value) && !this._hasSameCurrencyUnit(bigmoney)) {
		            throw new Error('This method only accepts a BigMoney value.');
		        } else if (this._isBigDecimal(value)) {
		            return new BigMoney(this.currencyUnit, this.amount.divide(value, roundingmode).setScale(this.currencyUnit.getDecimalPlaces(), roundingMode));
		        }
		    };
		    this.dividedBy = function (value) {
		        if (this._isBigMoney(value) && this._hasSameCurrencyUnit(bigmoney)) {
		            return new BigMoney(this.currencyUnit, this.amount.multiply(value.amount));
		        } else if (this._isBigMoney(value) && !this._hasSameCurrencyUnit(bigmoney)) {
		            throw new Error('This method only accepts a BigMoney value.');
		        } else if (this._isBigDecimal(value)) {
		            return new BigMoney(this.currencyUnit, this.amount.multiply(value));
		        }
		    };
		    this.minus = function (bigmoney) {
		        if (this._hasSameCurrencyUnit(bigmoney)) {
		            var amount = this.amount, amount2 = bigmoney.amount;
		            return new BigMoney(this.currencyUnit, amount.subtract(amount2).toString());
		        } else
		            throw new Error('This method only accepts a BigMoney value.');
		    };
		    this.negated = function () {
		        return new BigMoney(this.currencyUnit, amount.negate());
		    };
		    this.compareTo = function (bigmoney) {
		        if (this._hasSameCurrencyUnit(bigmoney)) {
		            var amount = this.amount, amount2 = bigmoney.amount;
		            return amount.compareTo(amount2);
		        } else {
		            throw new Error('This method expects a BigMoney of the same CurrencyUnit type.');
		        }
		    };
		    this.isEqual = function (bigmoney) {
		        return this.compareTo(bigmoney.amount) === 0;
		    };
		    this.isGreaterThan = function (bigmoney) {
		        return this.compareTo(bigmoney.amount) === 1;
		    };
		    this.isLessThan = function (bigmoney) {
		        return this.compareTo(bigmoney.amount) === -1;
		    };
		    this.withCurrencyScale = function (roundingMode) {
		        return new BigMoney(this.currencyUnit, new BigDecimal(this.amount).setScale(this.currencyUnit.getDecimalPlaces(), roundingMode));
		    };
		    this.getCurrencyUnit = function () {
		        return this.currencyUnit;
		    };
		    this.isCurrencyScale = function () {
		        return this.currencyUnit.getDecimalPlaces() === this.amount.scale();
		    };
		    this.isNegative = function () {
		        return !this.amount.abs().equals(this.amount) && !this.amount.equals(BigDecimal.ZERO);
		    };
		    this.isNegativeOrZero = function () {
		        return !this.amount.abs().equals(this.amount);
		    };
		    this.isPositive = function () {
		        return this.amount.abs().equals(this.amount) && !this.amount.equals(BigDecimal.ZERO);
		    };
		    this.isPositiveOrZero = function () {
		        return this.amount.abs().equals(this.amount);
		    };
		    this.isZero = function () {
		        return this.amount.equals(BigDecimal.ZERO);
		    };
		    this._isBigMoney = function (value) {
		        return value instanceof BigMoney;
		    };
		    this._isBigDecimal = function (value) {
		        return value instanceof BigDecimal;
		    };
		    this._hasSameCurrencyUnit = function (bigmoney) {
		        return this._isBigMoney(bigmoney) && this.currencyUnit.equals(bigmoney.currencyUnit);
		    };
		    this.currencyUnit = currencyUnit;
		    this.amount = new BigDecimal(amount);
		};
		BigMoney.parse = function (string) {
		    var arr, code, amount;
		    if (parseMoneyDecimal.test(string)) {
		        arr = parseMoneyDecimal.exec(string).slice(1);
		        code = arr[0];
		        amount = arr[1] + '.' + arr[2];
		    } else if (parseMoneyNoDecimal.test(string)) {
		        arr = parseMoneyNoDecimal.exec(string).slice(1);
		        code = arr[0];
		        amount = arr[1];
		    }
		    return new BigMoney(CurrencyUnit.of(code), amount);
		};
		BigMoney.of = function (currencyUnit, amount) {
		    return new BigMoney(currencyUnit, amount);
		};
		BigMoney.zero = function (currencyUnit) {
		    return new BigMoney(currencyUnit, '0');
		};
		BigMoney.RoundingMode = {};
		BigMoney.RoundingMode.UP = BigDecimal.ROUND_UP;
		BigMoney.RoundingMode.DOWN = BigDecimal.ROUND_DOWN;
		BigMoney.RoundingMode.CEILING = BigDecimal.ROUND_CEILING;
		BigMoney.RoundingMode.FLOOR = BigDecimal.ROUND_FLOOR;
		BigMoney.RoundingMode.HALF_UP = BigDecimal.ROUND_HALF_UP;
		BigMoney.RoundingMode.HALF_DOWN = BigDecimal.ROUND_HALF_DOWN;
		BigMoney.RoundingMode.HALF_EVEN = BigDecimal.ROUND_HALF_EVEN;
		BigMoney.RoundingMode.UNNECESSARY = BigDecimal.ROUND_UNNECESSARY;
		module.exports = BigMoney;
	});

	uncommon.define('lib/CurrencyUnit.js', function(require, module) {
		var _ = require('underscore'), currencyData = require('lib/currency-data.js'), currency = require('lib/i18n/currency.js');
		var CurrencyUnit = function (code, numericCode, country, decimalPlaces) {
		    this.code = code;
		    this.numericCode = numericCode;
		    this.country = country;
		    this.decimalPlaces = decimalPlaces;
		    this.getCode = function () {
		        return this.code;
		    };
		    this.getNumericCode = function () {
		        return this.numericCode;
		    };
		    this.getCountry = function () {
		        return this.country;
		    };
		    this.getSymbol = function () {
		        return currency.getLocalCurrencySign(this.code);
		    };
		    this.getDecimalPlaces = function () {
		        return this.decimalPlaces;
		    };
		    this.equals = function (currencyUnit) {
		        if (typeof currencyUnit === 'string') {
		            return this.code === currencyUnit;
		        } else if (typeof currencyUnit === 'object' && currencyUnit.code) {
		            return this.code === currencyUnit.code;
		        }
		    };
		};
		CurrencyUnit.currenciesByCode = {};
		CurrencyUnit.currenciesByNumericCode = {};
		CurrencyUnit.currenciesByCountry = {};
		CurrencyUnit._create = function (code, numericCode, decimalPlaces, country) {
		    return CurrencyUnit._register(new CurrencyUnit(code, numericCode, country, decimalPlaces));
		};
		CurrencyUnit._register = function (currencyUnit) {
		    var code = currencyUnit.getCode(), numeric = currencyUnit.getNumericCode(), country = currencyUnit.getCountry();
		    if (CurrencyUnit.currenciesByCode[code] === undefined)
		        CurrencyUnit.currenciesByCode[code] = currencyUnit;
		    if (CurrencyUnit.currenciesByNumericCode[numeric] === undefined)
		        CurrencyUnit.currenciesByNumericCode[numeric] = currencyUnit;
		    if (CurrencyUnit.currenciesByCountry[country] === undefined)
		        CurrencyUnit.currenciesByCountry[country] = currencyUnit;
		    return currencyUnit;
		};
		CurrencyUnit.of = function (code) {
		    if (CurrencyUnit.currenciesByCode[code]) {
		        return CurrencyUnit.currenciesByCode[code];
		    } else {
		        throw new Error('Could not find CurrencyCode \'' + code + '\' in \'CurrencyUnit.currenciesByCode\'');
		    }
		};
		_.each(currencyData, function (cd) {
		    CurrencyUnit._create(cd[0], cd[1], cd[2], cd[3]);
		});
		_.each([
		    'AUD',
		    'CAD',
		    'CHF',
		    'EUR',
		    'GBP',
		    'JPY',
		    'USD'
		], function (code) {
		    CurrencyUnit[code] = function () {
		        return CurrencyUnit.of(code);
		    };
		});
		module.exports = CurrencyUnit;
	});

	uncommon.define('lib/currency-data.js', function(require, module) {
		//"#Code", Numeric, DecPlaces, "CountryCodes"
		var data = [
		    ["AED", 784, 2, "AE"],
		    ["AFN", 971, 2, "AF"],
		    ["ALL", 8, 2, "AL"],
		    ["AMD", 51, 0, "AM"],
		    ["ANG", 532, 2, "AN"],
		    ["AOA", 973, 1, "AO"],
		    ["ARS", 32, 2, "AR"],
		    ["AUD", 36, 2, "AUCXCCHMKINRNFTV"],
		    ["AWG", 533, 2, "AW"],
		    ["AZN", 944, 2, "AZ"],
		    ["BAM", 977, 2, "BA"],
		    ["BBD", 52, 2, "BB"],
		    ["BDT", 50, 2, "BD"],
		    ["BGN", 975, 2, "BG"],
		    ["BHD", 48, 3, "BH"],
		    ["BIF", 108, 0, "BI"],
		    ["BMD", 60, 2, "BM"],
		    ["BND", 96, 2, "BN"],
		    ["BOB", 68, 2, "BO"],
		    ["#BOV", 984, 2, "BO"],
		    ["BRL", 986, 2, "BR"],
		    ["BSD", 44, 2, "BS"],
		    ["BTN", 64, 2, "BT"],
		    ["BWP", 72, 2, "BW"],
		    ["BYR", 974, 0, "BY"],
		    ["BZD", 84, 2, "BZ"],
		    ["CAD", 124, 2, "CA"],
		    ["CDF", 976, 2, "CD"],
		    ["#CHE", 947, 2, "CH"],
		    ["CHF", 756, 2, "CHLI"],
		    ["#CHW", 948, 2, "CH"],
		    ["#CLF", 990, 0, "CL"],
		    ["CLP", 152, 0, "CL"],
		    ["CNY", 156, 1, "CN"],
		    ["COP", 170, 0, "CO"],
		    ["#COU", 970, 2, "CO"],
		    ["CRC", 188, 2, "CR"],
		    ["#CUC", 931, 2, "CU"],
		    ["CUP", 192, 2, "CU"],
		    ["CVE", 132, 2, "CV"],
		    ["CZK", 203, 2, "CZ"],
		    ["DJF", 262, 0, "DJ"],
		    ["DKK", 208, 2, "DKFOGL"],
		    ["DOP", 214, 2, "DO"],
		    ["DZD", 12, 2, "DZ"],
		    ["EEK", 233, 2, "EE"],
		    ["EGP", 818, 2, "EG"],
		    ["ERN", 232, 2, "ER"],
		    ["ETB", 230, 2, "ET"],
		    ["EUR", 978, 2, "IEFRESPTFIBENLLUDEATITMTSKSIGRCYADMCMESMVA"],
		    ["FJD", 242, 2, "FJ"],
		    ["FKP", 238, 2, "FK"],
		    ["GBP", 826, 2, "GBIMJEGGGSIO"],
		    ["GEL", 981, 2, "GE"],
		    ["GHS", 936, 2, "GH"],
		    ["GIP", 292, 2, "GI"],
		    ["GMD", 270, 2, "GM"],
		    ["GNF", 324, 0, "GN"],
		    ["GTQ", 320, 2, "GT"],
		    ["GYD", 328, 2, "GY"],
		    ["HKD", 344, 2, "HK"],
		    ["HNL", 340, 2, "HN"],
		    ["HRK", 191, 2, "HR"],
		    ["HTG", 332, 2, "HT"],
		    ["HUF", 348, 2, "HU"],
		    ["IDR", 360, 0, "ID"],
		    ["ILS", 376, 2, "IL"],
		    ["INR", 356, 2, "IN"],
		    ["IQD", 368, 0, "IQ"],
		    ["IRR", 364, 0, "IR"],
		    ["ISK", 352, 0, "IS"],
		    ["JMD", 388, 2, "JM"],
		    ["JOD", 400, 3, "JO"],
		    ["JPY", 392, 0, "JP"],
		    ["KES", 404, 2, "KE"],
		    ["KGS", 417, 2, "KG"],
		    ["KHR", 116, 0, "KH"],
		    ["KMF", 174, 0, "KM"],
		    ["KPW", 408, 0, "KP"],
		    ["KRW", 410, 0, "KR"],
		    ["KWD", 414, 3, "KW"],
		    ["KYD", 136, 2, "KY"],
		    ["KZT", 398, 2, "KZ"],
		    ["LAK", 418, 0, "LA"],
		    ["LBP", 422, 0, "LB"],
		    ["LKR", 144, 2, "LK"],
		    ["LRD", 430, 2, "LR"],
		    ["LSL", 426, 2, "LS"],
		    ["LTL", 440, 2, "LT"],
		    ["LVL", 428, 2, "LV"],
		    ["LYD", 434, 3, "LY"],
		    ["MAD", 504, 2, "MAEH"],
		    ["MDL", 498, 2, "MD"],
		    ["MGA", 969, 1, "MG#Adjusted decimal places"],
		    ["MKD", 807, 2, "MK"],
		    ["MMK", 104, 0, "MM"],
		    ["MNT", 496, 2, "MN"],
		    ["MOP", 446, 1, "MO"],
		    ["MRO", 478, 1, "MR#Adjusted decimal places"],
		    ["MUR", 480, 2, "MU"],
		    ["MVR", 462, 2, "MV"],
		    ["MWK", 454, 2, "MW"],
		    ["MXN", 484, 2, "MX"],
		    ["#MXV", 979, 2, "MX"],
		    ["MYR", 458, 2, "MY"],
		    ["MZN", 943, 2, "MZ"],
		    ["NAD", 516, 2, "NA"],
		    ["NGN", 566, 2, "NG"],
		    ["NIO", 558, 2, "NI"],
		    ["NOK", 578, 2, "NOBV"],
		    ["NPR", 524, 2, "NP"],
		    ["NZD", 554, 2, "NZCKNUPNTK"],
		    ["OMR", 512, 3, "OM"],
		    ["PAB", 590, 2, "PA"],
		    ["PEN", 604, 2, "PE"],
		    ["PGK", 598, 2, "PG"],
		    ["PHP", 608, 2, "PH"],
		    ["PKR", 586, 2, "PK"],
		    ["PLN", 985, 2, "PL"],
		    ["PYG", 600, 0, "PY"],
		    ["QAR", 634, 2, "QA"],
		    ["RON", 946, 2, "RO"],
		    ["RSD", 941, 2, "RS"],
		    ["RUB", 643, 2, "RU"],
		    ["RWF", 646, 0, "RW"],
		    ["SAR", 682, 2, "SA"],
		    ["SBD", 90, 2, "SB"],
		    ["SCR", 690, 2, "SC"],
		    ["SDG", 938, 2, "SD"],
		    ["SEK", 752, 2, "SE"],
		    ["SGD", 702, 2, "SG"],
		    ["SHP", 654, 2, "SH"],
		    ["SLL", 694, 0, "SL"],
		    ["SOS", 706, 2, "SO"],
		    ["SRD", 968, 2, "SR"],
		    ["STD", 678, 0, "ST"],
		    ["SYP", 760, 2, "SY"],
		    ["SZL", 748, 2, "SZ"],
		    ["THB", 764, 2, "TH"],
		    ["TJS", 972, 2, "TJ"],
		    ["TMT", 934, 2, "TM"],
		    ["TND", 788, 3, "TN"],
		    ["TOP", 776, 2, "TO"],
		    ["TRY", 949, 2, "TR"],
		    ["TTD", 780, 2, "TT"],
		    ["TWD", 901, 1, "TW"],
		    ["TZS", 834, 2, "TZ"],
		    ["UAH", 980, 2, "UA"],
		    ["UGX", 800, 0, "UG"],
		    ["USD", 840, 2, "USASECSVGUMHFMMPPWPRTLTCVGVI#HTPA"],
		    ["#USN", 997, 2, "US"],
		    ["#USS", 998, 2, "US"],
		    ["UYU", 858, 2, "UY"],
		    ["UZS", 860, 2, "UZ"],
		    ["VEF", 937, 2, "VE"],
		    ["VND", 704, 0, "VN"],
		    ["VUV", 548, 0, "VU"],
		    ["WST", 882, 2, "WS"],
		    ["XAF", 950, 0, "CMCFCGTDGQGA"],
		    ["XAG", 961, -1, ""],
		    ["XAU", 959, -1, ""],
		    ["XBA", 955, -1, ""],
		    ["XBB", 956, -1, ""],
		    ["XBC", 957, -1, ""],
		    ["XBD", 958, -1, ""],
		    ["XCD", 951, 2, "AIAGDMGDMSKNLCVC"],
		    ["XDR", 960, -1, ""],
		    ["XFU", -1, -1, ""],
		    ["XOF", 952, 0, "BJBFCIGWMLNESNTG"],
		    ["XPD", 964, -1, ""],
		    ["XPF", 953, 0, "PFNCWF"],
		    ["XPT", 962, -1, ""],
		    ["XTS", 963, -1, ""],
		    ["XXX", 999, -1, ""],
		    ["YER", 886, 0, "YE"],
		    ["ZAR", 710, 2, "ZA"],
		    ["ZMK", 894, 0, "ZM"],
		    ["ZWL", 932, 2, "ZW"]
		];
		
		module.exports = data;
		
	});

	uncommon.define('lib/i18n/currency.js', function(require, module) {
		var goog = {};
		goog.i18n = {};
		goog.i18n.currency = {};
		goog.i18n.currency.PRECISION_MASK_ = 7;
		goog.i18n.currency.POSITION_FLAG_ = 8;
		goog.i18n.currency.SPACE_FLAG_ = 32;
		goog.i18n.currency.addTier2Support = function () {
		    for (var key in goog.i18n.currency.CurrencyInfoTier2) {
		        goog.i18n.currency.CurrencyInfo[key] = goog.i18n.currency.CurrencyInfoTier2[key];
		    }
		};
		goog.i18n.currency.getGlobalCurrencyPattern = function (currencyCode) {
		    var info = goog.i18n.currency.CurrencyInfo[currencyCode];
		    var patternNum = info[0];
		    if (currencyCode == info[1]) {
		        return goog.i18n.currency.getCurrencyPattern_(patternNum, info[1]);
		    }
		    return currencyCode + ' ' + goog.i18n.currency.getCurrencyPattern_(patternNum, info[1]);
		};
		goog.i18n.currency.getGlobalCurrencySign = function (currencyCode) {
		    var info = goog.i18n.currency.CurrencyInfo[currencyCode];
		    return currencyCode == info[1] ? currencyCode : currencyCode + ' ' + info[1];
		};
		goog.i18n.currency.getLocalCurrencyPattern = function (currencyCode) {
		    var info = goog.i18n.currency.CurrencyInfo[currencyCode];
		    return goog.i18n.currency.getCurrencyPattern_(info[0], info[1]);
		};
		goog.i18n.currency.getLocalCurrencySign = function (currencyCode) {
		    return goog.i18n.currency.CurrencyInfo[currencyCode][1];
		};
		goog.i18n.currency.getPortableCurrencyPattern = function (currencyCode) {
		    var info = goog.i18n.currency.CurrencyInfo[currencyCode];
		    return goog.i18n.currency.getCurrencyPattern_(info[0], info[2]);
		};
		goog.i18n.currency.getPortableCurrencySign = function (currencyCode) {
		    return goog.i18n.currency.CurrencyInfo[currencyCode][2];
		};
		goog.i18n.currency.isPrefixSignPosition = function (currencyCode) {
		    return (goog.i18n.currency.CurrencyInfo[currencyCode][0] & goog.i18n.currency.POSITION_FLAG_) == 0;
		};
		goog.i18n.currency.getCurrencyPattern_ = function (patternNum, sign) {
		    var strParts = [
		            '#,##0'
		        ];
		    var precision = patternNum & goog.i18n.currency.PRECISION_MASK_;
		    if (precision > 0) {
		        strParts.push('.');
		        for (var i = 0; i < precision; i++) {
		            strParts.push('0');
		        }
		    }
		    if ((patternNum & goog.i18n.currency.POSITION_FLAG_) == 0) {
		        strParts.unshift(patternNum & goog.i18n.currency.SPACE_FLAG_ ? '\' ' : '\'');
		        strParts.unshift(sign);
		        strParts.unshift('\'');
		    } else {
		        strParts.push(patternNum & goog.i18n.currency.SPACE_FLAG_ ? ' \'' : '\'', sign, '\'');
		    }
		    return strParts.join('');
		};
		goog.i18n.currency.adjustPrecision = function (pattern, currencyCode) {
		    var strParts = [
		            '0'
		        ];
		    var info = goog.i18n.currency.CurrencyInfo[currencyCode];
		    var precision = info[0] & goog.i18n.currency.PRECISION_MASK_;
		    if (precision > 0) {
		        strParts.push('.');
		        for (var i = 0; i < precision; i++) {
		            strParts.push('0');
		        }
		    }
		    return pattern.replace(/0.00/g, strParts.join(''));
		};
		goog.i18n.currency.CurrencyInfo = {
		    'AED': [
		        2,
		        'dh',
		        '\u062f.\u0625.',
		        'DH'
		    ],
		    'AUD': [
		        2,
		        '$',
		        'AU$'
		    ],
		    'BDT': [
		        2,
		        '\u09f3',
		        'Tk'
		    ],
		    'BRL': [
		        2,
		        'R$',
		        'R$'
		    ],
		    'CAD': [
		        2,
		        '$',
		        'C$'
		    ],
		    'CHF': [
		        2,
		        'CHF',
		        'CHF'
		    ],
		    'CLP': [
		        0,
		        '$',
		        'CL$'
		    ],
		    'CNY': [
		        2,
		        '\xa5',
		        'RMB\xa5'
		    ],
		    'COP': [
		        0,
		        '$',
		        'COL$'
		    ],
		    'CRC': [
		        0,
		        '\u20a1',
		        'CR\u20a1'
		    ],
		    'CZK': [
		        2,
		        'K\u010d',
		        'K\u010d'
		    ],
		    'DKK': [
		        18,
		        'kr',
		        'kr'
		    ],
		    'DOP': [
		        2,
		        '$',
		        'RD$'
		    ],
		    'EGP': [
		        2,
		        '\xa3',
		        'LE'
		    ],
		    'EUR': [
		        18,
		        '\u20ac',
		        '\u20ac'
		    ],
		    'GBP': [
		        2,
		        '\xa3',
		        'GB\xa3'
		    ],
		    'HKD': [
		        2,
		        '$',
		        'HK$'
		    ],
		    'ILS': [
		        2,
		        '\u20aa',
		        'IL\u20aa'
		    ],
		    'INR': [
		        2,
		        '\u20b9',
		        'Rs'
		    ],
		    'ISK': [
		        0,
		        'kr',
		        'kr'
		    ],
		    'JMD': [
		        2,
		        '$',
		        'JA$'
		    ],
		    'JPY': [
		        0,
		        '\xa5',
		        'JP\xa5'
		    ],
		    'KRW': [
		        0,
		        '\u20a9',
		        'KR\u20a9'
		    ],
		    'LKR': [
		        2,
		        'Rs',
		        'SLRs'
		    ],
		    'MNT': [
		        0,
		        '\u20ae',
		        'MN\u20ae'
		    ],
		    'MXN': [
		        2,
		        '$',
		        'Mex$'
		    ],
		    'MYR': [
		        2,
		        'RM',
		        'RM'
		    ],
		    'NOK': [
		        18,
		        'kr',
		        'NOkr'
		    ],
		    'PAB': [
		        2,
		        'B/.',
		        'B/.'
		    ],
		    'PEN': [
		        2,
		        'S/.',
		        'S/.'
		    ],
		    'PHP': [
		        2,
		        '\u20b1',
		        'Php'
		    ],
		    'PKR': [
		        0,
		        'Rs',
		        'PKRs.'
		    ],
		    'RUB': [
		        2,
		        'Rup',
		        'Rup'
		    ],
		    'SAR': [
		        2,
		        'Rial',
		        'Rial'
		    ],
		    'SEK': [
		        2,
		        'kr',
		        'kr'
		    ],
		    'SGD': [
		        2,
		        '$',
		        'S$'
		    ],
		    'THB': [
		        2,
		        '\u0e3f',
		        'THB'
		    ],
		    'TRY': [
		        2,
		        'TL',
		        'YTL'
		    ],
		    'TWD': [
		        2,
		        'NT$',
		        'NT$'
		    ],
		    'USD': [
		        2,
		        '$',
		        'US$'
		    ],
		    'UYU': [
		        2,
		        '$',
		        'UY$'
		    ],
		    'VND': [
		        0,
		        '\u20ab',
		        'VN\u20ab'
		    ],
		    'YER': [
		        0,
		        'Rial',
		        'Rial'
		    ],
		    'ZAR': [
		        2,
		        'R',
		        'ZAR'
		    ]
		};
		goog.i18n.currency.CurrencyInfoTier2 = {
		    'AFN': [
		        16,
		        'Af.',
		        'AFN'
		    ],
		    'ALL': [
		        0,
		        'Lek',
		        'Lek'
		    ],
		    'AMD': [
		        0,
		        'Dram',
		        'dram'
		    ],
		    'AOA': [
		        2,
		        'Kz',
		        'Kz'
		    ],
		    'ARS': [
		        2,
		        '$',
		        'AR$'
		    ],
		    'AWG': [
		        2,
		        'Afl.',
		        'Afl.'
		    ],
		    'AZN': [
		        2,
		        'man.',
		        'man.'
		    ],
		    'BAM': [
		        18,
		        'KM',
		        'KM'
		    ],
		    'BBD': [
		        2,
		        '$',
		        'Bds$'
		    ],
		    'BGN': [
		        2,
		        'lev',
		        'lev'
		    ],
		    'BHD': [
		        3,
		        'din',
		        'din'
		    ],
		    'BIF': [
		        0,
		        'FBu',
		        'FBu'
		    ],
		    'BMD': [
		        2,
		        '$',
		        'BD$'
		    ],
		    'BND': [
		        2,
		        '$',
		        'B$'
		    ],
		    'BOB': [
		        2,
		        'Bs',
		        'Bs'
		    ],
		    'BSD': [
		        2,
		        '$',
		        'BS$'
		    ],
		    'BTN': [
		        2,
		        'Nu.',
		        'Nu.'
		    ],
		    'BWP': [
		        2,
		        'P',
		        'pula'
		    ],
		    'BYR': [
		        0,
		        'BYR',
		        'BYR'
		    ],
		    'BZD': [
		        2,
		        '$',
		        'BZ$'
		    ],
		    'CDF': [
		        2,
		        'FrCD',
		        'CDF'
		    ],
		    'CUC': [
		        1,
		        '$',
		        'CUC$'
		    ],
		    'CUP': [
		        2,
		        '$',
		        'CU$'
		    ],
		    'CVE': [
		        2,
		        'CVE',
		        'Esc'
		    ],
		    'DJF': [
		        0,
		        'Fdj',
		        'Fdj'
		    ],
		    'DZD': [
		        2,
		        'din',
		        'din'
		    ],
		    'ERN': [
		        2,
		        'Nfk',
		        'Nfk'
		    ],
		    'ETB': [
		        2,
		        'Birr',
		        'Birr'
		    ],
		    'FJD': [
		        2,
		        '$',
		        'FJ$'
		    ],
		    'FKP': [
		        2,
		        '\xa3',
		        'FK\xa3'
		    ],
		    'GEL': [
		        2,
		        'GEL',
		        'GEL'
		    ],
		    'GHS': [
		        2,
		        'GHS',
		        'GHS'
		    ],
		    'GIP': [
		        2,
		        '\xa3',
		        'GI\xa3'
		    ],
		    'GMD': [
		        2,
		        'GMD',
		        'GMD'
		    ],
		    'GNF': [
		        0,
		        'FG',
		        'FG'
		    ],
		    'GTQ': [
		        2,
		        'Q',
		        'GTQ'
		    ],
		    'GYD': [
		        0,
		        '$',
		        'GY$'
		    ],
		    'HNL': [
		        2,
		        'L',
		        'HNL'
		    ],
		    'HRK': [
		        2,
		        'kn',
		        'kn'
		    ],
		    'HTG': [
		        2,
		        'HTG',
		        'HTG'
		    ],
		    'HUF': [
		        0,
		        'Ft',
		        'Ft'
		    ],
		    'IDR': [
		        0,
		        'Rp',
		        'Rp'
		    ],
		    'IQD': [
		        0,
		        'din',
		        'IQD'
		    ],
		    'IRR': [
		        0,
		        'Rial',
		        'IRR'
		    ],
		    'JOD': [
		        3,
		        'din',
		        'JOD'
		    ],
		    'KES': [
		        2,
		        'Ksh',
		        'Ksh'
		    ],
		    'KGS': [
		        2,
		        'KGS',
		        'KGS'
		    ],
		    'KHR': [
		        2,
		        'Riel',
		        'KHR'
		    ],
		    'KMF': [
		        0,
		        'CF',
		        'KMF'
		    ],
		    'KPW': [
		        0,
		        '\u20a9KP',
		        'KPW'
		    ],
		    'KWD': [
		        3,
		        'din',
		        'KWD'
		    ],
		    'KYD': [
		        2,
		        '$',
		        'KY$'
		    ],
		    'KZT': [
		        2,
		        '\u20b8',
		        'KZT'
		    ],
		    'LAK': [
		        0,
		        '\u20ad',
		        '\u20ad'
		    ],
		    'LBP': [
		        0,
		        'L\xa3',
		        'LBP'
		    ],
		    'LRD': [
		        2,
		        '$',
		        'L$'
		    ],
		    'LSL': [
		        2,
		        'LSL',
		        'LSL'
		    ],
		    'LTL': [
		        2,
		        'Lt',
		        'Lt'
		    ],
		    'LVL': [
		        2,
		        'Ls',
		        'Ls'
		    ],
		    'LYD': [
		        3,
		        'din',
		        'LD'
		    ],
		    'MAD': [
		        2,
		        'dh',
		        'MAD'
		    ],
		    'MDL': [
		        2,
		        'MDL',
		        'MDL'
		    ],
		    'MGA': [
		        0,
		        'Ar',
		        'MGA'
		    ],
		    'MKD': [
		        2,
		        'din',
		        'MKD'
		    ],
		    'MMK': [
		        0,
		        'K',
		        'MMK'
		    ],
		    'MOP': [
		        2,
		        'MOP',
		        'MOP$'
		    ],
		    'MRO': [
		        0,
		        'MRO',
		        'MRO'
		    ],
		    'MUR': [
		        0,
		        'MURs',
		        'MURs'
		    ],
		    'MWK': [
		        2,
		        'MWK',
		        'MWK'
		    ],
		    'MZN': [
		        2,
		        'MTn',
		        'MTn'
		    ],
		    'NAD': [
		        2,
		        '$',
		        'N$'
		    ],
		    'NGN': [
		        2,
		        '\u20a6',
		        'NG\u20a6'
		    ],
		    'NIO': [
		        2,
		        'C$',
		        'C$'
		    ],
		    'NPR': [
		        2,
		        'Rs',
		        'NPRs'
		    ],
		    'NZD': [
		        2,
		        '$',
		        'NZ$'
		    ],
		    'OMR': [
		        3,
		        'Rial',
		        'OMR'
		    ],
		    'PGK': [
		        2,
		        'PGK',
		        'PGK'
		    ],
		    'PLN': [
		        2,
		        'z\u0142',
		        'z\u0142'
		    ],
		    'PYG': [
		        0,
		        'Gs',
		        'PYG'
		    ],
		    'QAR': [
		        2,
		        'Rial',
		        'QR'
		    ],
		    'RON': [
		        2,
		        'RON',
		        'RON'
		    ],
		    'RSD': [
		        0,
		        'din',
		        'RSD'
		    ],
		    'RWF': [
		        0,
		        'RF',
		        'RF'
		    ],
		    'SBD': [
		        2,
		        '$',
		        'SI$'
		    ],
		    'SCR': [
		        2,
		        'SCR',
		        'SCR'
		    ],
		    'SDG': [
		        2,
		        'SDG',
		        'SDG'
		    ],
		    'SHP': [
		        2,
		        '\xa3',
		        'SH\xa3'
		    ],
		    'SLL': [
		        0,
		        'SLL',
		        'SLL'
		    ],
		    'SOS': [
		        0,
		        'SOS',
		        'SOS'
		    ],
		    'SRD': [
		        2,
		        '$',
		        'SR$'
		    ],
		    'STD': [
		        0,
		        'Db',
		        'Db'
		    ],
		    'SYP': [
		        16,
		        '\xa3',
		        'SY\xa3'
		    ],
		    'SZL': [
		        2,
		        'SZL',
		        'SZL'
		    ],
		    'TJS': [
		        2,
		        'Som',
		        'TJS'
		    ],
		    'TND': [
		        3,
		        'din',
		        'DT'
		    ],
		    'TOP': [
		        2,
		        'T$',
		        'T$'
		    ],
		    'TTD': [
		        2,
		        '$',
		        'TT$'
		    ],
		    'TZS': [
		        0,
		        'TSh',
		        'TSh'
		    ],
		    'UAH': [
		        2,
		        '\u20b4',
		        'UAH'
		    ],
		    'UGX': [
		        0,
		        'UGX',
		        'UGX'
		    ],
		    'UYU': [
		        1,
		        '$',
		        '$U'
		    ],
		    'UZS': [
		        0,
		        'so\u02bcm',
		        'UZS'
		    ],
		    'VEF': [
		        2,
		        'Bs',
		        'Bs'
		    ],
		    'VUV': [
		        0,
		        'VUV',
		        'VUV'
		    ],
		    'WST': [
		        2,
		        'WST',
		        'WST'
		    ],
		    'XAF': [
		        0,
		        'FCFA',
		        'FCFA'
		    ],
		    'XCD': [
		        2,
		        '$',
		        'EC$'
		    ],
		    'XOF': [
		        0,
		        'CFA',
		        'CFA'
		    ],
		    'XPF': [
		        0,
		        'FCFP',
		        'FCFP'
		    ],
		    'ZMK': [
		        0,
		        'ZMK',
		        'ZMK'
		    ]
		};
		module.exports = goog.i18n.currency;
	});

	root.BigMoney = uncommon('index.js');
})(this);