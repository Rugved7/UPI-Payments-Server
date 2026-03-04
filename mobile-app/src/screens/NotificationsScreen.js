import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import CustomHeader from '../components/CustomHeader';
import { notificationAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MONEY_RECEIVED': return 'arrow-down-bold';
      case 'MONEY_SENT': return 'arrow-up-bold';
      case 'TRANSACTION_SUCCESS': return 'check-circle';
      case 'TRANSACTION_FAILED': return 'alert-circle';
      case 'VPA_CREATED': return 'account-plus';
      case 'UPI_PIN_CHANGED': return 'lock-reset';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'MONEY_RECEIVED': return colors.dark.success;
      case 'MONEY_SENT': return colors.dark.primary;
      case 'TRANSACTION_SUCCESS': return colors.dark.success;
      case 'TRANSACTION_FAILED': return colors.dark.error;
      default: return colors.dark.info;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Notifications" 
        onBack={() => navigation.goBack()}
        rightIcon={unreadCount > 0 ? "check-all" : null}
        onRightPress={handleMarkAllAsRead}
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
          {!notifications || notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <IconButton icon="bell-outline" size={64} iconColor={colors.dark.textSecondary} />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadCard
                ]}
                onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: getNotificationColor(notification.type) + '20' }
                ]}>
                  <IconButton
                    icon={getNotificationIcon(notification.type)}
                    size={24}
                    iconColor={getNotificationColor(notification.type)}
                    style={{ margin: 0 }}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationDate}>{formatDate(notification.createdAt)}</Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  iconColor={colors.dark.textSecondary}
                  onPress={() => handleDelete(notification.id)}
                  style={{ margin: 0 }}
                />
              </TouchableOpacity>
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
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.dark.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.primary,
    marginLeft: spacing.sm,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.dark.textTertiary,
  },
});
