import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext.jsx';
import ConnectionBadge from '../components/ConnectionBadge.jsx';
import LoginScreen from '../screens/LoginScreen.jsx';
import MainTabs from './MainTabs.jsx';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={MainTabs}
        options={{ headerRight: () => <ConnectionBadge /> }}
      />
    </Stack.Navigator>
  );
}
