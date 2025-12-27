import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { loadData, saveData } from '../utils/storage';

export default function ViewEventScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, theme } = useTheme();
    const { t } = useTranslation();

    const eventData = {
        id: params.eventId as string,
        title: params.title as string,
        description: params.description as string,
        startDate: params.startDate as string,
        endDate: params.endDate as string,
        startTime: params.startTime as string,
        endTime: params.endTime as string,
        allDay: params.allDay === 'true',
        repeat: params.repeat as string,
        reminders: params.reminders ? JSON.parse(params.reminders as string) : [],
        color: params.color as string || '#0267FF',
        isHoliday: params.isHoliday === 'true',
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const getRepeatText = (repeat: string) => {
        const repeatMap: any = {
            'does_not': 'Does not repeat',
            'everyday': 'Everyday',
            'every_week': 'Every week',
            'every_month': 'Every month',
            'every_year': 'Every year',
        };
        return repeatMap[repeat] || repeat;
    };

    const handleEdit = () => {
        router.push({
            pathname: '/editEvent',
            params: {
                eventId: eventData.id,
                title: eventData.title,
                description: eventData.description,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                startTime: eventData.startTime,
                endTime: eventData.endTime,
                allDay: String(eventData.allDay),
                repeat: eventData.repeat,
                reminders: JSON.stringify(eventData.reminders),
                color: eventData.color,
            }
        });
    };

    const handleDelete = async () => {
        Alert.alert(
            t('delete_event_title') || 'Delete Event',
            t('delete_event_message') || 'Are you sure you want to delete this event?',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('delete') || 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const notificationIds = await AsyncStorage.getItem(`event_${eventData.id}_notifications`);
                            if (notificationIds) {
                                await AsyncStorage.removeItem(`event_${eventData.id}_notifications`);
                            }
                            const events = await loadData('events') || [];
                            const updatedEvents = events.filter((e: any) => e.id !== eventData.id);
                            await saveData('events', updatedEvents);

                            Alert.alert(
                                t('success') || 'Success',
                                t('event_deleted') || 'Event deleted successfully',
                                [{ text: t('ok') || 'OK', onPress: () => router.back() }]
                            );
                        } catch (error) {
                            console.error('Error deleting event:', error);
                            Alert.alert(t('error') || 'Error', t('delete_failed') || 'Failed to delete event');
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const message = `📅 ${eventData.title}
${eventData.description ? `📝 ${eventData.description}\n` : ''}
📆 ${formatDate(eventData.startDate)}${eventData.startDate !== eventData.endDate ? ` - ${formatDate(eventData.endDate)}` : ''}
${eventData.allDay ? '🕐 All Day' : `🕐 ${eventData.startTime} - ${eventData.endTime}`}
🔁 ${getRepeatText(eventData.repeat)}`;
            await Share.share({
                message: message,
                title: eventData.title,
            });
        } catch (error) {
            console.error('Error sharing event:', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {t("event_details") || "Event details"}
                </Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleShare}
                        style={styles.iconButton}
                    >
                        <Feather name="share-2" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>

                    {!eventData.isHoliday && (
                        <>
                            <TouchableOpacity
                                onPress={handleEdit}
                                style={styles.iconButton}
                            >
                                <Feather name="edit" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDelete}
                                style={styles.iconButton}
                            >
                                <Feather name="trash-2" size={22} color="#FF5252" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <ScrollView style={styles.content}>
                {/* Title */}
                <View style={[styles.section, { borderLeftColor: eventData.color }]}>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                        {eventData.title}
                    </Text>
                </View>

                {/* Date & Time */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.cardRow}>
                        <Feather name="clock" size={20} color={colors.textSecondary} />
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                                {eventData.allDay ? t("all_day") : `${eventData.startTime} - ${eventData.endTime}`}
                            </Text>
                            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                                {formatDate(eventData.startDate)}
                                {eventData.startDate !== eventData.endDate && ` - ${formatDate(eventData.endDate)}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Reminder */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.cardRow}>
                        <Feather name="bell" size={20} color={colors.textSecondary} />
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                                {t("alert") || "Alert"}
                            </Text>
                            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                                {eventData.reminders.map((r: string) => t(r)).join(', ')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Repeat */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.cardRow}>
                        <Feather name="repeat" size={20} color={colors.textSecondary} />
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                                {t("repeat") || "Repeat"}
                            </Text>
                            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                                {getRepeatText(eventData.repeat) === 'Everyday'
                                    ? t("everyday") || "This event will repeat Everyday forever"
                                    : getRepeatText(eventData.repeat) === 'Every week'
                                        ? t("every_week") || "This event will repeat Every week forever"
                                        : getRepeatText(eventData.repeat) === 'Every month'
                                            ? t("every_month") || "This event will repeat Every month forever"
                                            : getRepeatText(eventData.repeat) === 'Every year'
                                                ? t("every_year") || "This event will repeat Every year forever"
                                                : t(eventData.repeat) || getRepeatText(eventData.repeat)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Note */}
                {eventData.description && (
                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.cardRow}>
                            <Feather name="file-text" size={20} color={colors.textSecondary} />
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                                    {t("note") || "Note"}
                                </Text>
                                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                                    {eventData.description}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50,
    },
    backButton: {
        // padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginLeft: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 20,
        borderLeftWidth: 4,
        paddingLeft: 16,
    },
    eventTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        lineHeight: 22,
    },
});