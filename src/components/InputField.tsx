import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {colors} from '../theme/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const InputField = ({
  label,
  error,
  containerStyle,
  ...props
}: InputFieldProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : styles.inputContainerNormal,
        ]}>
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.gray[400]}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: colors.gray[100],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  inputContainerNormal: {
    borderBottomColor: colors.gray[300],
  },
  inputContainerError: {
    borderBottomColor: colors.red[500],
    backgroundColor: colors.red[50],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[500],
    marginBottom: 4,
  },
  labelError: {
    color: colors.red[500],
  },
  input: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
    padding: 0,
    margin: 0,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.red[500],
  },
});

