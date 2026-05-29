import { View, Text, StyleSheet, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Inicia Sesión</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate Aquí</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  forgotPassword: {
    color: '#3b82f6',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#9ca3af',
  },
  registerLink: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 24,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
});
