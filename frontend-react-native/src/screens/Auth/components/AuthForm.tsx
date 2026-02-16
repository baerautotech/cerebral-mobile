import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: Array<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
  }>;
  submitButtonText: string;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  footerLink?: {
    text: string;
    linkText: string;
    onPress: () => void;
  };
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  submitButtonText,
  onSubmit,
  loading,
  error,
  footerLink,
}) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.logo}>🧠</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>

    <View style={styles.form}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {fields.map((field, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor="#666"
            value={field.value}
            onChangeText={field.onChangeText}
            secureTextEntry={field.secureTextEntry}
            autoCapitalize="none"
            keyboardType={field.label.toLowerCase().includes('email') ? 'email-address' : 'default'}
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        )}
      </TouchableOpacity>

      {footerLink && (
        <TouchableOpacity onPress={footerLink.onPress} style={styles.footerLink}>
          <Text style={styles.footerText}>
            {footerLink.text} <Text style={styles.linkText}>{footerLink.linkText}</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    height: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
