import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useConnection } from '../context/ConnectionContext.jsx';
import { move, stop, standup, sitdown } from '../services/motionService.js';
import { getErrorMessage } from '../utils/apiErrors.js';
import VirtualJoystick from '../components/VirtualJoystick.jsx';
import { useHistory } from '../context/HistoryContext.jsx';

const MAX_VX = 0.5;
const MAX_VY = 0.3;
const MAX_VYAW = 0.8;

export default function MotionControlScreen() {
  const { status } = useConnection();
  const { logCommand } = useHistory();
  const isConnected = status?.connection_state === 'connected';

  const velocityRef = useRef({ vx: 0, vy: 0, vyaw: 0 });
  const joystickActiveRef = useRef({ left: false, right: false });
  const intervalRef = useRef(null);

  const [feedback, setFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isConnected && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      velocityRef.current = { vx: 0, vy: 0, vyaw: 0 };
      joystickActiveRef.current = { left: false, right: false };
    }
  }, [isConnected]);

  function showFeedback(message, isError) {
    clearTimeout(feedbackTimerRef.current);
    setFeedback({ message, isError });
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2500);
  }

  function startLoopIfNeeded() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      try {
        await move({ ...velocityRef.current });
      } catch {
        // swallow — continuous loop errors are not user-initiated
      }
    }, 150);
  }

  function stopLoopIfBothReleased() {
    if (joystickActiveRef.current.left || joystickActiveRef.current.right) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    stop().catch(() => {});
  }

  const onLeftStart = useCallback(() => {
    joystickActiveRef.current.left = true;
    startLoopIfNeeded();
    // Una fila por gesto: success optimista (los errores del loop continuo se ignoran por diseño).
    logCommand({ type: 'move', label: 'Movimiento giro', success: true });
  }, [logCommand]);

  const onLeftMove = useCallback(({ x }) => {
    velocityRef.current.vyaw = x * MAX_VYAW;
  }, []);

  const onLeftEnd = useCallback(() => {
    joystickActiveRef.current.left = false;
    velocityRef.current.vyaw = 0;
    stopLoopIfBothReleased();
  }, []);

  const onRightStart = useCallback(() => {
    joystickActiveRef.current.right = true;
    startLoopIfNeeded();
    // Una fila por gesto: success optimista (los errores del loop continuo se ignoran por diseño).
    logCommand({ type: 'move', label: 'Movimiento', success: true });
  }, [logCommand]);

  const onRightMove = useCallback(({ x, y }) => {
    velocityRef.current.vx = -y * MAX_VX;
    velocityRef.current.vy = x * MAX_VY;
  }, []);

  const onRightEnd = useCallback(() => {
    joystickActiveRef.current.right = false;
    velocityRef.current.vx = 0;
    velocityRef.current.vy = 0;
    stopLoopIfBothReleased();
  }, []);

  async function dpadPress(vx, vy, vyaw, label) {
    try {
      await move({ vx, vy, vyaw });
      logCommand({ type: 'move', label, success: true });
    } catch (e) {
      logCommand({ type: 'move', label, success: false, detail: getErrorMessage(e) });
    }
  }

  function dpadRelease() {
    stop().catch(() => {});
  }

  async function handleAction(fn, label, type) {
    try {
      await fn();
      showFeedback(`${label}: OK`, false);
      logCommand({ type, label, success: true });
    } catch (e) {
      const msg = getErrorMessage(e);
      showFeedback(msg, true);
      logCommand({ type, label, success: false, detail: msg });
    }
  }

  return (
    <View style={styles.screen}>
      {/* D-pad */}
      <View style={styles.dpadSection}>
        <View style={styles.dpadColumn}>
          <TouchableOpacity
            style={styles.dpadBtn}
            onPressIn={() => dpadPress(0.5, 0, 0, 'Movimiento adelante')}
            onPressOut={dpadRelease}
          >
            <Text style={styles.dpadText}>▲</Text>
          </TouchableOpacity>

          <View style={styles.dpadRow}>
            <TouchableOpacity
              style={styles.dpadBtn}
              onPressIn={() => dpadPress(0, -0.3, 0, 'Movimiento izquierda')}
              onPressOut={dpadRelease}
            >
              <Text style={styles.dpadText}>◄</Text>
            </TouchableOpacity>
            <View style={styles.dpadCenter} />
            <TouchableOpacity
              style={styles.dpadBtn}
              onPressIn={() => dpadPress(0, 0.3, 0, 'Movimiento derecha')}
              onPressOut={dpadRelease}
            >
              <Text style={styles.dpadText}>►</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dpadBtn}
            onPressIn={() => dpadPress(-0.5, 0, 0, 'Movimiento atrás')}
            onPressOut={dpadRelease}
          >
            <Text style={styles.dpadText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.stopBtn]}
          onPress={() => handleAction(stop, 'Detener', 'stop')}
        >
          <Text style={styles.actionText}>Detener</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.standBtn]}
          onPress={() => handleAction(standup, 'Pararse', 'standup')}
        >
          <Text style={styles.actionText}>Pararse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.sitBtn]}
          onPress={() => handleAction(sitdown, 'Sentarse', 'sitdown')}
        >
          <Text style={styles.actionText}>Sentarse</Text>
        </TouchableOpacity>
      </View>

      {/* Joysticks */}
      <View style={styles.joystickRow}>
        <VirtualJoystick
          size={150}
          label="Girar"
          onStart={onLeftStart}
          onMove={onLeftMove}
          onEnd={onLeftEnd}
        />
        <VirtualJoystick
          size={150}
          label="Mover"
          onStart={onRightStart}
          onMove={onRightMove}
          onEnd={onRightEnd}
        />
      </View>

      {/* Feedback banner — above overlay */}
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

      {/* Disabled overlay — last child so it sits on top */}
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
    justifyContent: 'space-evenly',
    paddingVertical: 16,
  },
  dpadSection: {
    alignItems: 'center',
  },
  dpadColumn: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpadCenter: {
    width: 48,
    height: 48,
  },
  dpadBtn: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  dpadText: {
    color: '#e5e7eb',
    fontSize: 22,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 110,
  },
  stopBtn: {
    backgroundColor: '#ef4444',
  },
  standBtn: {
    backgroundColor: '#3b82f6',
  },
  sitBtn: {
    backgroundColor: '#8b5cf6',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  joystickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
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
