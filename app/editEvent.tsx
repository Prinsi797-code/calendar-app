import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../contexts/ThemeContext';
import { loadData, saveData } from '../utils/storage';

export default function EditEventScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, theme } = useTheme();

    // Parse time string "10:30 AM" to Date object
    const parseTimeString = (timeStr: string): Date => {
        const date = new Date();
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const [showStartDateModal, setShowStartDateModal] = useState(false);
    const [showEndDateModal, setShowEndDateModal] = useState(false);
    const [showStartTimeModal, setShowStartTimeModal] = useState(false);
    const [showEndTimeModal, setShowEndTimeModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);

    const [formData, setFormData] = useState({
        title: params.title as string || '',
        description: params.description as string || '',
        startDate: new Date(params.startDate as string),
        endDate: new Date(params.endDate as string),
        startTime: parseTimeString(params.startTime as string),
        endTime: parseTimeString(params.endTime as string),
        allDay: params.allDay === 'true',
        repeat: params.repeat as string || 'Does not repeat',
        reminders: params.reminders ? JSON.parse(params.reminders as string) : ['At a time of event'],
    });

    const [tempReminders, setTempReminders] = useState(formData.reminders);

    const reminderOptions = [
        'At a time of event',
        '5 minutes before',
        '10 minutes before',
        '15 minutes before',
        '30 minutes before',
        '1 hour before',
        '1 day before',
        'Custom'
    ];

    useEffect(() => {
        if (params.repeatValue) {
            console.log("✅ Received repeat value:", params.repeatValue);
            setFormData(prev => ({
                ...prev,
                repeat: params.repeatValue as string
            }));
        }
    }, [params.repeatValue]);

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    };

    const [selectedStartDay, setSelectedStartDay] = useState(
        formData.startDate.toISOString().split("T")[0]
    );

    const [selectedEndDay, setSelectedEndDay] = useState(
        formData.endDate.toISOString().split("T")[0]
    );

    const formatTime = (date: Date) => {
        const d = new Date(date);
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    };

    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleOpenReminderModal = () => {
        setTempReminders([...formData.reminders]);
        setShowReminderModal(true);
    };

    const handleToggleReminder = (option: string) => {
        if (tempReminders.includes(option)) {
            if (tempReminders.length > 1) {
                setTempReminders(tempReminders.filter(r => r !== option));
            }
        } else {
            setTempReminders([...tempReminders, option]);
        }
    };

    const handleReminderCancel = () => {
        setTempReminders([...formData.reminders]);
        setShowReminderModal(false);
    };

    const handleReminderOk = () => {
        setFormData({ ...formData, reminders: [...tempReminders] });
        setShowReminderModal(false);
    };

    const handleRemoveReminder = (reminder: string) => {
        if (formData.reminders.length > 1) {
            setFormData({
                ...formData,
                reminders: formData.reminders.filter(r => r !== reminder)
            });
        }
    };

    const updateEvent = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        const updatedEvent = {
            id: params.eventId as string,
            title: formData.title,
            description: formData.description,
            date: formData.startDate.toISOString().split('T')[0],
            startDate: formData.startDate.toISOString().split('T')[0],
            endDate: formData.endDate.toISOString().split('T')[0],
            startTime: formatTime(formData.startTime),
            endTime: formatTime(formData.endTime),
            allDay: formData.allDay,
            repeat: formData.repeat,
            reminders: formData.reminders,
        };
        console.log("📌 Updated Event:", updatedEvent);

        try {
            const events = await loadData('events') || [];
            const updatedEvents = events.map((event: any) =>
                event.id === params.eventId ? updatedEvent : event
            );
            await saveData('events', updatedEvents);

            Alert.alert('Success', 'Event updated!', [
                {
                    text: 'OK',
                    onPress: () => {
                        router.replace('/(tabs)');
                    }
                }
            ]);
        } catch (error) {
            console.error('Error updating event:', error);
            Alert.alert('Error', 'Failed to update event');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* HEADER */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.headerButton, { color: colors.textPrimary }]}>✕</Text>
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Event</Text>

                <TouchableOpacity onPress={updateEvent}>
                    <Text style={[styles.headerButton, styles.saveButton, { color: '#FF5252' }]}>UPDATE</Text>
                </TouchableOpacity>
            </View>

            {/* FORM */}
            <ScrollView style={styles.formScroll}>

                {/* Title */}
                <TextInput
                    placeholder="Add Title"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { color: colors.textPrimary, borderBottomColor: colors.border }]}
                    value={formData.title}
                    onChangeText={t => setFormData({ ...formData, title: t })}
                />

                {/* All-day Toggle */}
                <View style={[styles.row, { backgroundColor: colors.cardBackground, borderRadius: 10, paddingLeft: 10, paddingRight: 10 }]}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>All-day</Text>
                    <Switch
                        value={formData.allDay}
                        onValueChange={v => setFormData({ ...formData, allDay: v })}
                        trackColor={{ false: colors.border, true: '#FF5252' }}
                        thumbColor={formData.allDay ? '#FFFFFF' : '#f4f3f4'}
                    />
                </View>

                {/* Date Row */}
                <View style={styles.dateRow}>
                    <View style={styles.dateColumn}>
                        <Text style={[styles.dateLabel, { color: colors.textPrimary, marginTop: 15 }]}>Start Date</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { backgroundColor: colors.cardBackground }]}
                            onPress={() => setShowStartDateModal(true)}
                        >
                            <Feather
                                name="calendar"
                                size={20}
                                color={theme === 'dark' ? colors.white : colors.textPrimary}
                            />
                            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                {formatDate(formData.startDate).split(', ')[1]}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dateColumn}>
                        <Text style={[styles.dateLabel, { color: colors.textPrimary, marginTop: 15 }]}>End date</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, { backgroundColor: colors.cardBackground }]}
                            onPress={() => setShowEndDateModal(true)}
                        >
                            <Feather
                                name="calendar"
                                size={20}
                                color={theme === 'dark' ? colors.white : colors.textPrimary}
                            />
                            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                {formatDate(formData.endDate).split(', ')[1]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Time Row - Only show if NOT all-day */}
                {!formData.allDay && (
                    <View style={styles.dateRow}>
                        <View style={styles.dateColumn}>
                            <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>Start Time</Text>
                            <TouchableOpacity
                                style={[styles.dateButton, { backgroundColor: colors.cardBackground }]}
                                onPress={() => setShowStartTimeModal(true)}
                            >
                                <Feather
                                    name="clock"
                                    size={20}
                                    color={theme === 'dark' ? colors.white : colors.textPrimary}
                                />
                                <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                    {formatTime(formData.startTime)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateColumn}>
                            <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>End Time</Text>
                            <TouchableOpacity
                                style={[styles.dateButton, { backgroundColor: colors.cardBackground }]}
                                onPress={() => setShowEndTimeModal(true)}
                            >
                                <Feather
                                    name="clock"
                                    size={20}
                                    color={theme === 'dark' ? colors.white : colors.textPrimary}
                                />
                                <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                    {formatTime(formData.endTime)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Repeat */}
                <View style={styles.dateColumn}>
                    <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>Repeat</Text>
                    <TouchableOpacity
                        onPress={() => {
                            router.push({
                                pathname: "/repeat",
                                params: {
                                    selectedRepeat: formData.repeat,
                                },
                            });
                        }}
                        style={[
                            {
                                borderBottomColor: colors.border,
                                backgroundColor: colors.cardBackground,
                                paddingLeft: 15,
                                paddingRight: 15,
                                paddingTop: 15,
                                paddingBottom: 15,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                            },
                        ]}
                    >
                        <Feather name="repeat" size={20} color={colors.textPrimary} />
                        <Text style={[styles.repeatIcon, { color: colors.textPrimary }]}>
                            {formData.repeat}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Reminder */}
                <View style={styles.dateColumn}>
                    <Text style={[styles.dateLabel, { color: colors.textPrimary, paddingTop: 20 }]}>Reminder</Text>
                    <TouchableOpacity
                        onPress={handleOpenReminderModal}
                        style={[
                            {
                                backgroundColor: colors.cardBackground,
                                paddingLeft: 15,
                                paddingRight: 15,
                                paddingTop: 15,
                                paddingBottom: 15,
                                borderRadius: 10,
                            },
                        ]}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                            <Feather
                                name="bell"
                                size={20}
                                color={colors.textPrimary}
                                style={{ marginTop: 2 }}
                            />

                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={[styles.repeatIcon, { color: colors.textPrimary }]}>
                                    At a time of event
                                </Text>

                                {formData.reminders.filter(r => r !== 'At a time of event')[0] && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={[styles.repeatIcon, { color: colors.textPrimary, flex: 1 }]}>
                                            {formData.reminders.filter(r => r !== 'At a time of event')[0]}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveReminder(formData.reminders.filter(r => r !== 'At a time of event')[0])}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Feather name="x" size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Note */}
                <TextInput
                    placeholder="Note"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.noteInput, { color: colors.textPrimary, backgroundColor: colors.cardBackground }]}
                    value={formData.description}
                    onChangeText={d => setFormData({ ...formData, description: d })}
                    multiline
                />

            </ScrollView>

            {/* DATE MODALS */}
            <Modal visible={showStartDateModal} transparent animationType="fade">
                <View style={styles.centeredModalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowStartDateModal(false)}
                    />
                    <View style={[styles.centeredModalBox, { backgroundColor: colors.cardBackground }]}>
                        <Calendar
                            minDate={getTodayString()}
                            markedDates={{
                                [selectedStartDay]: {
                                    selected: true,
                                    selectedColor: "#FF5252",
                                    selectedTextColor: "#FFFFFF"
                                }
                            }}
                            onDayPress={(day) => {
                                setSelectedStartDay(day.dateString);
                                setFormData({ ...formData, startDate: new Date(day.dateString) });
                                if (new Date(day.dateString) > new Date(formData.endDate)) {
                                    setSelectedEndDay(day.dateString);
                                    setFormData({ ...formData, endDate: new Date(day.dateString) });
                                }
                                setShowStartDateModal(false);
                            }}
                            theme={{
                                backgroundColor: colors.cardBackground,
                                calendarBackground: colors.cardBackground,
                                textSectionTitleColor: colors.textPrimary,
                                selectedDayBackgroundColor: '#FF5252',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#FF5252',
                                dayTextColor: colors.textPrimary,
                                textDisabledColor: colors.textSecondary,
                                arrowColor: '#FF5252'
                            }}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showEndDateModal} transparent animationType="fade">
                <View style={styles.centeredModalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowEndDateModal(false)}
                    />
                    <View style={[styles.centeredModalBox, { backgroundColor: colors.cardBackground }]}>
                        <Calendar
                            minDate={formData.startDate.toISOString().split('T')[0]}
                            markedDates={{
                                [selectedEndDay]: {
                                    selected: true,
                                    selectedColor: "#FF5252",
                                    selectedTextColor: "#FFFFFF"
                                }
                            }}
                            onDayPress={(day) => {
                                setSelectedEndDay(day.dateString);
                                setFormData({ ...formData, endDate: new Date(day.dateString) });
                                setShowEndDateModal(false);
                            }}
                            theme={{
                                backgroundColor: colors.cardBackground,
                                calendarBackground: colors.cardBackground,
                                textSectionTitleColor: colors.textPrimary,
                                selectedDayBackgroundColor: '#FF5252',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#FF5252',
                                dayTextColor: colors.textPrimary,
                                textDisabledColor: colors.textSecondary,
                                arrowColor: '#FF5252'
                            }}
                        />
                    </View>
                </View>
            </Modal>

            {/* REMINDER MODAL */}
            <Modal visible={showReminderModal} transparent animationType="fade">
                <View style={styles.centeredModalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={handleReminderCancel}
                    />
                    <View style={[styles.reminderModalBox, { backgroundColor: colors.cardBackground }]}>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {reminderOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleToggleReminder(option)}
                                    style={styles.reminderOption}
                                >
                                    <View style={styles.radioButton}>
                                        {tempReminders.includes(option) && (
                                            <View style={styles.radioButtonSelected} />
                                        )}
                                    </View>
                                    <Text style={[styles.reminderOptionText, { color: colors.textPrimary }]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.reminderModalActions}>
                            <TouchableOpacity onPress={handleReminderCancel} style={styles.reminderModalBtn}>
                                <Text style={[styles.reminderModalBtnText, { color: colors.textSecondary }]}>
                                    CANCEL
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleReminderOk} style={styles.reminderModalBtn}>
                                <Text style={[styles.reminderModalBtnText, { color: '#FF5252' }]}>
                                    OK
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* TIME PICKER MODALS - iOS STYLE */}
            <IOSTimePicker
                visible={showStartTimeModal}
                time={formData.startTime}
                onClose={() => setShowStartTimeModal(false)}
                onConfirm={(time) => {
                    setFormData({ ...formData, startTime: time });
                    setShowStartTimeModal(false);
                }}
                colors={colors}
            />

            <IOSTimePicker
                visible={showEndTimeModal}
                time={formData.endTime}
                onClose={() => setShowEndTimeModal(false)}
                onConfirm={(time) => {
                    setFormData({ ...formData, endTime: time });
                    setShowEndTimeModal(false);
                }}
                colors={colors}
            />

        </View>
    );
}

// iOS Style Scrolling Wheel Time Picker
function IOSTimePicker({ visible, time, onClose, onConfirm, colors }: any) {
    const [selectedTime, setSelectedTime] = useState(time);

    const hourScrollRef = useRef<ScrollView>(null);
    const minuteScrollRef = useRef<ScrollView>(null);
    const ampmScrollRef = useRef<ScrollView>(null);

    const ITEM_HEIGHT = 44;

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const ampmOptions = ['AM', 'PM'];

    const getInitialHour = () => {
        const h = selectedTime.getHours();
        return h % 12 || 12;
    };

    const getInitialMinute = () => {
        return selectedTime.getMinutes();
    };

    const getInitialAMPM = () => {
        return selectedTime.getHours() >= 12 ? 1 : 0;
    };

    const [currentHour, setCurrentHour] = useState(getInitialHour());
    const [currentMinute, setCurrentMinute] = useState(getInitialMinute());
    const [currentAMPM, setCurrentAMPM] = useState(getInitialAMPM());

    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                hourScrollRef.current?.scrollTo({ y: (currentHour - 1) * ITEM_HEIGHT, animated: false });
                minuteScrollRef.current?.scrollTo({ y: currentMinute * ITEM_HEIGHT, animated: false });
                ampmScrollRef.current?.scrollTo({ y: currentAMPM * ITEM_HEIGHT, animated: false });
            }, 100);
        }
    }, [visible]);

    const handleHourScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const hour = hours[index];
        if (hour !== undefined) {
            setCurrentHour(hour);
            updateTime(hour, currentMinute, currentAMPM);
        }
    };

    const handleMinuteScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const minute = minutes[index];
        if (minute !== undefined) {
            setCurrentMinute(minute);
            updateTime(currentHour, minute, currentAMPM);
        }
    };

    const handleAMPMScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        if (index >= 0 && index < ampmOptions.length) {
            setCurrentAMPM(index);
            updateTime(currentHour, currentMinute, index);
        }
    };

    const updateTime = (hour: number, minute: number, ampmIndex: number) => {
        const newTime = new Date(selectedTime);
        let hours24 = hour;
        if (ampmIndex === 1) {
            hours24 = hour === 12 ? 12 : hour + 12;
        } else {
            hours24 = hour === 12 ? 0 : hour;
        }
        newTime.setHours(hours24);
        newTime.setMinutes(minute);
        setSelectedTime(newTime);
    };

    const formatDisplayTime = () => {
        const hours = selectedTime.getHours();
        const minutes = selectedTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.timeModalOverlay}>
                <View style={styles.timeModalCenter}>
                    <View style={[styles.timeModalContent, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.timeDisplayHeader}>
                            <Text style={[styles.timeDisplayText, { color: colors.textPrimary }]}>
                                {formatDisplayTime()}
                            </Text>
                        </View>

                        <View style={styles.pickerWrapper}>
                            <View style={[styles.selectionHighlight, { borderColor: colors.border }]} />

                            <View style={styles.pickerRow}>
                                <View style={styles.pickerCol}>
                                    <ScrollView
                                        ref={hourScrollRef}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={handleHourScroll}
                                        contentContainerStyle={styles.scrollContent}
                                    >
                                        {hours.map((hour) => (
                                            <View key={hour} style={styles.pickerOption}>
                                                <Text
                                                    style={[
                                                        styles.pickerOptionText,
                                                        {
                                                            color: currentHour === hour ? colors.textPrimary : colors.textSecondary,
                                                            opacity: currentHour === hour ? 1 : 0.4
                                                        }
                                                    ]}
                                                >
                                                    {hour}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>

                                <Text style={[styles.colonSeparator, { color: colors.textPrimary }]}>:</Text>

                                <View style={styles.pickerCol}>
                                    <ScrollView
                                        ref={minuteScrollRef}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={handleMinuteScroll}
                                        contentContainerStyle={styles.scrollContent}
                                    >
                                        {minutes.map((minute) => (
                                            <View key={minute} style={styles.pickerOption}>
                                                <Text
                                                    style={[
                                                        styles.pickerOptionText,
                                                        {
                                                            color: currentMinute === minute ? colors.textPrimary : colors.textSecondary,
                                                            opacity: currentMinute === minute ? 1 : 0.4
                                                        }
                                                    ]}
                                                >
                                                    {minute < 10 ? `0${minute}` : minute}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.ampmContainer}>
                                    <ScrollView
                                        ref={ampmScrollRef}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={handleAMPMScroll}
                                        contentContainerStyle={styles.scrollContent}
                                    >
                                        {ampmOptions.map((option, index) => (
                                            <View key={option} style={styles.pickerOption}>
                                                <Text
                                                    style={[
                                                        styles.pickerOptionText,
                                                        {
                                                            color: currentAMPM === index ? colors.textPrimary : colors.textSecondary,
                                                            opacity: currentAMPM === index ? 1 : 0.4
                                                        }
                                                    ]}
                                                >
                                                    {option}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>

                        <View style={styles.timeModalActions}>
                            <TouchableOpacity onPress={onClose} style={styles.timeModalBtn}>
                                <Text style={[styles.timeModalBtnText, { color: colors.textSecondary }]}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onConfirm(selectedTime)} style={styles.timeModalBtn}>
                                <Text style={[styles.timeModalBtnText, { color: '#FF5252' }]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Copy ALL styles from addEvent.tsx - Exactly same styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        marginTop: 50,
    },

    reminderModalBox: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    reminderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 12,
    },

    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioButtonSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF5252',
    },

    reminderOptionText: {
        fontSize: 16,
        flex: 1,
    },

    reminderModalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },

    reminderModalBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    reminderModalBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },

    headerButton: {
        fontSize: 20,
        fontWeight: '500',
    },

    saveButton: {
        fontSize: 16,
        fontWeight: '700',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    formScroll: {
        padding: 15,
    },

    input: {
        fontSize: 16,
        paddingVertical: 12,
        marginBottom: 15,
        borderBottomWidth: 1,
    },

    row: {
        paddingVertical: 15,
        // borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    label: {
        fontSize: 16,
    },

    value: {
        fontSize: 16,
        fontWeight: '500',
    },

    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    repeatIcon: {
        fontSize: 16,
    },

    dateRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },

    dateColumn: {
        flex: 1,
    },

    dateLabel: {
        fontSize: 14,
        marginBottom: 8,
    },

    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },

    dateIcon: {
        fontSize: 18,
    },

    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },

    noteInput: {
        fontSize: 16,
        padding: 12,
        marginTop: 10,
        borderRadius: 8,
        minHeight: 100,
        textAlignVertical: 'top',
    },

    centeredModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    centeredModalBox: {
        width: '90%',
        maxWidth: 400,
        padding: 15,
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    // iOS Time Picker Styles
    timeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    timeModalCenter: {
        width: '85%',
        maxWidth: 340,
    },

    timeModalContent: {
        borderRadius: 14,
        overflow: 'hidden',
    },

    timeDisplayHeader: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },

    timeDisplayText: {
        fontSize: 32,
        fontWeight: '300',
        letterSpacing: 1,
    },

    pickerWrapper: {
        height: 220,
        position: 'relative',
        overflow: 'hidden',
    },

    pickerRow: {
        flexDirection: 'row',
        height: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pickerCol: {
        flex: 1,
        height: '100%',
    },

    scrollContent: {
        paddingVertical: 88,
    },

    pickerOption: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    pickerOptionText: {
        fontSize: 22,
    },

    colonSeparator: {
        fontSize: 24,
        fontWeight: '300',
        marginHorizontal: 8,
    },

    ampmContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    selectionHighlight: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: 88,
        height: 44,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        pointerEvents: 'none',
        zIndex: 1,
    },

    timeModalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },

    timeModalBtn: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },

    timeModalBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});