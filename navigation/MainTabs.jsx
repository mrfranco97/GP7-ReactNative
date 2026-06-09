import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import PlaceholderScreen from '../screens/PlaceholderScreen.jsx';
import MotionControlScreen from '../screens/MotionControlScreen.jsx';
import HomeScreen from '../screens/HomeScreen.jsx';
import HistoryScreen from '../screens/HistoryScreen.jsx';
import ActionsScreen from '../screens/ActionsScreen.jsx';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Conexión: ['wifi', 'wifi-outline'],
  Control: ['game-controller', 'game-controller-outline'],
  Acciones: ['list', 'list-outline'],
  Historial: ['time', 'time-outline'],
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1f2937' },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] ?? ['help', 'help-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Conexión" component={HomeScreen} />
      <Tab.Screen name="Control" component={MotionControlScreen} />
      <Tab.Screen name="Acciones" component={ActionsScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
