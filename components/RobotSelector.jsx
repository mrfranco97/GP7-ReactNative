import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ROBOT_CONFIG = {
  go2: {
    name: 'Unitree Go2',
    type: 'Cuadrúpedo',
    image: require('../public/Robot_Go2.jpg'),


  },
  g1: {
    name: 'Unitree G1',
    type: 'Humanoide / G1',
    image: require('../public/Robot_Go1.jpg'),
  },
};

export default function RobotSelector({ selectedRobot, onSelect }) {
  const currentRobot = ROBOT_CONFIG[selectedRobot] ?? ROBOT_CONFIG.go2;

  return (
    <View style={styles.container}>
      {/* Imagen del Robot Seleccionado */}
      <View style={styles.imageWrapper}>
        <Image source={currentRobot.image} style={styles.image} />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageTitle}>{currentRobot.name}</Text>
          <Text style={styles.imageSubtitle}>{currentRobot.type}</Text>
        </View>
      </View>

      {/* Selector de Botones / Tarjetas */}
      <View style={styles.cardsContainer}>
        {Object.entries(ROBOT_CONFIG).map(([key, config]) => {
          const isSelected = selectedRobot === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.card,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
              onPress={() => onSelect(key)}
              activeOpacity={0.7}
            >

              <Text style={[styles.cardTitle, isSelected && styles.textSelected]}>
                {config.name}
              </Text>
              <Text style={styles.cardSubtitle}>{config.type}</Text>

              {/* Indicador de Selección */}
              {isSelected && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  imageTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageSubtitle: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  descText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    position: 'relative',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#1e293b',
    borderColor: '#22c55e',
  },
  cardUnselected: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  iconContainerUnselected: {
    backgroundColor: '#111827',
  },
  cardTitle: {
    color: '#f3f4f6',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textSelected: {
    color: '#22c55e',
  },
  cardSubtitle: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  checkIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
