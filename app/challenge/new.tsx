import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert, // ⭐ Add loading
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

const iconOptions = [
    '💪', '🗑️', '💣', '🎨', '☕', '🔧',
    '💊', '✖️', '🏋️', '✏️', '💉', '🏠',
];

export default function NewChallengeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    const defaultTitle = params.title ? String(params.title) : 'Challenge Yourself Today.';
    const defaultIcon = params.icon ? String(params.icon) : '💪';

    const getInitialReminderTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Original values
    const [originalTitle, setOriginalTitle] = useState(defaultTitle);
    const [originalIcon, setOriginalIcon] = useState(defaultIcon);
    const [originalRepeat, setOriginalRepeat] = useState('never');
    const [originalStartDate, setOriginalStartDate] = useState(new Date());
    const [originalEndDate, setOriginalEndDate] = useState(new Date());
    const [originalReminder, setOriginalReminder] = useState(getInitialReminderTime());

    // Current editing values
    const [title, setTitle] = useState(defaultTitle);
    const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
    const [repeat, setRepeat] = useState('never');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reminder, setReminder] = useState(getInitialReminderTime());

    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false); // ⭐ Loading state
    
    const { t } = useTranslation();
    const { from } = useLocalSearchParams();
    const { colors, theme } = useTheme();
    const [bannerConfig, setBannerConfig] = useState<{
        show: boolean;
        id: string;
        position: string;
    } | null>(null);

    useEffect(() => {
        const config = AdsManager.getBannerConfig('home');
        setBannerConfig(config);
    }, []);

    const repeatOptions = [
        { key: "never", label: t("never") },
        { key: "everyday", label: t("everyday") },
        { key: "every_week", label: t("every_week") },
        { key: "every_month", label: t("every_month") }
    ];

    useEffect(() => {
        NotificationService.requestPermissions().catch(console.error);
    }, []);

    // ⭐ FIX 1: Defer heavy loading
    useEffect(() => {
        if (isEditMode && params.id) {
            InteractionManager.runAfterInteractions(() => {
                loadChallengeData(params.id as string);
            });
        }
    }, [params.id]);

    useEffect(() => {
        if (params.title) {
            const titleStr = String(params.title);
            setOriginalTitle(titleStr);
            setTitle(titleStr);
        }
        if (params.icon) {
            const iconStr = String(params.icon);
            setOriginalIcon(iconStr);
            setSelectedIcon(iconStr);
        }
    }, [params.title, params.icon]);

    // ⭐ FIX 2: Add timeout protection
    const loadChallengeData = async (id: string) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Load timeout')), 3000)
            );
            const loadPromise = AsyncStorage.getItem('challenges');

            const challengesData = await Promise.race([loadPromise, timeoutPromise]) as string | null;

            if (challengesData) {
                const challenges = JSON.parse(challengesData);
                const challenge = challenges.find((c: any) => c.id === id);
                if (challenge) {
                    // Set original values
                    setOriginalTitle(challenge.title);
                    setOriginalIcon(challenge.icon);
                    setOriginalRepeat(challenge.repeat);
                    setOriginalStartDate(new Date(challenge.startDate));
                    setOriginalEndDate(new Date(challenge.endDate));
                    setOriginalReminder(challenge.reminder);

                    // Set current editing values
                    setTitle(challenge.title);
                    setSelectedIcon(challenge.icon);
                    setRepeat(challenge.repeat);
                    setStartDate(new Date(challenge.startDate));
                    setEndDate(new Date(challenge.endDate));
                    setReminder(challenge.reminder);
                }
            }
        } catch (error) {
            console.error('Error loading challenge:', error);
        }
    };

    const resetToOriginalValues = () => {
        setTitle(originalTitle);
        setSelectedIcon(originalIcon);
        setRepeat(originalRepeat);
        setStartDate(originalStartDate);
        setEndDate(originalEndDate);
        setReminder(originalReminder);
    };

    const isInFuture = (d: Date) => d.getTime() > Date.now();

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const parseReminderTime = () => {
        let [time, ampm] = reminder.split(" ");
        let [h, m] = time.split(":").map(Number);

        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;

        const result = new Date(startDate);
        result.setHours(h);
        result.setMinutes(m);
        result.setSeconds(0);
        result.setMilliseconds(0);

        return result;
    };

    // ⭐ FIX 3: Optimized handleSave
    const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Error", "Enter a challenge title");
        if (endDate < startDate) return Alert.alert("Error", "End date cannot be before start date");

        // Prevent double-tap
        if (isSaving) return;

        const reminderDateTime = parseReminderTime();
        const now = new Date();
        const timeDiff = (reminderDateTime.getTime() - now.getTime()) / 1000;

        console.log('🔔 Reminder DateTime:', reminderDateTime.toISOString());
        console.log('🕐 Current Time:', now.toISOString());
        console.log('⏱️ Time Difference (seconds):', timeDiff);

        if (repeat === 'never' && timeDiff < 5) {
            Alert.alert(
                'Invalid Time ⚠️',
                'Reminder time must be at least 5 seconds in the future.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsSaving(true);

        // ⭐ Navigate back immediately
        router.back();

        // ⭐ Save in background
        InteractionManager.runAfterInteractions(async () => {
            try {
                await performSave(reminderDateTime);
            } catch (error) {
                console.error('Background save error:', error);
            } finally {
                setIsSaving(false);
            }
        });
    };

    // ⭐ FIX 4: Separate save logic with optimizations
    const performSave = async (reminderDateTime: Date) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save timeout')), 3000)
            );
            const loadPromise = AsyncStorage.getItem('challenges');

            const data = await Promise.race([loadPromise, timeoutPromise]) as string | null;
            let challenges = data ? JSON.parse(data) : [];
            let challengeId = isEditMode ? String(params.id) : Date.now().toString();

            // ⭐ Fire and forget old notification cleanup
            if (isEditMode) {
                AsyncStorage.getItem(`challenge_${challengeId}_notification`)
                    .then(prevId => {
                        if (prevId) {
                            NotificationService.cancelNotification(prevId).catch(console.error);
                            AsyncStorage.removeItem(`challenge_${challengeId}_notification`).catch(console.error);
                            console.log('🗑️ Old challenge notification cancelled');
                        }
                    })
                    .catch(console.error);
            }

            if (isEditMode) {
                challenges = challenges.map((c: any) =>
                    c.id === challengeId
                        ? {
                            ...c,
                            title,
                            icon: selectedIcon,
                            repeat,
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString(),
                            reminder,
                        }
                        : c
                );
                console.log('✏️ Challenge updated');

                // Update original values
                setOriginalTitle(title);
                setOriginalIcon(selectedIcon);
                setOriginalRepeat(repeat);
                setOriginalStartDate(startDate);
                setOriginalEndDate(endDate);
                setOriginalReminder(reminder);
            } else {
                challenges.push({
                    id: challengeId,
                    title,
                    icon: selectedIcon,
                    repeat,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    reminder,
                    completed: false,
                });
                console.log('➕ New challenge created');
            }

            console.log('=== Scheduling Challenge Notification ===');
            console.log('Challenge ID:', challengeId);
            console.log('Title:', title);
            console.log('Repeat Type:', repeat);
            console.log('Reminder Time:', reminderDateTime.toISOString());

            // ⭐ Fire and forget notification scheduling
            NotificationService.scheduleChallengeNotification(
                challengeId,
                title,
                `Challenge Reminder: ${title}`,
                reminderDateTime,
                repeat
            ).then(newNotiId => {
                if (newNotiId) {
                    AsyncStorage.setItem(
                        `challenge_${challengeId}_notification`,
                        newNotiId
                    ).catch(console.error);
                    console.log('Challenge notification scheduled successfully!');
                    console.log('Notification ID:', newNotiId);
                } else {
                    console.error('Failed to schedule challenge notification');
                }
            }).catch(console.error);

            // ⭐ Save with timeout
            const dataToSave = JSON.stringify(challenges);
            const savePromise = AsyncStorage.setItem('challenges', dataToSave);
            const saveTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save timeout')), 3000)
            );

            await Promise.race([savePromise, saveTimeout]);
            console.log('Challenge data saved');

        } catch (err) {
            console.error('Error saving challenge:', err);
            throw err;
        }
    };

    const handleStartDateConfirm = () => {
        setStartDate(tempDate);
        if (endDate < tempDate) {
            setEndDate(tempDate);
        }
        setShowStartDatePicker(false);
    };

    const handleEndDateConfirm = () => {
        if (tempDate < startDate) {
            Alert.alert('Invalid Date', 'End date cannot be before start date');
            return;
        }
        setEndDate(tempDate);
        setShowEndDatePicker(false);
    };

    const handleTimeConfirm = () => {
        setReminder(formatTime(tempTime));
        setShowTimePicker(false);
    };

    const getRepeatLabel = () => {
        const found = repeatOptions.find(o => o.key === repeat);
        return found ? found.label : repeat;
    };

    const handleBackPress = async () => {
        try {
            if (isEditMode) {
                resetToOriginalValues();
            }

            if (from === "challenge/new") {
                router.replace("/challenge/create");
            } else {
                router.replace("/challenge/create");
            }
        } catch (error) {
            console.error("Error on back:", error);
            if (from === "challenge/new") {
                router.replace("/challenge/create");
            } else {
                router.replace("/challenge/create");
            }
        }
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
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                            {isEditMode ? t("edit_challenge") : t("new_challenge")}
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
                                {isEditMode ? t('updated') : t('save')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.titleSection}>
                        <TextInput
                            style={[styles.titleInput, { color: colors.textPrimary }]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Challenge title"
                            placeholderTextColor="#888"
                        />
                        <View style={styles.statusIndicator} />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            {t("choose_icon")}
                        </Text>
                        <View style={[styles.iconGrid, { backgroundColor: colors.background }]}>
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

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            {t("repeat")}
                        </Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                            onPress={() => setShowRepeatModal(true)}
                        >
                            <Feather name="repeat" size={20} color="#888" />
                            <Text style={[styles.inputText, { color: colors.textPrimary }]}>
                                {getRepeatLabel()}
                            </Text>
                            <Feather name="chevron-right" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfSection}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>
                                {t("start_date")}
                            </Text>
                            <TouchableOpacity
                                style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                                onPress={() => {
                                    setTempDate(startDate);
                                    setShowStartDatePicker(true);
                                }}
                            >
                                <Feather name="calendar" size={20} color="#888" />
                                <Text style={[styles.inputText, { color: colors.textPrimary }]}>
                                    {formatDate(startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.halfSection}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>
                                {t("end_date")}
                            </Text>
                            <TouchableOpacity
                                style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                                onPress={() => {
                                    setTempDate(endDate);
                                    setShowEndDatePicker(true);
                                }}
                            >
                                <Feather name="calendar" size={20} color="#888" />
                                <Text style={[styles.inputText, { color: colors.textPrimary }]}>
                                    {formatDate(endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            {t("reminder")}
                        </Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                            onPress={() => {
                                const now = new Date();
                                const [hours, minutes] = reminder.split(':');
                                now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                setTempTime(now);
                                setShowTimePicker(true);
                            }}
                        >
                            <Feather name="bell" size={20} color="#888" />
                            <Text style={[styles.inputText, { color: colors.textPrimary }]}>
                                {reminder}
                            </Text>
                            <Feather name="chevron-right" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {bannerConfig?.show && (
                        <View style={styles.stickyAdContainer}>
                            <GAMBannerAd
                                unitId={bannerConfig.id}
                                sizes={[BannerAdSize.BANNER]}
                                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                            />
                        </View>
                    )}
                </ScrollView>

                {/* All Modals remain the same - just the save logic changed */}
                <Modal
                    visible={showRepeatModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowRepeatModal(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalOverlay]}
                        activeOpacity={1}
                        onPress={() => setShowRepeatModal(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {t("repeat")}
                            </Text>
                            {repeatOptions.map((item) => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={[
                                        styles.modalOption,
                                        repeat === item.key && {
                                            backgroundColor: colors.border,
                                            borderRadius: 8,
                                            paddingHorizontal: 12,
                                        },
                                    ]}
                                    onPress={() => {
                                        setRepeat(item.key);
                                        setShowRepeatModal(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalOptionText,
                                            { color: colors.textPrimary },
                                            repeat === item.key && styles.modalOptionTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {repeat === item.key && (
                                        <Feather name="check" size={20} color="#FF5252" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Start Date Picker Modal */}
                <Modal
                    visible={showStartDatePicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowStartDatePicker(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalOverlay]}
                        activeOpacity={1}
                        onPress={() => setShowStartDatePicker(false)}
                    >
                        <View style={[styles.datePickerModal, { backgroundColor: colors.background }]}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t("select_start_date")}</Text>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTempDate(selectedDate);
                                    }
                                }}
                                minimumDate={new Date()}
                                textColor={colors.textPrimary}
                                style={[styles.datePicker]}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setShowStartDatePicker(false)}
                                >
                                    <Text style={styles.modalButtonText}>{t("cancel")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={handleStartDateConfirm}
                                >
                                    <Text style={styles.modalButtonTextPrimary}>{t("ok")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* End Date Picker Modal */}
                <Modal
                    visible={showEndDatePicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowEndDatePicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowEndDatePicker(false)}
                    >
                        <View style={[styles.datePickerModal, { backgroundColor: colors.background }]}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t("select_end_date")}</Text>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTempDate(selectedDate);
                                    }
                                }}
                                minimumDate={startDate}
                                textColor={colors.textPrimary}
                                style={styles.datePicker}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setShowEndDatePicker(false)}
                                >
                                    <Text style={styles.modalButtonText}>{t("cancel")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={handleEndDateConfirm}
                                >
                                    <Text style={styles.modalButtonTextPrimary}>{t("ok")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Time Picker Modal */}
                <Modal
                    visible={showTimePicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowTimePicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowTimePicker(false)}
                    >
                        <View style={[styles.datePickerModal, { backgroundColor: colors.background }]}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t("select_reminder_time")}</Text>
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        setTempTime(selectedTime);
                                    }
                                }}
                                style={styles.datePicker}
                                textColor={colors.textPrimary}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setShowTimePicker(false)}
                                >
                                    <Text style={styles.modalButtonText}>{t("cancel")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={handleTimeConfirm}
                                >
                                    <Text style={styles.modalButtonTextPrimary}>{t("ok")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
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
        padding: 16,
    },
    stickyAdContainer: {
        // position: 'absolute',
        // bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FF5252',
        borderRadius: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    titleSection: {
        marginBottom: 24,
    },
    backButton: {
        padding: 4,
        marginRight: 10,
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    titleInput: {
        fontSize: 16,
        color: '#fff',
        paddingVertical: 8,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIndicator: {
        width: 40,
        borderRadius: 2,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 12,
        fontWeight: '500',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconButtonSelected: {
        borderColor: '#FF5252',
    },
    iconText: {
        fontSize: 28,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    halfSection: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
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
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    modalOptionSelected: {
        backgroundColor: Colors.dark.background,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    modalOptionText: {
        fontSize: 16,
    },
    modalOptionTextSelected: {
        color: '#FF5252',
        fontWeight: '600',
    },
    datePickerModal: {
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    datePicker: {
        width: '100%',
        height: 200,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalButtonPrimary: {
        backgroundColor: '#FF5252',
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
});