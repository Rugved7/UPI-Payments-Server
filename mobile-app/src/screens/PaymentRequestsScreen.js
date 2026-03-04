import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Dialog, Portal, TextInput, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentRequestAPI } from '../services/api';

export default function PaymentRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [upiPin, setUpiPin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      let response;
      if (filter === 'sent') {
        response = await paymentRequestAPI.getSent();
      } else if (filter === 'received') {
        response = await paymentRequestAPI.getReceived();
      } else {
        response = await paymentRequestAPI.getAll();
      }
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setShowPinDialog(true);
  };

  const handleConfirmAccept = async () => {
    if (!upiPin || upiPin.length !== 4) {
      return;
    }

    setLoading(true);
    try {
      await paymentRequestAPI.accept(selectedRequest.requestId, upiPin);
      setShowPinDialog(false);
      setUpiPin('');
      await loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await paymentRequestAPI.reject(requestId);
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#4caf50';
      case 'PENDING': return '#ff9800';
      case 'REJECTED': return '#f44336';
      case 'EXPIRED': return '#9e9e9e';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Payment Requests</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'sent', label: 'Sent' },
            { value: 'received', label: 'Received' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {!requests || requests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No requests found</Text>
              </Card.Content>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <Card.Content>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestAmount}>
                        ₹{parseFloat(request.amount).toLocaleString('en-IN')}
                      </Text>
                      <Chip 
                        mode="flat" 
                        style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) }]}
                        textStyle={styles.statusText}
                      >
                        {request.status}
                      </Chip>
                    </View>
                  </View>

                  <View style={styles.requestDetails}>
                    <Text style={styles.detailLabel}>
                      {filter === 'sent' || request.requesterVpa ? 'To: ' : 'From: '}
                      <Text style={styles.detailValue}>
                        {filter === 'sent' ? request.payerVpa : request.requesterVpa}
                      </Text>
                    </Text>
                    {request.description && (
                      <Text style={styles.description}>{request.description}</Text>
                    )}
                    <Text style={styles.date}>{formatDate(request.createdAt)}</Text>
                  </View>

                  {request.status === 'PENDING' && filter !== 'sent' && (
                    <View style={styles.actions}>
                      <Button 
                        mode="contained" 
                        onPress={() => handleAccept(request)}
                        style={styles.acceptButton}
                      >
                        Accept & Pay
                      </Button>
                      <Button 
                        mode="outlined" 
                        onPress={() => handleReject(request.requestId)}
                        style={styles.rejectButton}
                        textColor="#f44336"
                      >
                        Reject
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showPinDialog} onDismiss={() => setShowPinDialog(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Enter UPI PIN</Dialog.Title>
          <Dialog.Content>
            {selectedRequest && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmLabel}>Paying to</Text>
                <Text style={styles.confirmVpa}>{selectedRequest.requesterVpa}</Text>
                <Text style={styles.confirmAmount}>
                  ₹{parseFloat(selectedRequest.amount).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
            <TextInput
              label="UPI PIN"
              value={upiPin}
              onChangeText={setUpiPin}
              mode="outlined"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              style={styles.pinInput}
              outlineColor="#e0e0e0"
              activeOutlineColor="#6200ee"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPinDialog(false)} textColor="#666">
              Cancel
            </Button>
            <Button 
              onPress={handleConfirmAccept} 
              loading={loading}
              mode="contained"
              style={styles.payButton}
            >
              Pay Now
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  segmentedButtons: {
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  requestCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#6200ee',
  },
  rejectButton: {
    flex: 1,
    borderColor: '#f44336',
  },
  dialog: {
    borderRadius: 20,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#666',
  },
  confirmVpa: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 8,
  },
  pinInput: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  payButton: {
    marginLeft: 8,
  },
});
