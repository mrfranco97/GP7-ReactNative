import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useConnection } from '../context/ConnectionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import RobotSelector from '../components/RobotSelector.jsx';
import { getErrorMessage } from '../utils/apiErrors.js';

export default function HomeScreen() {
  const { logout } = useAuth();
  const { status, isLoading, connectRobot, disconnectRobot, refresh } = useConnection();

  const [robotType, setRobotType] = useState('go2');
  const [networkInterface, setNetworkInterface] = useState('eth0');
  const [localLoading, setLocalLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Sincronizar inputs si el robot ya está conectado
  useEffect(() => {
    if (status.robot_type) {
      setRobotType(status.robot_type);
    }
    if (status.network_interface) {
      setNetworkInterface(status.network_interface);
    }
  }, [status]);

  const handleConnect = async () => {
    setActionError(null);
    setLocalLoading(true);
    try {
      await connectRobot(robotType, networkInterface);
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setActionError(null);
    setLocalLoading(true);
    try {
      await disconnectRobot();
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setLocalLoading(false);
    }
  };

  const isConnected = status.connection_state === 'connected';
  const showLoading = isLoading || localLoading;

  // Configuración visual según el estado de la conexión
  const statusTheme = {
    connected: {
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      icon: 'checkmark-circle',
      label: 'Conectado',
    },
    disconnected: {
      color: '#9ca3af',
      bgColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: 'rgba(156, 163, 175, 0.2)',
      icon: 'ellipse-outline',
      label: 'Desconectado',
    },
    error: {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      icon: 'alert-circle',
      label: 'Error',
    },
  };

  const currentTheme = statusTheme[status.connection_state] ?? statusTheme.disconnected;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>

        {/* Tarjeta de Estado de Conexión Global */}
        <View style={[styles.statusCard, { backgroundColor: currentTheme.bgColor, borderColor: currentTheme.borderColor }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>

              <View style={styles.badge}>
                <Ionicons name={currentTheme.icon} size={18} color={currentTheme.color} style={{ marginRight: 6 }} />
                <Text style={[styles.badgeText, { color: currentTheme.color }]}>
                  {currentTheme.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={refresh} disabled={showLoading} style={styles.refreshButton}>
              {showLoading ? (
                <ActivityIndicator size="small" color="#22c55e" />
              ) : (
                <Ionicons name="refresh" size={20} color="#22c55e" />
              )}
            </TouchableOpacity>
          </View>

          {isConnected && (
            <View style={styles.connectedDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Robot:</Text>
                <Text style={styles.detailValue}>
                  {status.robot_type?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interfaz:</Text>
                <Text style={styles.detailValue}>{status.network_interface}</Text>
              </View>
              {status.connected_at && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Conectado el:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(status.connected_at).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {(actionError || status.last_error) && (
            <View style={styles.errorDetails}>
              <Ionicons name="warning-outline" size={16} color="#ef4444" style={{ marginRight: 6, marginTop: 2 }} />
              <Text style={styles.errorText}>
                {actionError || status.last_error}
              </Text>
            </View>
          )}
        </View>

        {/* Selector de Robot (Deshabilitado si ya está conectado) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecciona el Robot</Text>
          {isConnected ? (
            <View style={styles.lockedWarning}>
              <Ionicons name="lock-closed" size={16} color="#9ca3af" style={{ marginRight: 6 }} />
              <Text style={styles.lockedText}>
                Desconecta el robot actual para cambiar el tipo.
              </Text>
            </View>
          ) : null}
          <RobotSelector
            selectedRobot={robotType}
            onSelect={isConnected ? () => { } : setRobotType}
          />
        </View>

        {/* Formulario e Interfaz de red */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Interfaz de Red</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isConnected && styles.inputDisabled]}
              value={networkInterface}
              onChangeText={setNetworkInterface}
              placeholder="ej. eth0"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isConnected && !showLoading}
            />
          </View>
          <Text style={styles.hintText}>
            Nombre de la interfaz de red en el servidor (por defecto: eth0)
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionContainer}>
          {!isConnected ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonConnect, showLoading && styles.buttonDisabled]}
              onPress={handleConnect}
              disabled={showLoading}
              activeOpacity={0.8}
            >
              {showLoading ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <>

                  <Text style={styles.buttonTextConnect}>Conectar Robot</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonDisconnect, showLoading && styles.buttonDisabled]}
              onPress={handleDisconnect}
              disabled={showLoading}
              activeOpacity={0.8}
            >
              {showLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>

                  <Text style={styles.buttonTextDisconnect}>Desconectar Robot</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Panel de Diagnóstico */}
        <View style={styles.diagnosticSection}>
          <TouchableOpacity
            style={styles.diagnosticHeader}
            onPress={() => setIsDiagnosticOpen(!isDiagnosticOpen)}
            activeOpacity={0.8}
          >
            <View style={styles.diagnosticHeaderTitle}>
              <Text style={styles.diagnosticTitle}>Consola de Diagnóstico</Text>
            </View>
            <Ionicons
              name={isDiagnosticOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>

          {isDiagnosticOpen && (
            <View style={styles.diagnosticContent}>
              <ScrollView style={styles.jsonScroll} nestedScrollEnabled={true}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(status, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Cerrar Sesión */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Cerrar Sesión de Usuario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedDetails: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  detailValue: {
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: '600',
  },
  errorDetails: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 12,
  },
  lockedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  lockedText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1.5,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  inputDisabled: {
    color: '#9ca3af',
  },
  hintText: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  actionContainer: {
    marginBottom: 28,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonConnect: {
    backgroundColor: '#22c55e',
  },
  buttonDisconnect: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextConnect: {
    color: '#111827',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextDisconnect: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  diagnosticSection: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1f2937',
  },
  diagnosticHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagnosticTitle: {
    color: '#f3f4f6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  diagnosticContent: {
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    padding: 12,
  },
  jsonScroll: {
    maxHeight: 200,
  },
  jsonText: {
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  logoutContainer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 20,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
