import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { darkTheme, colors } from './src/config/theme';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import RequestMoneyScreen from './src/screens/RequestMoneyScreen';
import PaymentRequestsScreen from './src/screens/PaymentRequestsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import VPAManagementScreen from './src/screens/VPAManagementScreen';
import UPIPinScreen from './src/screens/UPIPinScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.dark.background,
    card: colors.dark.surface,
    text: colors.dark.text,
    border: colors.dark.border,
  },
};

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.dark.surface}
      />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.dark.surface,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.dark.border,
            },
            headerTintColor: colors.dark.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          {!user ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen}
                options={{ 
                  title: 'Create Account',
                  headerShown: false 
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="SendMoney" 
                component={SendMoneyScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="RequestMoney" 
                component={RequestMoneyScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="PaymentRequests" 
                component={PaymentRequestsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="VPAManagement" 
                component={VPAManagementScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="UPIPin" 
                component={UPIPinScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="TransactionHistory" 
                component={TransactionHistoryScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotificationsScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <PaperProvider theme={darkTheme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
