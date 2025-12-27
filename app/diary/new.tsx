import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
    Alert,
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

const iconOptions = [
    '🧑‍💻', '📸', '🏃‍♂️', '🧘‍♂️', '🧑‍🍳', '🛌',
    '🧑‍🎨', '🕺', '🚶‍♂️', '🧑‍🏫', '🧑‍⚕️'
];

export default function NewDiaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = !!params.id;
    const { colors } = useTheme();
    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('💪');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const { t } = useTranslation();
    const [location, setLocation] = useState('');
    const [url, setUrl] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
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
        await NotificationService.requestPermissions();
    };

    useEffect(() => {
        if (isEditMode && params.id) {
            loadDiaryData(params.id as string);
        } else {
            setTitle('');
            setSelectedIcon('💪');
            setReminderEnabled(false);
            setSelectedDate(new Date());
            // setSelectedTime(new Date());
            setSelectedTime(getMinAllowedTime());
            setLocation('');
            setUrl('');
        }
    }, [params.id]);

    const loadDiaryData = async (id: string) => {
        try {
            const diaryData = await AsyncStorage.getItem('diarys');
            if (diaryData) {
                const diarys = JSON.parse(diaryData);
                const diary = diarys.find((d: any) => d.id === id);
                if (diary) {
                    setTitle(diary.title);
                    setSelectedIcon(diary.icon || '💪');
                    setLocation(diary.location || '');
                    setUrl(diary.url || '');

                    if (diary.Date) {
                        setSelectedDate(new Date(diary.Date));
                    }

                    if (diary.reminder) {
                        setReminderEnabled(true);
                        setSelectedTime(new Date(diary.reminder));
                    } else {
                        setReminderEnabled(false);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading diary:', error);
        }
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
            if (timeDiff < 5) {
                Alert.alert(
                    'Invalid Time',
                    'Reminder time must be at least 5 seconds in the future. Please select a later time.'
                );
                return;
            }
        }

        try {
            const diaryData = await AsyncStorage.getItem('diarys');
            let diarys = diaryData ? JSON.parse(diaryData) : [];

            let diaryId = isEditMode ? params.id as string : Date.now().toString();
            let notificationId: string | null = null;

            if (isEditMode && params.id) {
                const oldNoti = await AsyncStorage.getItem(`diary_${diaryId}_notification`);
                if (oldNoti) {
                    await NotificationService.cancelNotification(oldNoti);
                    await AsyncStorage.removeItem(`diary_${diaryId}_notification`);
                }

                diarys = diarys.map((d: any) =>
                    d.id === diaryId
                        ? {
                            ...d,
                            title: title.trim(),
                            icon: selectedIcon,
                            Date: selectedDate.toISOString(),
                            reminder: reminderEnabled
                                ? combineDateTime(selectedDate, selectedTime).toISOString()
                                : '',
                            location: location.trim(),
                            url: url.trim(),
                        }
                        : d
                );
            } else {
                const newDiary = {
                    id: diaryId,
                    title: title.trim(),
                    icon: selectedIcon,
                    Date: selectedDate.toISOString(),
                    reminder: reminderEnabled
                        ? combineDateTime(selectedDate, selectedTime).toISOString()
                        : '',
                    location: location.trim(),
                    url: url.trim(),
                    completed: false,
                };

                diarys.push(newDiary);
            }
            if (reminderEnabled) {
                const reminderDT = combineDateTime(selectedDate, selectedTime);

                console.log('=== Scheduling Notification ===');
                console.log('Selected Date:', selectedDate.toISOString());
                console.log('Selected Time:', selectedTime.toISOString());
                console.log('Combined DateTime:', reminderDT.toISOString());
                console.log('Current Time:', new Date().toISOString());

                notificationId = await NotificationService.scheduleDiaryNotification(
                    diaryId,
                    title.trim(),
                    `Diary Reminder: ${title.trim()}`,
                    reminderDT
                );

                if (notificationId) {
                    await AsyncStorage.setItem(
                        `diary_${diaryId}_notification`,
                        notificationId
                    );
                    console.log('Notification ID saved:', notificationId);
                } else {
                    console.error('Failed to schedule notification - Time might be too close');
                    Alert.alert(
                        'Notice',
                        'Diary saved but reminder time was too close. Please edit and set a future time.'
                    );
                }
            }
            await AsyncStorage.setItem('diarys', JSON.stringify(diarys));
            if (reminderEnabled && notificationId) {
                Alert.alert(
                    'Success',
                    `Diary saved! Reminder set for ${formatDate(selectedDate)} at ${formatTime(selectedTime)}`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                router.back();
            }
        } catch (error) {
            console.error('Error saving diary:', error);
            Alert.alert('Error', 'Failed to save diary');
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
    const combineDateTime = (date: Date, time: Date) => {
        const c = new Date(date);
        c.setHours(time.getHours());
        c.setMinutes(time.getMinutes());
        c.setSeconds(0);
        c.setMilliseconds(0);
        return c;
    };

    const isDateTimeInFuture = (dt: Date) => {
        return dt.getTime() > new Date().getTime();
    };

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // const formatTime = (date: Date) => {
    //     let hours = date.getHours();
    //     const minutes = String(date.getMinutes()).padStart(2, '0');
    //     const ampm = hours >= 12 ? 'PM' : 'AM';
    //     hours = hours % 12 || 12;
    //     return `${hours}:${minutes} ${ampm}`;
    // };
    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getMinAllowedTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        return now;
    };
    const resetForm = () => {
        setTitle('');
        setSelectedIcon('💪');
        setReminderEnabled(false);
        setSelectedDate(new Date());
        setSelectedTime(getMinAllowedTime());
        setLocation('');
        setUrl('');
        setShowDatePicker(false);
        setShowTimePicker(false);
        setShowIOSPicker(false);
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
                {/* <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> */}
                <View style={[styles.header, { backgroundColor: colors.background }]}>

                    <View style={styles.leftContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                            {isEditMode ? t("edit_diary") : t("new_diary")}
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

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>{t('choose_emoji')}</Text>
                            <View style={styles.iconGrid}>
                                {iconOptions.map((icon) => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.iconButton,
                                            { backgroundColor: colors.cardBackground },
                                            selectedIcon === icon && styles.iconButtonSelected,
                                        ]}
                                        onPress={() => setSelectedIcon(icon)}
                                    >
                                        <Text style={styles.iconText}>{icon}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
                {/* iOS Modal Picker */}
                {Platform.OS === 'ios' && (
                    // <Modal
                    //     visible={showIOSPicker}
                    //     transparent
                    //     animationType="slide"
                    // >
                    //     <View style={styles.modalOverlay}>
                    //         <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                    //             <View style={styles.modalHeader}>
                    //                 <TouchableOpacity onPress={() => setShowIOSPicker(false)}>
                    //                     <Text style={[styles.modalButton, { color: '#FF6B6B' }]}>Cancel</Text>
                    //                 </TouchableOpacity>
                    //                 <TouchableOpacity onPress={() => setShowIOSPicker(false)}>
                    //                     <Text style={[styles.modalButton, { color: '#FF6B6B' }]}>Done</Text>
                    //                 </TouchableOpacity>
                    //             </View>
                    //             <DateTimePicker
                    //                 value={pickerMode === 'date' ? selectedDate : selectedTime}
                    //                 mode={pickerMode}
                    //                 display="spinner"
                    //                 onChange={pickerMode === 'date' ? onDateChange : onTimeChange}
                    //                 textColor={colors.textPrimary}
                    //             />
                    //         </View>
                    //     </View>
                    // </Modal>
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stickyAdContainer: {
        // position: 'absolute',
        // bottom: 60,
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
    section: {
        marginBottom: 16,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconButton: {
        width: 56,
        height: 56,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButtonSelected: {
        borderWidth: 2,
        borderColor: '#FF6B6B',
    },
    iconText: {
        fontSize: 28,
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
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
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