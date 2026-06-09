import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext.jsx';
import { ConnectionProvider } from './context/ConnectionContext.jsx';
import { HistoryProvider } from './context/HistoryContext.jsx';
import AppNavigator from './navigation/AppNavigator.jsx';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AuthProvider>
        <ConnectionProvider>
          <HistoryProvider>
            <AppNavigator />
          </HistoryProvider>
        </ConnectionProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
