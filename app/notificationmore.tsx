import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const STORAGE_KEYS = {
  OTHER: 'notification_other',
  FESTIVAL: 'notification_festival',
  CHALLENGE: 'notification_challenge',
  MEMO: 'notification_memo',
  DIARY: 'notification_diary'
};

export default function NotificationMore() {
  const router = useRouter();
  const { theme, colors } = useTheme();

  const [notifications, setNotifications] = useState({
    other: true,
    festival: true,
    challenge: true,
    memo: true,
    diary: true
  });

  // Load saved notification preferences
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.multiGet([
        STORAGE_KEYS.OTHER,
        STORAGE_KEYS.FESTIVAL,
        STORAGE_KEYS.CHALLENGE,
        STORAGE_KEYS.MEMO,
        STORAGE_KEYS.DIARY
      ]);

      const settings = {
        other: savedSettings[0][1] !== null ? savedSettings[0][1] === 'true' : true,
        festival: savedSettings[1][1] !== null ? savedSettings[1][1] === 'true' : true,
        challenge: savedSettings[2][1] !== null ? savedSettings[2][1] === 'true' : true,
        memo: savedSettings[3][1] !== null ? savedSettings[3][1] === 'true' : true,
        diary: savedSettings[4][1] !== null ? savedSettings[4][1] === 'true' : true,
      };

      setNotifications(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const toggleNotification = (type: keyof typeof notifications) => {
    const newValue = !notifications[type];
    setNotifications(prev => ({
      ...prev,
      [type]: newValue
    }));

    // Save to AsyncStorage
    const storageKey = STORAGE_KEYS[type.toUpperCase() as keyof typeof STORAGE_KEYS];
    saveNotificationSetting(storageKey, newValue);
  };

  const NotificationItem = ({ 
    title, 
    description, 
    type 
  }: { 
    title: string; 
    description: string; 
    type: keyof typeof notifications;
  }) => (
    <View style={[styles.notificationItem, { 
      backgroundColor: colors.cardBackground,
      borderBottomColor: colors.border 
    }]}>
      <View style={styles.notificationInfo}>
        <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={notifications[type]}
        onValueChange={() => toggleNotification(type)}
        trackColor={{ 
          false: colors.border, 
          true: '#FF6B6B' 
        }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.background
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Notification
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <NotificationItem
          title="Other notification"
          description="Show notification for other events"
          type="other"
        />
        
        <NotificationItem
          title="Festival notification"
          description="Show notification for festival events"
          type="festival"
        />
        
        <NotificationItem
          title="Challenge notification"
          description="Show notification for challenge"
          type="challenge"
        />
        
        <NotificationItem
          title="Memo notification"
          description="Show notification for memo"
          type="memo"
        />
        
        <NotificationItem
          title="Diary notification"
          description="Show notification for diary"
          type="diary"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderBottomWidth: 0.5,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
  },
});