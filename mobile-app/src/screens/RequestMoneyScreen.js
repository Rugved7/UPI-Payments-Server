import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentRequestAPI, vpaAPI } from '../services/api';

export default function RequestMoneyScreen({ navigation }) {
  const [payerVpa, setPayerVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [vpaVerified, setVpaVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyVpa = async () => {
    if (!payerVpa) {
      setError('Please enter payer VPA');
      return;
    }

    setVerifying(true);
    try {
      const response = await vpaAPI.checkAvailability(payerVpa);
      const isAvailable = response.data.data;
      
      if (!isAvailable) {
        setVpaVerified(true);
        setError('');
      } else {
        setVpaVerified(false);
        setError('This VPA does not exist. Please check and try again.');
      }
    } catch (error) {
      setVpaVerified(false);
      setError('Failed to verify VPA. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestMoney = async () => {
    if (!payerVpa || !amount) {
      setError('Please fill all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!vpaVerified) {
      setError('Please verify the payer VPA first');
      return;
    }

    setLoading(true);
    try {
      await paymentRequestAPI.create({
        payerVpa,
        amount: parseFloat(amount),
        description,
      });

      setSuccess('Payment request sent successfully!');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleVpaChange = (text) => {
    setPayerVpa(text);
    setVpaVerified(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6200ee', '#7c3aed']}
        style={styles.header}
      >
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor="#fff" 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Request Money</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <IconButton icon="account-circle" size={24} iconColor="#6200ee" />
            <TextInput
              label="From VPA"
              value={payerVpa}
              onChangeText={handleVpaChange}
              mode="flat"
              autoCapitalize="none"
              placeholder="friend@paytm"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>

          {payerVpa && !vpaVerified && (
            <Button 
              mode="outlined" 
              onPress={handleVerifyVpa}
              loading={verifying}
              style={styles.verifyButton}
              icon="shield-check"
            >
              Verify VPA
            </Button>
          )}

          <View style={styles.inputContainer}>
            <IconButton icon="currency-inr" size={24} iconColor="#6200ee" />
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              mode="flat"
              keyboardType="numeric"
              placeholder="0.00"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <IconButton icon="message-text" size={24} iconColor="#6200ee" />
            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="flat"
              placeholder="What's this for?"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleRequestMoney}
          loading={loading}
          disabled={!vpaVerified}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Send Request
        </Button>

        <View style={styles.infoBox}>
          <IconButton icon="information" size={20} iconColor="#6200ee" />
          <Text style={styles.infoText}>
            {vpaVerified 
              ? 'VPA verified. You can send the request.' 
              : 'Please verify the payer VPA before proceeding.'}
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  verifyButton: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderColor: '#6200ee',
  },
  button: {
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
});
