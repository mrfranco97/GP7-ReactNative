import { StyleSheet, Text, View } from 'react-native';
import { useConnection } from '../context/ConnectionContext.jsx';

const STATE_CONFIG = {
  connected:    { color: '#22c55e', label: 'Conectado' },
  disconnected: { color: '#9ca3af', label: 'Desconectado' },
  error:        { color: '#ef4444', label: 'Error' },
};

export default function ConnectionBadge() {
  const { status } = useConnection();
  const config = STATE_CONFIG[status.connection_state] ?? STATE_CONFIG.disconnected;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  dot:       { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  label:     { fontSize: 12, color: '#e5e7eb' },
});
