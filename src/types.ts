export type CountryModel = {
    name: string;
    iso2: string;
    dialCode: string;
    priority: number;
    areaCodes?: string[];
};
