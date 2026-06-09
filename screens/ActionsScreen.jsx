import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useConnection } from '../context/ConnectionContext.jsx';
import { useHistory } from '../context/HistoryContext.jsx';
import { getActions, runAction } from '../services/actionsService.js';
import { getActionMeta } from '../config/actions.js';
import { getErrorMessage } from '../utils/apiErrors.js';

export default function ActionsScreen() {
  const { status } = useConnection();
  const { logCommand } = useHistory();
  const connectionState = status?.connection_state;
  const robotType = status?.robot_type;
  const isConnected = connectionState === 'connected';

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [runningAction, setRunningAction] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const feedbackTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const loadActions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await getActions();
      if (isMountedRef.current) setActions(list);
    } catch (e) {
      console.error('[ActionsScreen] loadActions failed:', e?.message ?? e);
      if (isMountedRef.current) {
        setActions([]);
        setError(true);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      loadActions();
    } else {
      setActions([]);
      setError(false);
      setLoading(false);
    }
  }, [isConnected, robotType, loadActions]);

  function showFeedback(message, isError) {
    clearTimeout(feedbackTimerRef.current);
    setFeedback({ message, isError });
    feedbackTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setFeedback(null);
    }, 2500);
  }

  async function handleRun(name) {
    if (runningAction) return;
    const { label } = getActionMeta(name);
    setRunningAction(name);
    try {
      await runAction(name);
      showFeedback(`${label}: OK`, false);
      logCommand({ type: 'action', label, success: true });
    } catch (e) {
      const msg = getErrorMessage(e);
      showFeedback(msg, true);
      logCommand({ type: 'action', label, success: false, detail: msg });
    } finally {
      if (isMountedRef.current) setRunningAction(null);
    }
  }

  const renderItem = ({ item }) => {
    const isRunning = runningAction === item;
    const { label, icon } = getActionMeta(item);
    return (
      <TouchableOpacity
        style={[styles.card, runningAction && styles.cardDisabled]}
        disabled={!!runningAction}
        onPress={() => handleRun(item)}
      >
        {isRunning ? (
          <ActivityIndicator color="#22c55e" />
        ) : (
          <>
            <Ionicons name={icon} size={26} color="#22c55e" style={styles.cardIcon} />
            <Text style={styles.cardText} numberOfLines={2}>
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={40} color="#ef4444" />
          <Text style={styles.emptyText}>No se pudieron cargar las acciones</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadActions}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={actions}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={
            actions.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="flash-outline" size={40} color="#4b5563" />
              <Text style={styles.emptyText}>El robot no expone acciones</Text>
            </View>
          }
        />
      )}

      {feedback && (
        <View
          style={[
            styles.feedbackBanner,
            { backgroundColor: feedback.isError ? '#ef4444' : '#22c55e' },
          ]}
        >
          <Text style={styles.feedbackText}>{feedback.message}</Text>
        </View>
      )}

      {!isConnected && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Robot no conectado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111827',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    minHeight: 88,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardText: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  feedbackBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    zIndex: 20,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
