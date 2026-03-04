import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar, IconButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { colors, spacing } from '../config/theme';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    const result = await signup({ firstName, lastName, email, phone, password });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor={colors.dark.text}
          onPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
          />

          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
          />

          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
                color={colors.dark.textSecondary}
              />
            }
          />

          <Button 
            mode="contained" 
            onPress={handleSignup}
            loading={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={colors.dark.primary}
            textColor={colors.dark.onPrimary}
          >
            Create Account
          </Button>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Login')}
              labelStyle={styles.loginButton}
              textColor={colors.dark.primary}
            >
              Login
            </Button>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={{ backgroundColor: colors.dark.error }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  titleContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.dark.textSecondary,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.dark.surface,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: 14,
    color: colors.dark.textSecondary,
  },
  loginButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});
