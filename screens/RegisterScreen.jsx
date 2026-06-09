import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../services/authService.js';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      return alert('Por favor, completa todos los campos');
    }

    if (password !== confirmPassword) {
      return alert('Las contraseñas no coinciden');
    }

    try {
      setIsLoading(true);
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      alert('Registro exitoso. Ya puedes iniciar sesión.');
      navigation.replace('Login');
    } catch (error) {
      console.log(error);
      const errorMsg = error?.message ?? 'No se pudo completar el registro';
      alert('Error al registrarse: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
    >
      <View style={styles.keyboardView}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextTitle}>Crear cuenta</Text>
          <Text style={styles.logoText}>Regístrate para continuar</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre de usuario"
          placeholderTextColor="#9ca3af"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Ingresa tu email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  keyboardView: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  logoTextTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    bottom: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#9ca3af',
  },
  loginLink: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    width: '100%',
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#ffffff',
    padding: 15,
  },
  eyeIcon: {
    paddingRight: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
