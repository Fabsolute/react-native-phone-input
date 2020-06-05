import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Text, TouchableOpacity, View, Modal, StyleProp, TextStyle} from 'react-native';

import {Country} from './country';
import {styles} from './styles';
import {Picker} from '@react-native-community/picker';
import {ItemValue} from '@react-native-community/picker/typings/Picker';

export type CountryPickerRefProps = {
    selectCountry: (country: string) => void;
    show: () => void;
};

type Props = {
    pickerBackgroundColor?: string;
    buttonColor: string;
    itemStyle?: StyleProp<TextStyle>;
    buttonTextStyle?: StyleProp<TextStyle>;
    selectedCountry?: string;
    cancelText?: string;
    confirmText?: string;
    onSubmit?: (country: string) => void;
    onPressCancel?: () => void;
};

export const CountryPicker = memo(forwardRef<CountryPickerRefProps, Props>(
    function CountryPicker(props, ref) {
        const pickerRef = useRef<Picker>();
        const [modalVisible, setModalVisible] = useState(false);
        const [selectedCountry, setSelectedCountry] = useState(props.selectedCountry || Country.getAll()[0].iso2);

        const buttonColor = props.buttonColor || '#007AFF';

        const onValueChange = useCallback((item: ItemValue) => {
            setSelectedCountry(item as string);
        }, []);

        const onPressSubmit = useCallback(() => {
            if (props.onSubmit) {
                props.onSubmit(selectedCountry);
            }

            setModalVisible(false);
        }, [selectedCountry, props.onSubmit]);

        const onPressCancel = useCallback(() => {
            if (props.onPressCancel) {
                props.onPressCancel();
            }

            setModalVisible(false);
        }, [props.onPressCancel]);

        const show = useCallback(() => {
            setModalVisible(true);
        }, []);

        useImperativeHandle(ref, () => ({
            show,
            selectCountry: setSelectedCountry,
        }));

        useEffect(() => {
            if (props.selectedCountry) {
                setSelectedCountry(props.selectedCountry);
            }
        }, [props.selectedCountry]);

        return (
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.basicContainer}>
                    <View style={[styles.modalContainer, {backgroundColor: props.pickerBackgroundColor || 'white'}]}>
                        <View style={styles.buttonView}>
                            <TouchableOpacity onPress={onPressCancel}>
                                <Text style={[{color: buttonColor}, props.buttonTextStyle]}>
                                    {props.cancelText || 'Cancel'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onPressSubmit}>
                                <Text style={[{color: buttonColor}, props.buttonTextStyle]}>
                                    {props.confirmText || 'Confirm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Picker
                            ref={pickerRef}
                            style={styles.bottomPicker}
                            selectedValue={selectedCountry}
                            onValueChange={onValueChange}
                            itemStyle={props.itemStyle}
                            mode="dialog">
                            {
                                Country.getAll().map(country => (
                                    <Picker.Item key={country.iso2} value={country.iso2} label={country.name}/>
                                ))
                            }
                        </Picker>
                    </View>
                </View>
            </Modal>
        );
    },
));
