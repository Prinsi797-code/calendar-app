import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert, // ⭐ Add loading indicator
  InteractionManager,
  KeyboardAvoidingView,
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
import {
  BannerAdSize,
  GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../../contexts/ThemeContext';
import AdsManager from '../../services/adsManager';
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
  const [isSaving, setIsSaving] = useState(false); // ⭐ Loading state
  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);

  useEffect(() => {
    const config = AdsManager.getBannerConfig('home');
    setBannerConfig(config);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      await NotificationService.requestPermissions();
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // ⭐ FIX 1: Load with timeout protection
  const loadMemos = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const loadPromise = AsyncStorage.getItem('memo');

      const memoData = await Promise.race([loadPromise, timeoutPromise]) as string | null;

      if (memoData) {
        const parsedMemos = JSON.parse(memoData);
        setMemos(parsedMemos);
      } else {
        setMemos([]);
      }
    } catch (error) {
      console.error('Error loading memos:', error);
      setMemos([]);
    }
  };

  // ⭐ FIX 2: Defer heavy operations
  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        loadMemos();
      });
    }, [])
  );

  useEffect(() => {
    if (isEditMode && params.id) {
      InteractionManager.runAfterInteractions(() => {
        loadMemoData(params.id as string);
      });
    } else {
      setTitle('');
      setDetails('');
      setReminderEnabled(false);
      setSelectedDate(new Date());
      setSelectedTime(getMinAllowedTime());
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

  // ⭐ FIX 3: Completely rewritten handleSave
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    // Prevent double-tap
    if (isSaving) {
      return;
    }

    if (reminderEnabled) {
      const reminderDateTime = combineDateTime(selectedDate, selectedTime);
      const now = new Date();
      const timeDiff = (reminderDateTime.getTime() - now.getTime()) / 1000;

      if (timeDiff < 5) {
        Alert.alert(
          'Invalid Time',
          'Reminder time must be at least 5 seconds in the future.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setIsSaving(true);

    // ⭐ Navigate back immediately - don't wait for save
    router.back();

    // ⭐ Save in background (fire and forget)
    InteractionManager.runAfterInteractions(async () => {
      try {
        await performSave();
      } catch (error) {
        console.error('Background save error:', error);
        // Silently fail - user already left screen
      } finally {
        setIsSaving(false);
      }
    });
  };

  // ⭐ FIX 4: Optimized save logic
  const performSave = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Save timeout')), 3000)
      );
      const loadPromise = AsyncStorage.getItem('memo');

      const memoData = await Promise.race([loadPromise, timeoutPromise]) as string | null;
      let memos = memoData ? JSON.parse(memoData) : [];
      let memoId: string;

      if (isEditMode && params.id) {
        memoId = params.id as string;

        // ⭐ Fire and forget - don't await
        AsyncStorage.getItem(`memo_${memoId}_notification`).then(oldNotificationId => {
          if (oldNotificationId) {
            NotificationService.cancelNotification(oldNotificationId).catch(console.error);
            AsyncStorage.removeItem(`memo_${memoId}_notification`).catch(console.error);
          }
        }).catch(console.error);

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
      }

      // ⭐ Schedule notification (fire and forget)
      if (reminderEnabled) {
        const reminderDateTime = combineDateTime(selectedDate, selectedTime);

        NotificationService.scheduleMemoNotification(
          memoId,
          title.trim(),
          details.trim() || `Memo Reminder: ${title.trim()}`,
          reminderDateTime
        ).then(notificationId => {
          if (notificationId) {
            AsyncStorage.setItem(`memo_${memoId}_notification`, notificationId).catch(console.error);
          }
        }).catch(console.error);
      }

      // ⭐ Save with timeout
      const dataToSave = JSON.stringify(memos);
      const savePromise = AsyncStorage.setItem('memo', dataToSave);
      const saveTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Save timeout')), 3000)
      );

      await Promise.race([savePromise, saveTimeout]);

    } catch (error) {
      console.error('Save error:', error);
      throw error;
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

  const getMinAllowedTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now;
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const testDate = new Date();
    testDate.setHours(23, 0, 0, 0);
    const formatted = testDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

    const is24Hour = formatted.startsWith('23');

    if (is24Hour) {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    }
  };

  const resetForm = () => {
    setTitle('');
    setDetails('');
    setReminderEnabled(false);
    setSelectedDate(new Date());
    setSelectedTime(getMinAllowedTime());
    setLocation('');
    setUrl('');
  };

  const handleCancel = () => {
    resetForm();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.leftContainer}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {isEditMode ? t("edit_memo") : t("new_memo")}
            </Text>
          </View>

          {/* ⭐ Show loading indicator */}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton]}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>
                {isEditMode ? t('update') : t('save')}
              </Text>
            )}
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

        {bannerConfig?.show && (
          <View style={styles.stickyAdContainer}>
            <GAMBannerAd
              unitId={bannerConfig.id}
              sizes={[BannerAdSize.BANNER]}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        )}

        {Platform.OS === 'ios' && (
          <Modal visible={showIOSPicker} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {t('select_reminder_time')}
                </Text>

                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={pickerMode === 'date' ? selectedDate : selectedTime}
                    mode={pickerMode}
                    display="spinner"
                    minimumDate={pickerMode === 'time' ? getMinAllowedTime() : new Date()}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyAdContainer: {
    width: '100%',
    alignItems: 'center',
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