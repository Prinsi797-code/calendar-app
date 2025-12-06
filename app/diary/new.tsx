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

    // Load existing diary data if editing
    useEffect(() => {
        if (isEditMode && params.id) {
            loadDiaryData(params.id as string);
        } else {
            // Reset all fields when adding new diary
            setTitle('');
            setSelectedIcon('💪');
            setReminderEnabled(false);
            setSelectedDate(new Date());
            setSelectedTime(new Date());
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

        try {
            const diaryData = await AsyncStorage.getItem('diarys');
            let diarys = diaryData ? JSON.parse(diaryData) : [];

            let diaryId = isEditMode ? params.id as string : Date.now().toString();
            let notificationId: string | null = null;

            // ⏰ If reminder is ON, check future
            if (reminderEnabled) {
                const reminderDateTime = combineDateTime(selectedDate, selectedTime);

                if (!isDateTimeInFuture(reminderDateTime)) {
                    Alert.alert("Invalid Time", "Reminder must be in the future.");
                    return;
                }
            }

            // ✏️ Update
            if (isEditMode && params.id) {
                // cancel previous notification
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
                // ➕ Add new
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

            // 🔔 Schedule New Notification
            if (reminderEnabled) {
                const reminderDT = combineDateTime(selectedDate, selectedTime);

                notificationId = await NotificationService.scheduleDiaryNotification(
                    diaryId,
                    title,
                    `Diary Reminder: ${title}`,
                    reminderDT
                );
                if (notificationId) {
                    await AsyncStorage.setItem(
                        `diary_${diaryId}_notification`,
                        notificationId
                    );
                }
            }

            await AsyncStorage.setItem('diarys', JSON.stringify(diarys));
            router.back();
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
    // Date + Time combine
    const combineDateTime = (date: Date, time: Date) => {
        const c = new Date(date);
        c.setHours(time.getHours());
        c.setMinutes(time.getMinutes());
        c.setSeconds(0);
        c.setMilliseconds(0);
        return c;
    };

    // Future validation
    const isDateTimeInFuture = (dt: Date) => {
        return dt.getTime() > new Date().getTime();
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
                {/* LEFT SIDE (Back + Title) */}
                <View style={styles.leftContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        {isEditMode ? 'Edit Diary' : 'New Diary'}
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

                    {/* Emoji Selector Grid */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Choose Emoji</Text>
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
        // borderBottomWidth: 1,
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
        width: '90%',
        borderRadius: 20,
        paddingBottom: 20,
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
        fontSize: 16,
        fontWeight: '600',
    },
});