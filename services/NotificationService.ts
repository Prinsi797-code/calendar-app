import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEYS = {
  OTHER: 'notification_other',
  FESTIVAL: 'notification_festival',
  CHALLENGE: 'notification_challenge',
  MEMO: 'notification_memo',
  DIARY: 'notification_diary'
};

const parseFestivalDate = (dateString: string) => {
  // dateString = "2025-03-25"
  const [year, month, day] = dateString.split('-').map(Number);

  // Local date (no timezone shift)
  return new Date(year, month - 1, day, 9, 0, 0);
};


class NotificationService {
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('Current notification permission status:', existingStatus);

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
        console.log('📱 New permission status:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        alert('Notification permissions are required for reminders!\n\nPlease enable notifications in:\nSettings → Your App → Notifications');
        return false;
      }

      console.log('✅ Notification permissions granted');

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        await Notifications.setNotificationChannelAsync('diary-reminders', {
          name: 'Diary Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
          sound: 'default',
        });
      }
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync('diary', [
          {
            identifier: 'view',
            buttonTitle: 'View',
            options: {
              opensAppToForeground: true,
            },
          },
        ]);
        const settings = await Notifications.getPermissionsAsync();
        console.log('📱 iOS Notification Settings:', JSON.stringify(settings, null, 2));
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async isNotificationEnabled(type: string): Promise<boolean> {
    try {
      const key = STORAGE_KEYS[type.toUpperCase() as keyof typeof STORAGE_KEYS];
      const value = await AsyncStorage.getItem(key);
      return value === 'true' || value === null;
    } catch (error) {
      console.error('Error checking notification setting:', error);
      return true;
    }
  }
  async scheduleMemoNotification(
    memoId: string,
    title: string,
    body: string,
    scheduledDate: Date
  ) {
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
        type: 'date',
        date: scheduledDate,
      },
    });
    console.log('Memo notification scheduled:', notificationId);
    return notificationId;
  }

  async scheduleChallengeNotification(
    challengeId: string,
    title: string,
    body: string,
    scheduledDate: Date,
    repeatType: string = 'never'
  ) {
    const isEnabled = await this.isNotificationEnabled('CHALLENGE');
    if (!isEnabled) {
      console.log('Challenge notifications are disabled');
      return null;
    }
    const now = new Date();
    if (scheduledDate <= now) {
      console.log('Cannot schedule notification in the past');
      return null;
    }
    let trigger: any;
    switch (repeatType) {
      case 'everyday':
        trigger = {
          type: 'daily',
          hour: scheduledDate.getHours(),
          minute: scheduledDate.getMinutes(),
        };
        console.log('📅 Daily notification scheduled at', scheduledDate.getHours(), ':', scheduledDate.getMinutes());
        break;
      case 'every_week':
        trigger = {
          type: 'weekly',
          weekday: scheduledDate.getDay() + 1,
          hour: scheduledDate.getHours(),
          minute: scheduledDate.getMinutes(),
        };
        console.log('Weekly notification scheduled on day', scheduledDate.getDay() + 1);
        break;
      case 'every_month':
        trigger = {
          type: 'calendar',
          value: {
            day: scheduledDate.getDate(),
            hour: scheduledDate.getHours(),
            minute: scheduledDate.getMinutes(),
          },
          repeats: true,
        };
        console.log('Monthly notification scheduled on day', scheduledDate.getDate());
        break;
      case 'never':
      default:
        trigger = {
          type: 'date',
          date: scheduledDate,
        };
        console.log('One-time notification scheduled for', scheduledDate.toISOString());
        break;
    }
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Challenge Reminder',
        body: body || title,
        data: {
          type: 'challenge',
          challengeId: challengeId,
          title: title
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
    console.log('Challenge notification scheduled:', notificationId);
    console.log('Repeat type:', repeatType);
    return notificationId;
  }

  async scheduleDiaryNotification(
    diaryId: string,
    title: string,
    body: string,
    reminderDateTime: Date
  ): Promise<string | null> {
    try {
      const isEnabled = await this.isNotificationEnabled('DIARY');
      if (!isEnabled) {
        console.log('Diary notifications are disabled');
        return null;
      }
      const now = new Date();
      const reminderTime = new Date(reminderDateTime);
      const timeDiff = reminderTime.getTime() - now.getTime();
      const secondsUntilTrigger = Math.floor(timeDiff / 1000);

      console.log('Current time:', now.toISOString());
      console.log('Reminder time:', reminderTime.toISOString());
      console.log('Time difference (seconds):', secondsUntilTrigger);
      console.log('Platform:', Platform.OS);

      if (secondsUntilTrigger < 5) {
        console.log('⚠️ Notification must be at least 5 seconds in future');
        return null;
      }

      const existingId = await AsyncStorage.getItem(`diary_${diaryId}_notification`);
      if (existingId) {
        await this.cancelNotification(existingId);
      }

      const content: any = {
        title: '📔 ' + title,
        body: body || `Reminder: ${title}`,
        data: {
          type: 'diary',
          diaryId: diaryId,
          title: title
        },
        sound: 'default',
      };

      if (Platform.OS === 'ios') {
        content.badge = 1;
        content.categoryIdentifier = 'diary';
      } else {
        content.priority = Notifications.AndroidNotificationPriority.MAX;
        content.vibrate = [0, 250, 250, 250];
      }

      const trigger: any = {
        type: 'timeInterval',
        seconds: secondsUntilTrigger,
        repeats: false,
      };

      if (Platform.OS === 'android') {
        trigger.channelId = 'diary-reminders';
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });

      console.log('Diary notification scheduled successfully!');
      console.log('Notification ID:', notificationId);
      console.log('Will trigger in:', secondsUntilTrigger, 'seconds');
      console.log('Will trigger at:', reminderTime.toLocaleString('en-IN'));

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Total scheduled notifications:', scheduled.length);

      const thisNotification = scheduled.find(n => n.identifier === notificationId);
      if (thisNotification) {
        console.log('Verified: Notification is in schedule queue');
        console.log('Trigger details:', JSON.stringify(thisNotification.trigger, null, 2));
      } else {
        console.log('Warning: Notification not found in schedule queue');
      }

      return notificationId;
    } catch (error) {
      console.error('Error scheduling diary notification:', error);
      return null;
    }
  }

  async scheduleDailyDiaryNotification(hour: number, minute: number) {
    const isEnabled = await this.isNotificationEnabled('DIARY');
    if (!isEnabled) {
      console.log('Diary notifications are disabled');
      return null;
    }

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
        type: 'daily',
        hour: hour,
        minute: minute,
      },
    });

    await AsyncStorage.setItem('diary-daily-notification-id', notificationId);
    console.log('Daily diary notification scheduled:', notificationId);
    return notificationId;
  }

  async scheduleFestivalNotification(
    festivalId: string,
    festivalName: string,
    festivalDateString: string
  ) {
    const isEnabled = await this.isNotificationEnabled('FESTIVAL');
    if (!isEnabled) return null;
    const notificationDate = parseFestivalDate(festivalDateString);

    if (notificationDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Festival Today 🎉',
        body: `Today is ${festivalName}. Happy ${festivalName}!`,
        data: {
          type: 'festival',
          festivalId,
          festivalName,
        },
        sound: true,
      },
      trigger: notificationDate,
    });

    return notificationId;
  }


  async scheduleEventNotification(
    eventId: string,
    title: string,
    body: string,
    scheduledDate: Date,
    repeatType: string = 'Does not repeat',
    reminderOffset: string = 'At a time of event'
  ) {
    const isEnabled = await this.isNotificationEnabled('OTHER');
    if (!isEnabled) {
      console.log('Event notifications are disabled');
      return null;
    }
    let reminderTime = new Date(scheduledDate);

    switch (reminderOffset) {
      case 'At a time of event':
      case 'at_time':
        break;
      case '5 minutes before':
      case '5min':
        reminderTime.setMinutes(reminderTime.getMinutes() - 5);
        break;
      case '10 minutes before':
      case '10min':
        reminderTime.setMinutes(reminderTime.getMinutes() - 10);
        break;
      case '15 minutes before':
      case '15min':
        reminderTime.setMinutes(reminderTime.getMinutes() - 15);
        break;
      case '30 minutes before':
      case '30min':
        reminderTime.setMinutes(reminderTime.getMinutes() - 30);
        break;
      case '1 hour before':
      case '1hour':
        reminderTime.setHours(reminderTime.getHours() - 1);
        break;
      case '1 day before':
      case '1day':
        reminderTime.setDate(reminderTime.getDate() - 1);
        break;
      case 'On the day at 9 AM':
      case 'on_day_9am':
        reminderTime.setHours(9, 0, 0, 0);
        break;
      case 'The day before at 9 AM':
      case 'day_before_9am':
        reminderTime.setDate(reminderTime.getDate() - 1);
        reminderTime.setHours(9, 0, 0, 0);
        break;
      case '2 days before at 9 AM':
      case '2days_before_9am':
        reminderTime.setDate(reminderTime.getDate() - 2);
        reminderTime.setHours(9, 0, 0, 0);
        break;
      case '1 Week before at 9 AM':
      case '1week_before_9am':
        reminderTime.setDate(reminderTime.getDate() - 7);
        reminderTime.setHours(9, 0, 0, 0);
        break;
      case '2 weeks before at 9 AM':
      case '2weeks_before_9am':
        reminderTime.setDate(reminderTime.getDate() - 14);
        reminderTime.setHours(9, 0, 0, 0);
        break;
    }
    const now = new Date();
    if (reminderTime <= now) {
      console.log('Reminder time is in the past, cannot schedule');
      return null;
    }
    let trigger: any;
    const repeatLower = repeatType.toLowerCase();

    if (repeatLower.includes('day') || repeatType === 'Everyday' || repeatType === 'everyday') {
      trigger = {
        type: 'daily',
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
      };
      console.log('Daily event notification scheduled at', reminderTime.getHours(), ':', reminderTime.getMinutes());

    } else if (repeatLower.includes('week') || repeatType === 'Every week' || repeatType === 'every_week') {
      trigger = {
        type: 'weekly',
        weekday: reminderTime.getDay() + 1,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
      };
      console.log('Weekly event notification scheduled on day', reminderTime.getDay() + 1);

    } else if (repeatLower.includes('month') || repeatType === 'Every month' || repeatType === 'every_month') {
      trigger = {
        type: 'calendar',
        value: {
          day: reminderTime.getDate(),
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
        },
        repeats: true,
      };
      console.log('Monthly event notification scheduled on day', reminderTime.getDate());

    } else if (repeatLower.includes('year') || repeatType === 'Every year' || repeatType === 'every_year') {
      trigger = {
        type: 'calendar',
        value: {
          month: reminderTime.getMonth() + 1,
          day: reminderTime.getDate(),
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
        },
        repeats: true,
      };
      console.log('Yearly event notification scheduled');

    } else {
      trigger = {
        type: 'date',
        date: reminderTime,
      };
      console.log('One-time event notification scheduled for', reminderTime.toISOString());
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 ' + title,
        body: body || `Event Reminder: ${title}`,
        data: {
          type: 'event',
          eventId: eventId,
          title: title
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    console.log('Event notification scheduled:', notificationId);
    console.log('Repeat type:', repeatType);
    console.log('Reminder offset:', reminderOffset);
    return notificationId;
  }
  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

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

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

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
  setupNotificationListeners(
    onNotificationTap: (notification: Notifications.NotificationResponse) => void
  ) {
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