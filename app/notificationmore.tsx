import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import NotificationService from '../services/NotificationService';

const STORAGE_KEYS = {
  OTHER: 'notification_other',
  FESTIVAL: 'notification_festival',
  CHALLENGE: 'notification_challenge',
  MEMO: 'notification_memo',
  DIARY: 'notification_diary'
};

export default function NotificationMore() {
  const router = useRouter();
  const { t } = useTranslation();
  const { from } = useLocalSearchParams();
  const { theme, colors } = useTheme();

  const [notifications, setNotifications] = useState({
    other: true,
    festival: true,
    challenge: true,
    memo: true,
    diary: true
  });

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

  const cancelNotificationsByType = async (type: string) => {
    try {
      const allScheduled = await NotificationService.getAllScheduledNotifications();
      
      for (const notification of allScheduled) {
        if (notification.content.data?.type === type) {
          await NotificationService.cancelNotification(notification.identifier);
          console.log(`Cancelled ${type} notification:`, notification.identifier);
        }
      }
      if (type === 'diary') {
        const diaryData = await AsyncStorage.getItem('diarys');
        if (diaryData) {
          const diarys = JSON.parse(diaryData);
          for (const diary of diarys) {
            const notificationId = await AsyncStorage.getItem(`diary_${diary.id}_notification`);
            if (notificationId) {
              await NotificationService.cancelNotification(notificationId);
              await AsyncStorage.removeItem(`diary_${diary.id}_notification`);
            }
          }
        }
      }
      console.log(`✅ All ${type} notifications cancelled`);
    } catch (error) {
      console.error(`Error cancelling ${type} notifications:`, error);
    }
  };

  const toggleNotification = async (type: keyof typeof notifications) => {
    const newValue = !notifications[type];
    
    if (!newValue) {
      Alert.alert(
        t('confirm'),
        `${t('turn_off')} ${type} ${t('notifications')}? ${t('all_scheduled_notifications_will_be_cancelled')}.`,
        [
          {
            text: t('cancel'),
            style: 'cancel'
          },
          {
            text: t('ok'),
            onPress: async () => {
              setNotifications(prev => ({
                ...prev,
                [type]: newValue
              }));
              const storageKey = STORAGE_KEYS[type.toUpperCase() as keyof typeof STORAGE_KEYS];
              await saveNotificationSetting(storageKey, newValue);
              await cancelNotificationsByType(type);
              
              Alert.alert(t('success'), `${type} ${t('notifications_disabled')}`);
            }
          }
        ]
      );
    } else {
      setNotifications(prev => ({
        ...prev,
        [type]: newValue
      }));
      const storageKey = STORAGE_KEYS[type.toUpperCase() as keyof typeof STORAGE_KEYS];
      await saveNotificationSetting(storageKey, newValue);
      Alert.alert(t('success'), `${type} ${t('notifications_enabled')}`);
    }
  };

  const handleBackPress = async () => {
    try {
      if (from === "notificationmore") {
        router.replace("/settings");
      } else {
        router.replace("/settings");
      }
    } catch (error) {
      console.error("Error showing back ad:", error);
      if (from === "notificationmore") {
        router.replace("/settings");
      } else {
        router.replace("/settings");
      }
    }
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
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t("notification")}</Text>
      </View>

      <ScrollView style={styles.content}>
        <NotificationItem
          title={t("other_notification")}
          description={t("show_notification_other")}
          type="other"
        />

        <NotificationItem
          title={t("festival_notification")}
          description={t("notification_festival")}
          type="festival"
        />

        <NotificationItem
          title={t("challenge_notification")}
          description={t("show_notification_challenge")}
          type="challenge"
        />

        <NotificationItem
          title={t("memo_notification")}
          description={t("show_notificatin_memo")}
          type="memo"
        />

        <NotificationItem
          title={t("diary_notification")}
          description={t("show_notification_diary")}
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
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
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
  backIcon: {
    fontSize: 26,
    fontWeight: "600"
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