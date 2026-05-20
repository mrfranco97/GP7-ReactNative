import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator.jsx';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
