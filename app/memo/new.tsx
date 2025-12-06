import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    await NotificationService.requestPermissions();
  };

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

  // ✅ FIXED: Date aur Time ko properly combine karna
  const combineDateTime = (date: Date, time: Date): Date => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  // ✅ FIXED: Check if datetime is in future
  const isDateTimeInFuture = (dateTime: Date): boolean => {
    const now = new Date();
    return dateTime.getTime() > now.getTime();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const memoData = await AsyncStorage.getItem('memo');
      let memos = memoData ? JSON.parse(memoData) : [];
      let memoId: string;
      let notificationId: string | null = null;

      // ========== NOTIFICATION VALIDATION (Agar reminder enabled hai) ==========
      if (reminderEnabled) {
        // Date aur Time ko properly combine karna
        const reminderDateTime = combineDateTime(selectedDate, selectedTime);
        
        console.log('📅 Selected Date:', selectedDate.toLocaleString());
        console.log('⏰ Selected Time:', selectedTime.toLocaleString());
        console.log('🔔 Combined DateTime:', reminderDateTime.toLocaleString());
        console.log('🕐 Current Time:', new Date().toLocaleString());

        // Check karo ki time future me hai ya nahi
        if (!isDateTimeInFuture(reminderDateTime)) {
          Alert.alert(
            'Invalid Time ⚠️', 
            'Reminder time must be in the future. Please select a future date and time.',
            [{ text: 'OK' }]
          );
          return; // Save nahi karna agar time past me hai
        }
      }

      if (isEditMode && params.id) {
        // ========== UPDATE EXISTING MEMO ==========
        memoId = params.id as string;

        // Purana notification cancel karna
        const oldNotificationId = await AsyncStorage.getItem(`memo_${memoId}_notification`);
        if (oldNotificationId) {
          await NotificationService.cancelNotification(oldNotificationId);
          await AsyncStorage.removeItem(`memo_${memoId}_notification`);
          console.log('🗑️ Old notification cancelled');
        }

        // Update memo
        memos = memos.map((m: any) =>
          m.id === memoId
            ? {
              ...m,
              title: title.trim(),
              details: details.trim(),
              Date: selectedDate.toISOString(),
              reminder: reminderEnabled ? combineDateTime(selectedDate, selectedTime).toISOString() : '',
              location: location.trim(),
              url: url.trim(),
            }
            : m
        );

      } else {
        // ========== ADD NEW MEMO ==========
        memoId = Date.now().toString();
        
        const newMemo = {
          id: memoId,
          title: title.trim(),
          details: details.trim(),
          Date: selectedDate.toISOString(),
          reminder: reminderEnabled ? combineDateTime(selectedDate, selectedTime).toISOString() : '',
          location: location.trim(),
          url: url.trim(),
          completed: false,
        };
        memos.push(newMemo);
      }

      // ========== SCHEDULE NOTIFICATION (Agar reminder enabled hai) ==========
      if (reminderEnabled) {
        const reminderDateTime = combineDateTime(selectedDate, selectedTime);

        // Notification schedule karna
        notificationId = await NotificationService.scheduleMemoNotification(
          memoId,
          title.trim(),
          details.trim() || `Reminder: ${title.trim()}`,
          reminderDateTime
        );

        if (notificationId) {
          // Notification ID save karna
          await AsyncStorage.setItem(`memo_${memoId}_notification`, notificationId);
          
          console.log('Notification Scheduled Successfully!');
          console.log('Notification ID:', notificationId);
          console.log('Will trigger at:', reminderDateTime.toLocaleString());
        } else {
          console.log('Notification not scheduled (might be disabled in settings)');
        }
      }

      // Save memo data
      await AsyncStorage.setItem('memo', JSON.stringify(memos));
      
      // Success message
      if (reminderEnabled && notificationId) {
        const reminderDateTime = combineDateTime(selectedDate, selectedTime);
        Alert.alert(
          'Success ✅', 
          `Memo ${isEditMode ? 'updated' : 'created'} successfully!\n\nReminder set for:\n${formatDate(reminderDateTime)} at ${formatTime(reminderDateTime)}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        router.back();
      }

    } catch (error) {
      console.error('Error saving memo:', error);
      Alert.alert('Error', 'Failed to save memo');
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
      <View style={[styles.header, { backgroundColor: colors.background}]}>

        {/* LEFT SIDE (Back + Title) */}
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {isEditMode ? 'Edit Memo' : 'New Memo'}
          </Text>
        </View>

        {/* RIGHT SIDE (SAVE/UPDATE BUTTON) */}
        <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: '#FF6B6B' }]}>
          <Text style={styles.saveText}>{isEditMode ? 'UPDATE' : 'SAVE'}</Text>
        </TouchableOpacity>

      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.titleInput, { color: colors.textPrimary, backgroundColor: colors.cardBackground }]}
              placeholder="Type title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Details Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.detailsInput, { color: colors.textPrimary, backgroundColor: colors.cardBackground }]}
              placeholder="Add details"
              placeholderTextColor={colors.textSecondary}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Time Toggle */}
          <View style={[styles.timeContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Time</Text>
            <TouchableOpacity
              style={[styles.toggle, reminderEnabled && styles.toggleActive]}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <View style={[styles.toggleCircle, reminderEnabled && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          {/* Date Time Pickers - Only show if reminder is enabled */}
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

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Enter location</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: colors.cardBackground }]}>
              <Feather name="map-pin" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Location"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* URL Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Enter URL</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: colors.cardBackground }]}>
              <Feather name="link" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="URL"
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

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showIOSPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowIOSPicker(false)}>
                  <Text style={[styles.modalButton, { color: '#FF6B6B' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowIOSPicker(false)}>
                  <Text style={[styles.modalButton, { color: '#FF6B6B' }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerMode === 'date' ? selectedDate : selectedTime}
                mode={pickerMode}
                display="spinner"
                onChange={pickerMode === 'date' ? onDateChange : onTimeChange}
                textColor={colors.textPrimary}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Android Time Picker */}
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
    borderRadius: 4,
  },
  saveText: {
    color: '#FFFFFF',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '600',
  },
});