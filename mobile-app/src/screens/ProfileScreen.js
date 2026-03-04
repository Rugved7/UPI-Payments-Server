import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, Dialog, Portal, IconButton, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { profileAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.get();
      const data = response.data.data;
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhone(data.phone);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await profileAPI.update({
        firstName,
        lastName,
        phone,
      });
      setEditing(false);
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      await profileAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

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
        <Text style={styles.headerTitle}>Profile</Text>
        <IconButton 
          icon={editing ? "close" : "pencil"} 
          size={24} 
          iconColor="#fff" 
          onPress={() => setEditing(!editing)}
        />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={80} 
            label={profile.firstName?.charAt(0) || 'U'} 
            style={styles.avatar}
            color="#6200ee"
            labelStyle={styles.avatarLabel}
          />
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              disabled={!editing}
              style={styles.input}
            />

            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              disabled={!editing}
              style={styles.input}
            />

            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              disabled={!editing}
              keyboardType="phone-pad"
              style={styles.input}
            />

            {editing && (
              <Button 
                mode="contained" 
                onPress={handleUpdateProfile}
                loading={loading}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Status</Text>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Account Status</Text>
              <Text style={[styles.statusValue, { color: profile.isLocked ? '#f44336' : '#4caf50' }]}>
                {profile.isLocked ? 'Locked' : 'Active'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>UPI PIN Set</Text>
              <Text style={[styles.statusValue, { color: profile.hasUpiPin ? '#4caf50' : '#ff9800' }]}>
                {profile.hasUpiPin ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Member Since</Text>
              <Text style={styles.statusValue}>
                {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Security</Text>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowPasswordDialog(true)}
              icon="lock-reset"
              style={styles.securityButton}
            >
              Change Password
            </Button>

            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('UPIPin')}
              icon="lock"
              style={styles.securityButton}
            >
              {profile.hasUpiPin ? 'Change UPI PIN' : 'Set UPI PIN'}
            </Button>
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={logout}
          icon="logout"
          style={styles.logoutButton}
          textColor="#f44336"
        >
          Logout
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
            />

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
            />

            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button 
              onPress={handleChangePassword} 
              loading={loading}
              mode="contained"
            >
              Change
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
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#6200ee',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityButton: {
    marginBottom: 12,
    borderColor: '#6200ee',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderColor: '#f44336',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
});
