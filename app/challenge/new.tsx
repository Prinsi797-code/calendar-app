import { Colors } from '@/constants/theme';
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
    '💪',
    '🗑️',
    '💣',
    '🎨',
    '☕',
    '🔧',
    '💊',
    '✖️',
    '🏋️',
    '✏️',
    '💉',
    '🏠',
];

const repeatOptions = ['Never', 'Everyday', 'Every Week', 'Every Month'];

export default function NewChallengeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    // Get title and icon from params if available
    const defaultTitle = params.title ? String(params.title) : 'Challenge Yourself Today.';
    const defaultIcon = params.icon ? String(params.icon) : '💪';

    const [title, setTitle] = useState(defaultTitle);
    const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
    const [repeat, setRepeat] = useState('Never');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reminder, setReminder] = useState('04:07 PM');

    // Modal states
    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());
    const { colors, theme } = useTheme();

     useEffect(() => {
        NotificationService.requestPermissions();
    }, []);


    // Load existing challenge data if editing
    useEffect(() => {
        if (isEditMode && params.id) {
            loadChallengeData(params.id as string);
        }
    }, [params.id]);

    // Update title and icon when params change
    useEffect(() => {
        if (params.title) {
            setTitle(String(params.title));
        }
        if (params.icon) {
            setSelectedIcon(String(params.icon));
        }
    }, [params.title, params.icon]);

    const loadChallengeData = async (id: string) => {
        try {
            const challengesData = await AsyncStorage.getItem('challenges');
            if (challengesData) {
                const challenges = JSON.parse(challengesData);
                const challenge = challenges.find((c: any) => c.id === id);
                if (challenge) {
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

    // 🔥 Convert reminder time string → Date
    const parseReminderTime = () => {
        let [time, ampm] = reminder.split(" ");
        let [h, m] = time.split(":").map(Number);

        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;

        const result = new Date(startDate);
        result.setHours(h);
        result.setMinutes(m);
        result.setSeconds(0);

        return result;
    };

    // 🔥 Must be future
    const isInFuture = (d: Date) => d.getTime() > Date.now();

    // 🔥 Schedule notification (daily/weekly/monthly supported)
    const scheduleNotification = async (id: string, title: string) => {
        const dt = parseReminderTime();

        if (!isInFuture(dt)) {
            Alert.alert("Invalid Time", "Reminder time must be in the future.");
            return null;
        }

        return await NotificationService.scheduleChallengeNotification(
            id,
            title,
            `Challenge Reminder: ${title}`,
            dt,
            repeat
        );
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
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

     const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Error", "Enter a challenge title");
        if (endDate < startDate) return Alert.alert("Error", "End date cannot be before start date");

        try {
            let data = await AsyncStorage.getItem('challenges');
            let challenges = data ? JSON.parse(data) : [];

            let challengeId = isEditMode ? String(params.id) : Date.now().toString();

            // 🔥 cancel old notification if editing
            if (isEditMode) {
                const prevId = await AsyncStorage.getItem(`challenge_${challengeId}_notification`);
                if (prevId) {
                    await NotificationService.cancelNotification(prevId);
                    await AsyncStorage.removeItem(`challenge_${challengeId}_notification`);
                }
            }

            // ✏️ Update or Add
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
            }

            // 🔔 Create new notification
            if (repeat !== "Never") {
                const newNotiId = await scheduleNotification(challengeId, title);

                if (newNotiId) {
                    await AsyncStorage.setItem(
                        `challenge_${challengeId}_notification`,
                        newNotiId
                    );
                }
            }

            await AsyncStorage.setItem('challenges', JSON.stringify(challenges));
            router.back();
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to save challenge");
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} style={[{ color: colors.textPrimary  }]}/>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary  }]}>
                    {isEditMode ? 'Edit Challenge' : 'New Challenge'}
                </Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>SAVE</Text>
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
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Choose icon</Text>
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
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Repeat</Text>
                    <TouchableOpacity
                        style={[styles.inputContainer, { backgroundColor: colors.cardBackground}]}
                        onPress={() => setShowRepeatModal(true)}
                    >
                        <Feather name="repeat" size={20} color="#888"/>
                        <Text style={[styles.inputText, { color: colors.textPrimary }]}>{repeat}</Text>
                        <Feather name="chevron-right" size={20} color="#888"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfSection}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Start Date</Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                            onPress={() => {
                                setTempDate(startDate);
                                setShowStartDatePicker(true);
                            }}
                        >
                            <Feather name="calendar" size={20} color="#888" />
                            <Text style={[styles.inputText, { color: colors.textPrimary }]}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.halfSection}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>End date</Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                            onPress={() => {
                                setTempDate(endDate);
                                setShowEndDatePicker(true);
                            }}
                        >
                            <Feather name="calendar" size={20} color="#888" />
                            <Text style={[styles.inputText, { color: colors.textPrimary }]}>{formatDate(endDate)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Reminder</Text>
                    <TouchableOpacity
                        style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}
                        onPress={() => {
                            const now = new Date();
                            const [time, period] = reminder.split(' ');
                            const [hours, minutes] = time.split(':');
                            let hour = parseInt(hours);
                            if (period === 'PM' && hour !== 12) hour += 12;
                            if (period === 'AM' && hour === 12) hour = 0;
                            now.setHours(hour, parseInt(minutes), 0, 0);
                            setTempTime(now);
                            setShowTimePicker(true);
                        }}
                    >
                        <Feather name="bell" size={20} color="#888" />
                        <Text style={[styles.inputText, { color: colors.textPrimary }]}>{reminder}</Text>
                        <Feather name="chevron-right" size={20} color="#888" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Repeat Modal */}
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
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Repeat</Text>
                        {repeatOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.modalOption,
                                    repeat === option && {
                                        backgroundColor: colors.border,
                                        borderRadius: 8,
                                        paddingHorizontal: 12,
                                    },
                                ]}
                                onPress={() => {
                                    setRepeat(option);
                                    setShowRepeatModal(false);
                                    
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        repeat === option && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {option}
                                </Text>
                                {repeat === option && (
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
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Start Date</Text>
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
                            textColor= {colors.textPrimary}
                            style={[styles.datePicker]}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowStartDatePicker(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleStartDateConfirm}
                            >
                                <Text style={styles.modalButtonTextPrimary}>OK</Text>
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
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select End Date</Text>
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
                            // textColor="#fff"
                            textColor={colors.textPrimary}
                            style={styles.datePicker}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowEndDatePicker(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleEndDateConfirm}
                            >
                                <Text style={styles.modalButtonTextPrimary}>OK</Text>
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
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Reminder Time</Text>
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
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleTimeConfirm}
                            >
                                <Text style={styles.modalButtonTextPrimary}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        // borderBottomWidth: 1,
        // borderBottomColor: '#1a1a1a',
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
    titleInput: {
        fontSize: 16,
        // fontWeight: 'bold',
        color: '#fff',
        paddingVertical: 8,
    },
    statusIndicator: {
        width: 40,
        // height: ,
        borderRadius: 2,
        // marginTop: 8,
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
        // backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconButtonSelected: {
        borderColor: '#FF5252',
        // backgroundColor: '#2a1a1a',
    },
    iconText: {
        fontSize: 28,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#1a1a1a',
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
        // color: '#fff',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        // borderBottomWidth: 1,
        // borderBottomColor: '#2a2a2a',
    },
    modalOptionSelected: {
        backgroundColor: Colors.dark.background,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    modalOptionText: {
        fontSize: 16,
        // color: '#fff',
    },
    modalOptionTextSelected: {
        color: '#FF5252',
        fontWeight: '600',
    },
    datePickerModal: {
        // backgroundColor: '#1a1a1a',
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