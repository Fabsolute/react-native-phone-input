import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {
    Image,
    ImageRequireSource,
    ImageStyle,
    StyleProp,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';

import {PhoneNumber} from './phone-number';
import {styles} from './styles';
import {CountryPicker, CountryPickerRefProps} from './country-picker';
import {FlagLookup} from './resources/flags';
import {CountryModel} from './types';


type Props = {
    initialCountry: string;
    disabled: boolean;
    style?: StyleProp<ViewStyle>;
    flagStyle?: StyleProp<ImageStyle>;
    textStyle?: StyleProp<TextStyle>
    offset?: number;
    textProps?: Partial<TextInputProps>;
    pickerButtonColor?: string;
    pickerButtonTextStyle?: StyleProp<TextStyle>;
    cancelText?: string;
    confirmText?: string;
    pickerBackgroundColor?: string;
    pickerItemStyle?: StyleProp<TextStyle>;
    onPressCancel?: () => void;
    onPressFlag?: () => void;
    onChangePhoneNumber?: (number: string) => void;
    onSelectCountry?: (country: string) => void;
    allowZeroAfterCountryCode?: boolean;
    value?: string;
};

export type PickerData = {
    key: number;
    image: ImageRequireSource;
    label: string;
    dialCode: string;
    iso2: string;
};

export type PhoneInputRefProps = {
    focus: () => void;
    blur: () => void;
    getPickerData: () => PickerData[];
    getAllCountries: () => CountryModel[];
    getFlag: (iso2: string) => ImageRequireSource;
    getDialCode: () => string;
    getValue: () => string;
    getNumberType: () => string;
    isValidNumber: () => boolean;
};

export const PhoneInput = memo(forwardRef<PhoneInputRefProps, Props>(
    function PhoneInput(props, ref) {
        const countryData = PhoneNumber.getCountryDataByCode(props.initialCountry);
        const inputPhone = useRef<TextInput>();
        const picker = useRef<CountryPickerRefProps>();

        const [iso2, setISO2] = useState(props.initialCountry);
        const [formattedNumber, setFormattedNumber] = useState(countryData ? `+${countryData.dialCode}` : '');
        const [inputValue, setInputValue] = useState('');

        const getISOCode = useCallback(() => iso2, [iso2]);
        const getCountryCode = useCallback(() => {
            const countryData = PhoneNumber.getCountryDataByCode(iso2);
            return countryData ? countryData.dialCode : null;
        }, [iso2]);
        const focus = () => inputPhone.current.focus();
        const blur = () => inputPhone.current.blur();
        const getPickerData = ()=> PhoneNumber.getAllCountries().map((country: CountryModel, index: number) => ({
            key: index,
            image: FlagLookup[country.iso2],
            label: country.name,
            dialCode: `+${country.dialCode}`,
            iso2: country.iso2,
        }));
        const getAllCountries = () => PhoneNumber.getAllCountries();
        const getFlag = (iso2: string) => FlagLookup[iso2];
        const getDialCode = () => PhoneNumber.getDialCode(formattedNumber);
        const getValue = () => formattedNumber.replace(/\s/g, '');
        const getNumberType = () => PhoneNumber.getNumberType(formattedNumber, iso2);
        const isValidNumber = () => {
            if (inputValue.length < 3) {
                return false;
            }

            return PhoneNumber.isValidNumber(formattedNumber, iso2);
        };

        useImperativeHandle(ref, () => ({
            focus, blur,
            getPickerData,
            getAllCountries, getFlag, getDialCode,
            getValue, getNumberType, isValidNumber,
        }));

        const onPressFlag = useCallback(() => {
            if (props.onPressFlag) {
                props.onPressFlag();
            } else {
                if (iso2) {
                    picker.current.selectCountry(iso2);
                }

                picker.current.show();
            }
        }, [iso2, props.onPressFlag]);

        const possiblyEliminateZeroAfterCountryCode = useCallback((number: string) => {
            const dialCode = PhoneNumber.getDialCode(number);
            return number.startsWith(`${dialCode}0`)
                ? dialCode + number.substr(dialCode.length + 1)
                : number;
        }, []);

        const updateFlagAndFormatNumber = useCallback((number: string) => {
            let iso2 = getISOCode() || props.initialCountry;
            let formattedPhoneNumber = number;
            if (number) {
                const countryCode = getCountryCode();
                if (formattedPhoneNumber[0] !== '+' && countryCode !== null) {
                    formattedPhoneNumber = '+' + countryCode.toString() + formattedPhoneNumber.toString();
                }
                formattedPhoneNumber = props.allowZeroAfterCountryCode
                    ? formattedPhoneNumber
                    : possiblyEliminateZeroAfterCountryCode(formattedPhoneNumber);
                iso2 = PhoneNumber.getCountryCodeOfNumber(formattedPhoneNumber);
            }

            setISO2(iso2);
            setFormattedNumber(formattedPhoneNumber);
            setInputValue(number);
        }, [getISOCode, getCountryCode, props.allowZeroAfterCountryCode, props.initialCountry, possiblyEliminateZeroAfterCountryCode]);


        const onChangePhoneNumber = useCallback((number: string) => {
            updateFlagAndFormatNumber(number);

            if (props.onChangePhoneNumber) {
                props.onChangePhoneNumber(number);
            }
        }, [props.onChangePhoneNumber, updateFlagAndFormatNumber]);

        const selectCountry = useCallback((newISO2: string) => {
            if (iso2 !== newISO2) {
                const countryData = PhoneNumber.getCountryDataByCode(newISO2);
                if (countryData) {
                    setISO2(newISO2);
                    setFormattedNumber(`+${countryData.dialCode}`);

                    updateFlagAndFormatNumber(inputValue);
                    if (props.onSelectCountry) {
                        props.onSelectCountry(newISO2);
                    }
                }
            }
        }, [updateFlagAndFormatNumber, iso2, props.onSelectCountry, inputValue]);

        useEffect(() => {
            if (inputValue === props.value || props.value == null) {
                return;
            }

            updateFlagAndFormatNumber(props.value);
        }, [props.value]);

        return (
            <View style={[styles.container, props.style]}>
                <TouchableWithoutFeedback onPress={onPressFlag} disabled={props.disabled}>
                    <Image source={FlagLookup[iso2]} style={[styles.flag, props.flagStyle]}/>
                </TouchableWithoutFeedback>
                <View style={{flex: 1, marginLeft: props.offset || 10}}>
                    <TextInput
                        ref={inputPhone}
                        editable={!props.disabled}
                        autoCorrect={false}
                        style={[styles.text, props.textStyle]}
                        onChangeText={onChangePhoneNumber}
                        keyboardType="phone-pad"
                        underlineColorAndroid="rgba(0,0,0,0)"
                        value={inputValue}
                        {...props.textProps}
                    />
                </View>

                <CountryPicker
                    ref={picker}
                    selectedCountry={iso2}
                    onSubmit={selectCountry}
                    buttonColor={props.pickerButtonColor}
                    buttonTextStyle={props.pickerButtonTextStyle}
                    cancelText={props.cancelText}
                    confirmText={props.confirmText}
                    pickerBackgroundColor={props.pickerBackgroundColor}
                    itemStyle={props.pickerItemStyle}
                    onPressCancel={props.onPressCancel}
                />
            </View>
        );
    },
));
