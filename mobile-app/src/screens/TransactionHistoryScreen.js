import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Chip, IconButton } from 'react-native-paper';
import CustomHeader from '../components/CustomHeader';
import { transactionAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function TransactionHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getHistory();
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return colors.dark.success;
      case 'FAILED': return colors.dark.error;
      case 'PENDING': return colors.dark.warning;
      default: return colors.dark.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return 'check-circle';
      case 'FAILED': return 'close-circle';
      case 'PENDING': return 'clock-outline';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Transaction History" 
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.dark.primary}
            colors={[colors.dark.primary]}
          />
        }
      >
        <View style={styles.content}>
          {!transactions || transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <IconButton icon="history" size={64} iconColor={colors.dark.textSecondary} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.transactionId} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: transaction.type === 'CREDIT' ? colors.dark.success + '20' : colors.dark.error + '20' }
                  ]}>
                    <IconButton 
                      icon={transaction.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} 
                      size={24} 
                      iconColor={transaction.type === 'CREDIT' ? colors.dark.success : colors.dark.error}
                      style={{ margin: 0 }}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionVpa}>
                      {transaction.type === 'CREDIT' ? transaction.senderVpa : transaction.receiverVpa}
                    </Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'CREDIT' ? colors.dark.success : colors.dark.text }
                    ]}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                    </Text>
                    <View style={styles.statusContainer}>
                      <IconButton 
                        icon={getStatusIcon(transaction.status)} 
                        size={16} 
                        iconColor={getStatusColor(transaction.status)}
                        style={{ margin: 0 }}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
                {transaction.description && (
                  <Text style={styles.description}>{transaction.description}</Text>
                )}
                <Text style={styles.transactionId}>ID: {transaction.transactionId}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginTop: spacing.sm,
  },
  transactionCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionVpa: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: -4,
  },
  description: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginTop: spacing.sm,
    marginLeft: 60,
  },
  transactionId: {
    fontSize: 11,
    color: colors.dark.textTertiary,
    marginTop: spacing.sm,
    marginLeft: 60,
  },
});
