import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext.jsx';
import { ConnectionProvider } from './context/ConnectionContext.jsx';
import AppNavigator from './navigation/AppNavigator.jsx';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ConnectionProvider>
          <AppNavigator />
        </ConnectionProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
