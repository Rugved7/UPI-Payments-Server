import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar, Dialog, Portal, Chip } from 'react-native-paper';
import CustomHeader from '../components/CustomHeader';
import { transactionAPI, vpaAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function SendMoneyScreen({ navigation }) {
  const [receiverVpa, setReceiverVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [vpaVerified, setVpaVerified] = useState(false);
  const [error, setError] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [success, setSuccess] = useState('');

  const handleVerifyVpa = async () => {
    if (!receiverVpa) {
      setError('Please enter receiver VPA');
      return;
    }

    setVerifying(true);
    try {
      const response = await vpaAPI.checkAvailability(receiverVpa);
      const isAvailable = response.data.data;
      
      if (!isAvailable) {
        setVpaVerified(true);
        setError('');
      } else {
        setVpaVerified(false);
        setError('This VPA does not exist');
      }
    } catch (error) {
      setVpaVerified(false);
      setError('Failed to verify VPA');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = async () => {
    if (!receiverVpa || !amount) {
      setError('Please fill all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!vpaVerified) {
      setError('Please verify the receiver VPA first');
      return;
    }

    setShowPinDialog(true);
  };

  const handleSendMoney = async () => {
    if (!upiPin || upiPin.length !== 4) {
      setError('Please enter 4-digit UPI PIN');
      return;
    }

    setLoading(true);
    try {
      const response = await transactionAPI.transfer({
        recieverVpa: receiverVpa,
        amount: parseFloat(amount),
        description,
        upiPin,
      });

      setLoading(false);
      setShowPinDialog(false);

      if (response.data.success) {
        setSuccess('Money sent successfully!');
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      setShowPinDialog(false);
      setError(error.response?.data?.message || 'Transaction failed');
    }
  };

  const handleVpaChange = (text) => {
    setReceiverVpa(text);
    setVpaVerified(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomHeader 
        title="Send Money" 
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputCard}>
          <TextInput
            label="To VPA"
            value={receiverVpa}
            onChangeText={handleVpaChange}
            mode="outlined"
            autoCapitalize="none"
            placeholder="friend@paytm"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            left={<TextInput.Icon icon="account-circle-outline" color={colors.dark.textSecondary} />}
            right={vpaVerified && <TextInput.Icon icon="check-circle" color={colors.dark.success} />}
          />

          {receiverVpa && !vpaVerified && (
            <Button 
              mode="outlined" 
              onPress={handleVerifyVpa}
              loading={verifying}
              style={styles.verifyButton}
              textColor={colors.dark.primary}
            >
              Verify VPA
            </Button>
          )}

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            placeholder="0.00"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            left={<TextInput.Icon icon="currency-inr" color={colors.dark.textSecondary} />}
          />

          <TextInput
            label="Note (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            placeholder="Add a note"
            style={styles.input}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            left={<TextInput.Icon icon="message-text-outline" color={colors.dark.textSecondary} />}
          />
        </View>

        <Button 
          mode="contained" 
          onPress={handleContinue}
          disabled={!vpaVerified}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={colors.dark.primary}
          textColor={colors.dark.onPrimary}
        >
          Continue
        </Button>

        {vpaVerified && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✓ VPA verified. Ready to send payment.
            </Text>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog 
          visible={showPinDialog} 
          onDismiss={() => setShowPinDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Enter UPI PIN</Dialog.Title>
          <Dialog.Content>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmLabel}>Paying to</Text>
              <Text style={styles.confirmVpa}>{receiverVpa}</Text>
              <Text style={styles.confirmAmount}>
                ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <TextInput
              label="UPI PIN"
              value={upiPin}
              onChangeText={setUpiPin}
              mode="outlined"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              style={styles.pinInput}
              outlineColor={colors.dark.border}
              activeOutlineColor={colors.dark.primary}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPinDialog(false)} textColor={colors.dark.textSecondary}>
              Cancel
            </Button>
            <Button 
              onPress={handleSendMoney} 
              loading={loading}
              mode="contained"
              buttonColor={colors.dark.primary}
            >
              Pay Now
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={{ backgroundColor: colors.dark.error }}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
        style={{ backgroundColor: colors.dark.success }}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  inputCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.dark.surface,
  },
  verifyButton: {
    marginBottom: spacing.md,
    borderColor: colors.dark.primary,
  },
  button: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  infoBox: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.dark.success,
  },
  infoText: {
    fontSize: 14,
    color: colors.dark.textSecondary,
  },
  dialog: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark.text,
  },
  confirmBox: {
    backgroundColor: colors.dark.cardElevated,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary,
  },
  confirmVpa: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: 4,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.dark.primary,
    marginTop: spacing.sm,
  },
  pinInput: {
    backgroundColor: colors.dark.surface,
  },
});
