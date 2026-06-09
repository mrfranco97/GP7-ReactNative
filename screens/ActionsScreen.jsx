import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useConnection } from '../context/ConnectionContext.jsx';
import { getActions, runAction } from '../services/actionsService.js';
import{useHistory} from '../context/HistoryContext.jsx'

// TODO: extraer a components/ActionFeedback.jsx
function ActionFeedback({ feedback }) {
  if (!feedback) return null;
  const isSuccess = feedback.ok;
  return (
    <View style={[styles.feedback, isSuccess ? styles.feedbackOk : styles.feedbackError]}>
      <Text style={styles.feedbackText}>
        {isSuccess ? '✅' : '❌'} {feedback.action} — {isSuccess ? 'Enviada con éxito' : 'Error al enviar'}
      </Text>
    </View>
  );
}

export default function ActionsScreen() {
  const { status } = useConnection();
  const isConnected = status.connection_state === 'connected';
  const {logCommand} = useHistory();
  const [acciones, setAcciones] = useState([]);
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loadingAcciones, setLoadingAcciones] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  useEffect(() => {
    if (!isConnected) {
      setAcciones([]);
      setAccionSeleccionada(null);
      return;
    }
    setLoadingAcciones(true);
    getActions()
      .then((data) => setAcciones(data.actions ?? []))
      .catch(() => setAcciones([]))
      .finally(() => setLoadingAcciones(false));
  }, [isConnected]);

  async function handleEnviar() {
    if (!accionSeleccionada) return;
    setEnviando(true);
    try {
      await runAction(accionSeleccionada);
      setFeedback({ ok: true, action: accionSeleccionada });
      await logCommand({ type: 'action', label: accionSeleccionada, success: true, detail: null })
    } catch {
      setFeedback({ ok: false, action: accionSeleccionada });
      await logCommand({ type: 'action', label: accionSeleccionada, success: false, detail: null })
    } finally {
      setEnviando(false);
    }
  }

  if (!isConnected) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Conectá el robot para ver las acciones disponibles.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acciones disponibles</Text>

      {loadingAcciones ? (
        <ActivityIndicator color="#22c55e" />
      ) : (
        <FlatList
          data={acciones}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.actionItem, accionSeleccionada === item && styles.actionItemSelected]}
              onPress={() => setAccionSeleccionada(item)}
            >
              <Text style={styles.actionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.sendButton, (!accionSeleccionada || enviando) && styles.sendButtonDisabled]}
        onPress={handleEnviar}
        disabled={!accionSeleccionada || enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Enviar acción</Text>
        )}
      </TouchableOpacity>

      <ActionFeedback feedback={feedback} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#111827', padding: 16 },
  centered:             { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:                { color: '#f9fafb', fontSize: 20, fontWeight: '600', marginBottom: 16 },
  emptyText:            { color: '#9ca3af', textAlign: 'center' },
  actionItem:           { backgroundColor: '#1f2937', padding: 14, borderRadius: 8, marginBottom: 8 },
  actionItemSelected:   { backgroundColor: '#166534', borderColor: '#22c55e', borderWidth: 1 },
  actionText:           { color: '#f9fafb', fontSize: 16 },
  sendButton:           { backgroundColor: '#22c55e', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  sendButtonDisabled:   { backgroundColor: '#374151' },
  sendButtonText:       { color: '#fff', fontWeight: '600', fontSize: 16 },
  feedback:             { marginTop: 16, padding: 12, borderRadius: 8 },
  feedbackOk:           { backgroundColor: '#14532d' },
  feedbackError:        { backgroundColor: '#7f1d1d' },
  feedbackText:         { color: '#f9fafb', fontSize: 14 },
});
