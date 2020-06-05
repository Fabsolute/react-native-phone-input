import {Country} from './country';
import {first, findKey} from 'lodash';
import {AsYouTypeFormatter, PhoneNumberUtil} from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

const numberType = {
    'FIXED_LINE': 0,
    'MOBILE': 1,
    'FIXED_LINE_OR_MOBILE': 2,
    'TOLL_FREE': 3,
    'PREMIUM_RATE': 4,
    'SHARED_COST': 5,
    'VOIP': 6,
    'PERSONAL_NUMBER': 7,
    'PAGER': 8,
    'UAN': 9,
    'VOICEMAIL': 10,
    'UNKNOWN': -1,
};

export class PhoneNumber {
    static getAllCountries() {
        return Country.getAll();
    }

    static getDialCode(number: string) {
        let dialCode = '';
        // only interested in international numbers (starting with a plus)
        if (number.charAt(0) === '+') {
            let numericChars = '';
            // iterate over chars
            for (let i = 0; i < number.length; i++) {
                const c = number.charAt(i);
                // if char is number
                if (PhoneNumber.isNumeric(c)) {
                    numericChars += c;
                    // if current numericChars make a valid dial code
                    if (Country.getCountryCodes()[numericChars]) {
                        // store the actual raw string (useful for matching later)
                        dialCode = number.substr(0, i + 1);
                    }
                    // longest dial code is 4 chars
                    if (numericChars.length === 4) {
                        break;
                    }
                }
            }
        }
        return dialCode;
    }

    static getNumeric(str: string) {
        return str.replace(/\D/g, '');
    }

    static isNumeric(n: string | number) {
        return !isNaN(parseFloat(n as string)) && isFinite(n as number);
    }

    static getCountryCodeOfNumber(number: string) {
        const dialCode = PhoneNumber.getDialCode(number);
        const numeric = PhoneNumber.getNumeric(dialCode);
        const countryCode = Country.getCountryCodes()[numeric];

        // countryCode[0] can be null -> get first element that is not null
        if (countryCode) {
            return first(Object.values(countryCode).filter(iso2 => iso2));
        }

        return '';
    }

    static parse(number: string, iso2: string) {
        try {
            return phoneUtil.parse(number, iso2);
        } catch (err) {
            console.log(`Exception was thrown: ${err.toString()}`);
            return null;
        }
    }

    static isValidNumber(number: string, iso2: string) {
        const phoneInfo = PhoneNumber.parse(number, iso2);

        if (phoneInfo) {
            return phoneUtil.isValidNumber(phoneInfo);
        }

        return false;
    }

    static format(number: string, iso2: string) {
        const formatter = new AsYouTypeFormatter(iso2);
        let formatted = '';

        number.replace(/-/g, '')
            .replace(/ /g, '')
            .split('')
            .forEach(n => formatted = formatter.inputDigit(n));

        return formatted;
    }

    static getNumberType(number: string, iso2: string) {
        const phoneInfo = PhoneNumber.parse(number, iso2);
        const type = phoneInfo ? phoneUtil.getNumberType(phoneInfo) : -1;
        return findKey(numberType, noType => noType === type);
    }

    static getCountryDataByCode(iso2: string) {
        return Country.getCountryDataByCode(iso2);
    }
}
