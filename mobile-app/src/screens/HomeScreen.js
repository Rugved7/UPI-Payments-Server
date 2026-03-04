import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Text, IconButton, Avatar, Menu, Divider } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { walletAPI, notificationAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [wallet, setWallet] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, walletRes, notifRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getWallet(),
        notificationAPI.getUnreadCount(),
      ]);
      
      setBalance(balanceRes.data.data);
      setWallet(walletRes.data.data);
      setUnreadCount(notifRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const QuickAction = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color || colors.dark.cardElevated }]}>
        <IconButton icon={icon} size={28} iconColor={colors.dark.text} style={{ margin: 0 }} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar.Text 
              size={44} 
              label={user?.firstName?.charAt(0) || 'U'} 
              style={styles.avatar}
              color={colors.dark.primary}
              labelStyle={styles.avatarLabel}
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.firstName}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <IconButton icon="bell-outline" size={24} iconColor={colors.dark.text} style={{ margin: 0 }} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <IconButton icon="dots-vertical" size={24} iconColor={colors.dark.text} style={{ margin: 0 }} />
              </TouchableOpacity>
            }
            contentStyle={styles.menu}
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile');
              }} 
              title="Profile" 
              leadingIcon="account"
              titleStyle={styles.menuItem}
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('UPIPin');
              }} 
              title="UPI PIN" 
              leadingIcon="lock"
              titleStyle={styles.menuItem}
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                logout();
              }} 
              title="Logout" 
              leadingIcon="logout"
              titleStyle={[styles.menuItem, { color: colors.dark.error }]}
            />
          </Menu>
        </View>
      </View>

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
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          
          {wallet && (
            <View style={styles.limitsRow}>
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Daily Limit</Text>
                <Text style={styles.limitValue}>
                  ₹{parseFloat(wallet.dailyLimit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Spent Today</Text>
                <Text style={styles.limitValue}>
                  ₹{parseFloat(wallet.dailySpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Primary Actions */}
        <View style={styles.primaryActions}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.dark.primary }]}
            onPress={() => navigation.navigate('SendMoney')}
          >
            <IconButton icon="arrow-up" size={24} iconColor={colors.dark.onPrimary} style={{ margin: 0 }} />
            <Text style={styles.primaryButtonText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.dark.success }]}
            onPress={() => navigation.navigate('RequestMoney')}
          >
            <IconButton icon="arrow-down" size={24} iconColor={colors.dark.onPrimary} style={{ margin: 0 }} />
            <Text style={styles.primaryButtonText}>Request</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickAction 
              icon="file-document-outline" 
              label="Requests" 
              onPress={() => navigation.navigate('PaymentRequests')}
            />
            <QuickAction 
              icon="history" 
              label="History" 
              onPress={() => navigation.navigate('TransactionHistory')}
            />
            <QuickAction 
              icon="account-circle-outline" 
              label="My VPAs" 
              onPress={() => navigation.navigate('VPAManagement')}
            />
            <QuickAction 
              icon="cog-outline" 
              label="Settings" 
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.infoCard}>
          <IconButton icon="shield-check-outline" size={24} iconColor={colors.dark.success} style={{ margin: 0 }} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Bank-level Security</Text>
            <Text style={styles.infoSubtitle}>All transactions are encrypted end-to-end</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: colors.dark.cardElevated,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerText: {
    marginLeft: spacing.md,
  },
  greeting: {
    fontSize: 14,
    color: colors.dark.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.dark.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.dark.text,
    fontSize: 11,
    fontWeight: '700',
  },
  menu: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
  },
  menuItem: {
    color: colors.dark.text,
  },
  balanceCard: {
    backgroundColor: colors.dark.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.md,
  },
  limitsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  limitBox: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.onPrimary,
    marginLeft: -4,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: (width - spacing.md * 2) / 4 - 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
});
