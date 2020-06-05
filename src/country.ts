import {find, orderBy} from 'lodash';
import {CountryModel} from './types';

export class Country {
    private static countryCodes: {
        [key: string]: { [key: string]: string }
    } = {};
    private static countries: CountryModel[] = null;

    static addCountryCode(iso2: string, dialCode: string, priority?: number) {
        if (!(dialCode in Country.countryCodes)) {
            Country.countryCodes[dialCode] = {};
        }

        const index = priority || 0;
        Country.countryCodes[dialCode][index] = iso2;
    }

    static getAll() {
        if (!Country.countries) {
            Country.countries = orderBy(require('./resources/countries.json') as CountryModel[], ['name'], ['asc']);
        }

        return Country.countries;
    }

    static getCountryCodes() {
        if (!Country.countryCodes.length) {
            Country.getAll().map((country) => {
                Country.addCountryCode(country.iso2, country.dialCode, country.priority);
                if (country.areaCodes) {
                    country.areaCodes.map((areaCode) => {
                        Country.addCountryCode(country.iso2, country.dialCode + areaCode);
                    });
                }
            });
        }

        return Country.countryCodes;
    }

    static getCountryDataByCode(iso2: string): CountryModel {
        return find(Country.getAll(), country => country.iso2 === iso2);
    }
}

