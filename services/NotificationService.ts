import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Notification ka behavior set karna
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const STORAGE_KEYS = {
  OTHER: 'notification_other',
  FESTIVAL: 'notification_festival',
  CHALLENGE: 'notification_challenge',
  MEMO: 'notification_memo',
  DIARY: 'notification_diary'
};

class NotificationService {
  // Permission request karna
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Notification permissions required!');
      return false;
    }
    
    // Android ke liye notification channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  }

  // Check karna ki notification ON hai ya OFF
  async isNotificationEnabled(type: string): Promise<boolean> {
    try {
      const key = STORAGE_KEYS[type.toUpperCase() as keyof typeof STORAGE_KEYS];
      const value = await AsyncStorage.getItem(key);
      return value === 'true' || value === null; // Default true
    } catch (error) {
      console.error('Error checking notification setting:', error);
      return true;
    }
  }

  // Memo notification schedule karna
  async scheduleMemoNotification(
    memoId: string,
    title: string,
    body: string,
    scheduledDate: Date
  ) {
    // Check if memo notifications are enabled
    const isEnabled = await this.isNotificationEnabled('MEMO');
    if (!isEnabled) {
      console.log('Memo notifications are disabled');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Memo Reminder',
        body: body || title,
        data: { 
          type: 'memo', 
          memoId: memoId,
          title: title 
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: scheduledDate,
      },
    });

    console.log('Memo notification scheduled:', notificationId);
    return notificationId;
  }

  // Challenge notification schedule karna
  async scheduleChallengeNotification(
    challengeId: string,
    title: string,
    body: string,
    scheduledDate: Date
  ) {
    const isEnabled = await this.isNotificationEnabled('CHALLENGE');
    if (!isEnabled) {
      console.log('Challenge notifications are disabled');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Challenge Reminder',
        body: body || title,
        data: { 
          type: 'challenge', 
          challengeId: challengeId,
          title: title 
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: scheduledDate,
      },
    });

    console.log('Challenge notification scheduled:', notificationId);
    return notificationId;
  }

  // Diary notification schedule karna (daily reminder)
  async scheduleDailyDiaryNotification(hour: number, minute: number) {
    const isEnabled = await this.isNotificationEnabled('DIARY');
    if (!isEnabled) {
      console.log('Diary notifications are disabled');
      return null;
    }

    // Pehle purana diary notification cancel karna
    await this.cancelNotificationByType('diary-daily');

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📔 Diary Reminder',
        body: 'Time to write your daily diary!',
        data: { 
          type: 'diary',
          notificationType: 'diary-daily'
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true, // Daily repeat
      },
    });

    // Save notification ID for future cancellation
    await AsyncStorage.setItem('diary-daily-notification-id', notificationId);
    console.log('Daily diary notification scheduled:', notificationId);
    return notificationId;
  }

  // Festival notification schedule karna
  async scheduleFestivalNotification(
    festivalId: string,
    festivalName: string,
    festivalDate: Date
  ) {
    const isEnabled = await this.isNotificationEnabled('FESTIVAL');
    if (!isEnabled) {
      console.log('Festival notifications are disabled');
      return null;
    }

    // Festival ke din subah 9 baje notification
    const notificationDate = new Date(festivalDate);
    notificationDate.setHours(9, 0, 0, 0);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Event Today!',
        body: `Today is ${festivalName}. Happy ${festivalName}!`,
        data: { 
          type: 'festival', 
          festivalId: festivalId,
          festivalName: festivalName 
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationDate,
      },
    });

    console.log('Festival notification scheduled:', notificationId);
    return notificationId;
  }

  // Specific notification cancel karna
  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

    // 🆕 Diary notification schedule karna (per diary)
  async scheduleDiaryNotification(
    diaryId: string,
    title: string,
    body: string,
    scheduledDate: Date
  ) {
    const isEnabled = await this.isNotificationEnabled('DIARY');
    if (!isEnabled) {
      console.log('Diary notifications are disabled');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📔 Diary Reminder',
        body: body || title,
        data: {
          type: 'diary',
          diaryId: diaryId,
          title: title
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { date: scheduledDate },
    });

    console.log('Diary notification scheduled:', notificationId);
    return notificationId;
  }

  // Type ke basis pe notification cancel karna
  async cancelNotificationByType(type: string) {
    try {
      const savedId = await AsyncStorage.getItem(`${type}-notification-id`);
      if (savedId) {
        await this.cancelNotification(savedId);
        await AsyncStorage.removeItem(`${type}-notification-id`);
      }
    } catch (error) {
      console.error('Error cancelling notification by type:', error);
    }
  }

  // All notifications cancel karna
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // All scheduled notifications dekhna
  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Notification tap event listen karna
  setupNotificationListeners(
    onNotificationTap: (notification: Notifications.NotificationResponse) => void
  ) {
    // Jab notification tap ho
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        onNotificationTap(response);
      }
    );

    return subscription;
  }
}

export default new NotificationService();