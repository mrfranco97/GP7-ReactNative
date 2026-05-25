import { useRef, useState, useEffect } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

export default function VirtualJoystick({ onStart, onMove, onEnd, size = 160, label }) {
  const radius = size / 2;
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const callbacksRef = useRef({ onStart, onMove, onEnd });
  useEffect(() => {
    callbacksRef.current = { onStart, onMove, onEnd };
  }, [onStart, onMove, onEnd]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsActive(true);
        setThumbPos({ x: 0, y: 0 });
        callbacksRef.current.onStart?.();
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedX = dist > radius ? (dx * radius) / dist : dx;
        const clampedY = dist > radius ? (dy * radius) / dist : dy;
        setThumbPos({ x: clampedX, y: clampedY });
        callbacksRef.current.onMove?.({ x: clampedX / radius, y: clampedY / radius });
      },
      onPanResponderRelease: () => {
        setIsActive(false);
        setThumbPos({ x: 0, y: 0 });
        callbacksRef.current.onEnd?.();
      },
      onPanResponderTerminate: () => {
        setIsActive(false);
        setThumbPos({ x: 0, y: 0 });
        callbacksRef.current.onEnd?.();
      },
    }),
  ).current;

  const thumbSize = isActive ? size * 0.42 : size * 0.35;
  const thumbRadius = thumbSize / 2;

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.outerCircle, { width: size, height: size, borderRadius: radius }]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbRadius,
              backgroundColor: isActive ? '#4ade80' : '#22c55e',
              position: 'absolute',
              left: radius + thumbPos.x - thumbRadius,
              top: radius + thumbPos.y - thumbRadius,
            },
          ]}
        />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerCircle: {
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
  },
  thumb: {
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
