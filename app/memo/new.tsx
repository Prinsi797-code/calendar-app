import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationService from '../../services/NotificationService';

export default function NewMemoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [memos, setMemos] = useState([]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    await NotificationService.requestPermissions();
  };

  const loadMemos = async () => {
    try {
      const memoData = await AsyncStorage.getItem('memo');
      console.log('Raw memo data:', memoData);
      if (memoData) {
        const parsedMemos = JSON.parse(memoData);
        console.log('Parsed memos:', parsedMemos);
        setMemos(parsedMemos);
      } else {
        console.log('No memo data found!');
        setMemos([]);
      }
    } catch (error) {
      console.error('Error loading memos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Memo List Screen focused - Loading memos...');
      loadMemos();
    }, [])
  );

  useEffect(() => {
    if (isEditMode && params.id) {
      loadMemoData(params.id as string);
    } else {
      setTitle('');
      setDetails('');
      setReminderEnabled(false);
      setSelectedDate(new Date());
      setSelectedTime(new Date());
      setLocation('');
      setUrl('');
    }
  }, [params.id]);

  const loadMemoData = async (id: string) => {
    try {
      const memoData = await AsyncStorage.getItem('memo');
      if (memoData) {
        const memos = JSON.parse(memoData);
        const memo = memos.find((m: any) => m.id === id);
        if (memo) {
          setTitle(memo.title);
          setDetails(memo.details || '');
          setLocation(memo.location || '');
          setUrl(memo.url || '');

          if (memo.Date) {
            setSelectedDate(new Date(memo.Date));
          }

          if (memo.reminder) {
            setReminderEnabled(true);
            setSelectedTime(new Date(memo.reminder));
          } else {
            setReminderEnabled(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading memo:', error);
    }
  };
  const combineDateTime = (date: Date, time: Date): Date => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const isDateTimeInFuture = (dateTime: Date): boolean => {
    const now = new Date();
    return dateTime.getTime() > now.getTime();
  };
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (reminderEnabled) {
      const reminderDateTime = combineDateTime(selectedDate, selectedTime);
      const now = new Date();
      const timeDiff = (reminderDateTime.getTime() - now.getTime()) / 1000;

      console.log('Selected Date:', selectedDate.toISOString());
      console.log('Selected Time:', selectedTime.toISOString());
      console.log('Combined DateTime:', reminderDateTime.toISOString());
      console.log('Current Time:', now.toISOString());
      console.log('Time difference (seconds):', timeDiff);
      if (timeDiff < 5) {
        Alert.alert(
          'Invalid Time',
          'Reminder time must be at least 5 seconds in the future. Please select a later time.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const memoData = await AsyncStorage.getItem('memo');
      let memos = memoData ? JSON.parse(memoData) : [];
      let memoId: string;
      let notificationId: string | null = null;

      if (isEditMode && params.id) {
        memoId = params.id as string;
        const oldNotificationId = await AsyncStorage.getItem(`memo_${memoId}_notification`);
        if (oldNotificationId) {
          await NotificationService.cancelNotification(oldNotificationId);
          await AsyncStorage.removeItem(`memo_${memoId}_notification`);
          console.log('Old notification cancelled');
        }

        memos = memos.map((m: any) =>
          m.id === memoId
            ? {
              ...m,
              title: title.trim(),
              details: details.trim(),
              Date: selectedDate.toISOString(),
              reminder: reminderEnabled
                ? combineDateTime(selectedDate, selectedTime).toISOString()
                : '',
              location: location.trim(),
              url: url.trim(),
            }
            : m
        );
        console.log('Memo updated');

      } else {
        memoId = Date.now().toString();

        const newMemo = {
          id: memoId,
          title: title.trim(),
          details: details.trim(),
          Date: selectedDate.toISOString(),
          reminder: reminderEnabled
            ? combineDateTime(selectedDate, selectedTime).toISOString()
            : '',
          location: location.trim(),
          url: url.trim(),
          completed: false,
        };

        memos.push(newMemo);
        console.log('New memo added');
      }

      if (reminderEnabled) {
        const reminderDateTime = combineDateTime(selectedDate, selectedTime);

        console.log('=== Scheduling Memo Notification ===');
        console.log('Memo ID:', memoId);
        console.log('Title:', title.trim());
        console.log('Reminder Time:', reminderDateTime.toISOString());

        notificationId = await NotificationService.scheduleMemoNotification(
          memoId,
          title.trim(),
          details.trim() || `Memo Reminder: ${title.trim()}`,
          reminderDateTime
        );

        if (notificationId) {
          await AsyncStorage.setItem(`memo_${memoId}_notification`, notificationId);
          console.log('Memo notification scheduled successfully!');
          console.log('Notification ID:', notificationId);
          console.log('Will trigger at:', reminderDateTime.toLocaleString());
        } else {
          console.error('Failed to schedule memo notification');
          Alert.alert(
            'Notice',
            'Memo saved but reminder time was too close. Please edit and set a future time.'
          );
        }
      }
      await AsyncStorage.setItem('memo', JSON.stringify(memos));
      console.log('Memo data saved to AsyncStorage');

      if (reminderEnabled && notificationId) {
        Alert.alert(
          'Success',
          `Memo saved! Reminder set for ${formatDate(selectedDate)} at ${formatTime(selectedTime)}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        router.back();
      }

    } catch (error) {
      console.error('Error saving memo:', error);
      Alert.alert('Error', 'Failed to save memo. Please try again.');
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (time) {
        setSelectedTime(time);
      }
    } else {
      if (time) {
        setSelectedTime(time);
      }
    }
  };

  const handleIOSPickerPress = (mode: 'date' | 'time') => {
    if (Platform.OS === 'ios') {
      setPickerMode(mode);
      setShowIOSPicker(true);
    } else {
      if (mode === 'date') {
        setShowDatePicker(true);
      } else {
        setShowTimePicker(true);
      }
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {isEditMode ? t("edit_memo") : t("new_memo")}
          </Text>
        </View>

        <TouchableOpacity onPress={handleSave} style={[styles.saveButton]}>
          <Text style={styles.saveText}>{isEditMode ? t('update') : t('save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.titleInput, { color: colors.textPrimary, backgroundColor: colors.cardBackground }]}
              placeholder={t('type_title')}
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.detailsInput, { color: colors.textPrimary, backgroundColor: colors.cardBackground }]}
              placeholder={t('add_details')}
              placeholderTextColor={colors.textSecondary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={[styles.timeContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>{t('time')}</Text>
            <TouchableOpacity
              style={[styles.toggle, reminderEnabled && styles.toggleActive]}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <View style={[styles.toggleCircle, reminderEnabled && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          {reminderEnabled && (
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleIOSPickerPress('date')}
              >
                <Feather name="calendar" size={16} color={colors.textSecondary} style={styles.dateTimeIcon} />
                <Text style={[styles.dateTimeText, { color: colors.textPrimary }]}>
                  {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleIOSPickerPress('time')}
              >
                <Feather name="clock" size={16} color={colors.textSecondary} style={styles.dateTimeIcon} />
                <Text style={[styles.dateTimeText, { color: colors.textPrimary }]}>
                  {formatTime(selectedTime)}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('enter_location')}</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: colors.cardBackground }]}>
              <Feather name="map-pin" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder={t('location')}
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('enter_URL')}</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: colors.cardBackground }]}>
              <Feather name="link" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder={t('url')}
                placeholderTextColor={colors.textSecondary}
                value={url}
                onChangeText={setUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {Platform.OS === 'ios' && (
        <Modal visible={showIOSPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>

              {/* Title */}
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {t('select_reminder_time')}
              </Text>

              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={pickerMode === 'date' ? selectedDate : selectedTime}
                  mode={pickerMode}
                  display="spinner"
                  onChange={pickerMode === 'date' ? onDateChange : onTimeChange}
                  textColor={colors.textPrimary}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => setShowIOSPicker(false)} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => setShowIOSPicker(false)}
                >
                  <Text style={[styles.modalButtonTextPrimary]}>
                    {t('ok')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
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
    paddingVertical: 12,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF5252',
    borderRadius: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    minHeight: 50,
  },
  detailsInput: {
    fontSize: 14,
    padding: 16,
    borderRadius: 8,
    minHeight: 120,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    minHeight: 50,
    gap: 12,
  },
  input: {
    fontSize: 14,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#FF6B6B',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  dateTimeIcon: {
    marginRight: 4,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },

  footerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    backgroundColor: '#FF5252',
  },
  pickerWrapper: {
    width: '100%',
    overflow: 'hidden',   // 🔥 MOST IMPORTANT
    alignItems: 'center',
  },

  datePicker: {
    width: '100%',
    height: 180,
  },

});