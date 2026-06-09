import { useCallback } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHistory } from '../context/HistoryContext.jsx';
import { getActionIconByLabel } from '../config/actions.js';

const TYPE_ICONS = {
  move: 'navigate',
  stop: 'hand-left',
  standup: 'arrow-up-circle',
  sitdown: 'arrow-down-circle',
  action: 'flash',
};

function HistoryRow({ item }) {
  const icon =
    item.type === 'action'
      ? getActionIconByLabel(item.label)
      : (TYPE_ICONS[item.type] ?? 'ellipse');
  const when = new Date(item.created_at).toLocaleString();
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color="#9ca3af" style={styles.rowIcon} />
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <Text style={styles.rowTime}>{when}</Text>
      </View>
      <View
        style={[
          styles.chip,
          { backgroundColor: item.success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' },
        ]}
      >
        <Text style={[styles.chipText, { color: item.success ? '#22c55e' : '#ef4444' }]}>
          {item.success ? 'OK' : 'FALLO'}
        </Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { history, refresh, clear, error } = useHistory();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const confirmClear = () => {
    if (history.length === 0) return;
    Alert.alert(
      'Limpiar historial',
      '¿Borrar todos tus comandos registrados en este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: () => clear() },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {history.length > 0 && (
          <TouchableOpacity onPress={confirmClear} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <HistoryRow item={item} />}
        contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          error ? (
            <View style={styles.empty}>
              <Ionicons name="warning-outline" size={40} color="#ef4444" />
              <Text style={styles.emptyText}>No se pudo cargar el historial</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={40} color="#4b5563" />
              <Text style={styles.emptyText}>Todavía no enviaste comandos</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '600',
  },
  rowTime: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 12,
  },
});
