import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors } = useTheme();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // ⭐ Minimum 2 seconds splash
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    // ⭐ Maximum 5 seconds timeout
    const maxTimer = setTimeout(() => {
      if (!minTimeElapsed) {
        setMinTimeElapsed(true);
      }
      onFinish();
    }, 5000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (minTimeElapsed) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        onFinish();
      }, 100);
    }
  }, [minTimeElapsed]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('../assets/icons/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={[styles.appName, { color: colors.textPrimary }]}>
        Calendar App
      </Text>

      <ActivityIndicator 
        size="large" 
        color={colors.primary} 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});