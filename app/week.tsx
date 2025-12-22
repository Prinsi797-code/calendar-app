import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Animated, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { loadData } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HOUR_HEIGHT = 80;
const DAY_HEADER_HEIGHT = 80;
const TIME_COLUMN_WIDTH = 60;
const SWIPE_THRESHOLD = 50;

const COUNTRY_CALENDAR_IDS: Record<string, string> = {
    'Afghanistan': 'en.afghan#holiday@group.v.calendar.google.com',
    'Albania': 'en.albanian#holiday@group.v.calendar.google.com',
    'Algeria': 'en.algerian#holiday@group.v.calendar.google.com',
    'India': 'en.indian#holiday@group.v.calendar.google.com',
};

const TIME_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];

export default function WeekScreen() {
    const navigation = useNavigation();
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
    const { colors, theme } = useTheme();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [selectedCountry, setSelectedCountry] = useState('India');
    const scrollViewRef = useRef<ScrollView>(null);
    const currentTimeLineY = useRef(new Animated.Value(0)).current;
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [popupEvents, setPopupEvents] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

    const formatDate = (date: number) => {
        return date.toString().padStart(2, '0');
    };

    useEffect(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = day - firstDayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - diff);
        weekStart.setHours(0, 0, 0, 0);
        setCurrentWeekStart(weekStart);
        setCurrentYear(weekStart.getFullYear());
    }, [firstDayOfWeek]);

    useEffect(() => {
        setCurrentYear(currentWeekStart.getFullYear());
    }, [currentWeekStart]);

    useEffect(() => {
        const updateTimeLine = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            const orderIndex = TIME_ORDER.indexOf(hours);
            const totalMinutes = (orderIndex * 60) + minutes;
            const yPosition = (totalMinutes / 60) * HOUR_HEIGHT;
            currentTimeLineY.setValue(yPosition);
        };

        updateTimeLine();
        const interval = setInterval(updateTimeLine, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            const now = new Date();
            const hours = now.getHours();
            const orderIndex = TIME_ORDER.indexOf(hours);
            const scrollY = Math.max(0, (orderIndex - 2) * HOUR_HEIGHT);
            scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
        }, 100);
    }, [currentWeekStart]);

    useFocusEffect(
        React.useCallback(() => {
            loadEvents();
            loadFirstDay();
            loadSelectedCountry();
        }, [])
    );

    const loadEvents = async () => {
        const data = await loadData('events');
        if (data) setEvents(data);
    };

    const loadFirstDay = async () => {
        try {
            const day = await AsyncStorage.getItem('firstDayOfWeek');
            if (day) {
                setFirstDayOfWeek(parseInt(day));
            }
        } catch (error) {
            console.log('Error loading first day:', error);
        }
    };

    const loadSelectedCountry = async () => {
        try {
            const country = await AsyncStorage.getItem('selectedCountry');
            if (country) {
                setSelectedCountry(country);
                fetchHolidays(country);
            } else {
                fetchHolidays('India');
            }
        } catch (error) {
            console.log('Error loading country:', error);
            fetchHolidays('India');
        }
    };

    const fetchHolidays = async (countryName: string) => {
        try {
            const calendarId = COUNTRY_CALENDAR_IDS[countryName];
            if (!calendarId) {
                setHolidays([]);
                return;
            }

            const encodedCalendarId = encodeURIComponent(calendarId);
            const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?key=${API_KEY}&timeMin=2024-01-01T00:00:00Z&timeMax=2030-12-31T23:59:59Z&maxResults=1000`;

            const res = await fetch(API_URL);
            const data = await res.json();

            if (data.items) {
                const formattedHolidays = data.items.map((item: any) => ({
                    date: item.start.date,
                    name: item.summary,
                }));
                setHolidays(formattedHolidays);
            }
        } catch (err) {
            console.log('Error fetching holidays:', err);
            setHolidays([]);
        }
    };

    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const handleSwipe = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;

            if (translationX > SWIPE_THRESHOLD) {
                goToPreviousWeek();
            } else if (translationX < -SWIPE_THRESHOLD) {
                goToNextWeek();
            }
        }
    };

    const goToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);
    };

    const goToToday = () => {
        const today = new Date();
        const day = today.getDay();
        const diff = day - firstDayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - diff);
        weekStart.setHours(0, 0, 0, 0);
        setCurrentWeekStart(weekStart);
    };

    const parseTime = (timeString: string) => {
        if (!timeString) return 0;

        try {
            const [time, period] = timeString.trim().split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (isNaN(hours) || isNaN(minutes)) return 0;

            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            return hours * 60 + minutes;
        } catch (error) {
            console.log('Error parsing time:', timeString, error);
            return 0;
        }
    };

    const getTimeLabel = (hour24: number) => {
        if (hour24 === 0) return '12 AM';
        if (hour24 < 12) return `${hour24} AM`;
        if (hour24 === 12) return '12 PM';
        return `${hour24 - 12} PM`;
    };

    const getEventPosition = (event: any) => {
        if (event.allDay || event.isHoliday) {
            return { top: 0, height: 40 };
        }

        try {
            const startMinutes = parseTime(event.startTime);
            const endMinutes = parseTime(event.endTime);
            
            const startHour = Math.floor(startMinutes / 60);
            const startMinutesInHour = startMinutes % 60;
            const startOrderIndex = TIME_ORDER.indexOf(startHour);
            
            const endHour = Math.floor(endMinutes / 60);
            const endMinutesInHour = endMinutes % 60;
            const endOrderIndex = TIME_ORDER.indexOf(endHour);
            
            const top = (startOrderIndex * 60 + startMinutesInHour) * (HOUR_HEIGHT / 60);
            const bottom = (endOrderIndex * 60 + endMinutesInHour) * (HOUR_HEIGHT / 60);
            const height = Math.max(bottom - top, 30);

            return { top, height };
        } catch (error) {
            console.log('Error calculating event position:', error);
            return { top: 0, height: 40 };
        }
    };

    const shouldShowEventOnDate = (event: any, targetDateString: string) => {
        const eventStart = new Date(event.startDate.split('T')[0]);
        const eventEnd = new Date(event.endDate.split('T')[0]);
        const targetDate = new Date(targetDateString);
        
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        // For non-repeating events
        if (event.repeat === 'Does not repeat' || event.repeat === 'does_not') {
            return targetDate >= eventStart && targetDate <= eventEnd;
        }
        
        // For repeating events - must start on or before target date
        if (targetDate < eventStart) {
            return false;
        }
        
        const diffTime = targetDate.getTime() - eventStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Every day repeat
        if (event.repeat === 'every_day' || event.repeat.toLowerCase().includes('daily')) {
            return true;
        }
        
        // Every week repeat (7 days)
        if (event.repeat === 'every_week' || event.repeat.toLowerCase().includes('week')) {
            return diffDays % 7 === 0;
        }
        
        // Every month repeat (same date)
        if (event.repeat === 'every_month' || event.repeat.toLowerCase().includes('month')) {
            return eventStart.getDate() === targetDate.getDate();
        }
        
        // Every year repeat (same date and month)
        if (event.repeat === 'every_year' || event.repeat.toLowerCase().includes('year')) {
            return eventStart.getDate() === targetDate.getDate() && 
                   eventStart.getMonth() === targetDate.getMonth();
        }
        
        return false;
    };

    const getEventsForDay = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];

        const dayEvents = events.filter((e) => {
            if (!e.startDate || !e.endDate) return false;
            return shouldShowEventOnDate(e, dateString);
        });

        const dayHolidays = holidays
            .filter((h) => h.date === dateString)
            .map((h, index) => ({
                id: `holiday-${h.date}-${index}`,
                title: h.name,
                date: h.date,
                allDay: true,
                isHoliday: true,
                startTime: '12:00 AM',
                endTime: '11:59 PM',
            }));

        return [...dayHolidays, ...dayEvents];
    };

    const groupEventsByTimeSlot = (dayEvents: any[]) => {
        const allDayEvents: any[] = [];
        const timedEvents: any[] = [];

        dayEvents.forEach(event => {
            let eventStart = event.startDate;
            let eventEnd = event.endDate;

            if (eventStart && eventStart.includes('T')) {
                eventStart = eventStart.split('T')[0];
            }
            if (eventEnd && eventEnd.includes('T')) {
                eventEnd = eventEnd.split('T')[0];
            }
            const isMultiDay = eventStart !== eventEnd;
            if (event.allDay || event.isHoliday || isMultiDay) {
                allDayEvents.push(event);
            } else {
                timedEvents.push(event);
            }
        });

        timedEvents.sort((a, b) => {
            const aStart = parseTime(a.startTime);
            const bStart = parseTime(b.startTime);
            return aStart - bStart;
        });

        const groups: any[][] = [];

        timedEvents.forEach(event => {
            const eventStart = parseTime(event.startTime);
            const eventEnd = parseTime(event.endTime);

            let addedToGroup = false;

            for (let group of groups) {
                const hasOverlap = group.some(e => {
                    const eStart = parseTime(e.startTime);
                    const eEnd = parseTime(e.endTime);
                    return (eventStart < eEnd && eventEnd > eStart);
                });

                if (hasOverlap) {
                    group.push(event);
                    addedToGroup = true;
                    break;
                }
            }

            if (!addedToGroup) {
                groups.push([event]);
            }
        });

        return { allDayEvents, groups };
    };

    const handleEditEvent = (event: any) => {
        if (event.isHoliday) {
            router.push({
                pathname: '/holidayDetails',
                params: {
                    title: event.title,
                    date: event.date,
                    alert: event.alert || "All-day",
                }
            });
            return;
        }
        router.push({
            pathname: '/editEvent',
            params: {
                eventId: event.id,
                title: event.title || '',
                description: event.description || '',
                startDate: event.startDate || event.date,
                endDate: event.endDate || event.date,
                startTime: event.startTime || '12:00 PM',
                endTime: event.endTime || '01:00 PM',
                allDay: String(event.allDay || false),
                repeat: event.repeat || 'Does not repeat',
                reminders: JSON.stringify(event.reminders || ['At a time of event']),
            }
        });
    };

    const handleLongPress = (events: any[]) => {
        setPopupEvents(events);
        setShowEventPopup(true);
    };

    const weekDays = getWeekDays();
    const dayWidth = (SCREEN_WIDTH - TIME_COLUMN_WIDTH) / 7;
    const today = new Date().toISOString().split('T')[0];

    const getWeekRange = () => {
        const start = weekDays[0];
        const end = weekDays[6];

        const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

        if (startMonth === endMonth) {
            return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
        } else {
            return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Text style={[styles.menuIcon, { color: colors.textPrimary }]}>☰</Text>
                    </TouchableOpacity>

                    <Text style={[styles.yearText, { color: colors.textPrimary }]}>
                        {currentYear}
                    </Text>

                    <View style={styles.rightIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/search')}
                        >
                            <Feather
                                name="search"
                                size={22}
                                color={theme === 'dark' ? colors.white : colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <View style={[styles.dateBox]}>
                            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                {formatDate(new Date().getDate())}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.weekRangeHeader, { backgroundColor: colors.cardBackground }]}>
                    <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
                        <Feather name="chevron-left" size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goToToday} style={styles.weekRangeButton}>
                        <Text style={[styles.weekRangeText, { color: colors.textPrimary }]}>
                            {getWeekRange()}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
                        <Feather name="chevron-right" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.weekHeader, { backgroundColor: colors.cardBackground }]}>
                    <View style={{ width: TIME_COLUMN_WIDTH }} />
                    {weekDays.map((date, index) => {
                        const dateString = date.toISOString().split('T')[0];
                        const isToday = dateString === today;
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                            <View key={index} style={[styles.dayHeader, { width: dayWidth }]}>
                                <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                                    {dayName}
                                </Text>
                                <View style={[
                                    styles.dateCircle,
                                    isToday && { backgroundColor: colors.primary }
                                ]}>
                                    <Text style={[
                                        styles.dateNumber,
                                        { color: isToday ? '#FFFFFF' : colors.textPrimary }
                                    ]}>
                                        {date.getDate()}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <PanGestureHandler onHandlerStateChange={handleSwipe}>
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.timeGrid}>
                                <View style={styles.timeColumn}>
                                    {TIME_ORDER.map((hour, i) => (
                                        <View key={i} style={[styles.timeSlot, { height: HOUR_HEIGHT }]}>
                                            <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                                                {getTimeLabel(hour)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.daysContainer}>
                                    {weekDays.map((date, dayIndex) => {
                                        const dayEvents = getEventsForDay(date);
                                        const { allDayEvents, groups } = groupEventsByTimeSlot(dayEvents);
                                        const dateString = date.toISOString().split('T')[0];
                                        const isToday = dateString === today;

                                        return (
                                            <View key={dayIndex} style={[styles.dayColumn, { width: dayWidth }]}>
                                                {TIME_ORDER.map((hour, i) => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.hourLine,
                                                            {
                                                                height: HOUR_HEIGHT,
                                                                borderBottomColor: colors.textTertiary + '20',
                                                                borderBottomWidth: 1,
                                                            }
                                                        ]}
                                                    />
                                                ))}

                                                {dayIndex < 6 && (
                                                    <View style={[
                                                        styles.verticalLine,
                                                        { borderRightColor: colors.textTertiary + '30' }
                                                    ]} />
                                                )}

                                                {allDayEvents.map((event, idx) => (
                                                    <TouchableOpacity
                                                        key={`allday-${idx}`}
                                                        style={[
                                                            styles.allDayEventBlock,
                                                            {
                                                                top: idx * 44,
                                                                backgroundColor: (event.isHoliday ? '#FF6B6B' : event.color || colors.primary) + '30',
                                                                borderLeftColor: event.isHoliday ? '#FF6B6B' : event.color || colors.primary,
                                                                width: dayWidth - 4,
                                                            }
                                                        ]}
                                                        onPress={() => handleEditEvent(event)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text
                                                            style={[styles.eventBlockTitle, { color: colors.textPrimary }]}
                                                            numberOfLines={1}
                                                        >
                                                            {event.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}

                                                {groups.map((group, groupIdx) => {
                                                    const visibleCount = Math.min(2, group.length);
                                                    const hasMore = group.length > 2;

                                                    return (
                                                        <View key={`group-${groupIdx}`}>
                                                            {group.slice(0, 2).map((event, eventIdx) => {
                                                                const { top, height } = getEventPosition(event);
                                                                const columnWidth = visibleCount === 1 ? dayWidth - 4 : (dayWidth - 4) / 2;
                                                                const leftOffset = eventIdx * columnWidth;

                                                                return (
                                                                    <TouchableOpacity
                                                                        key={`event-${event.id}-${eventIdx}`}
                                                                        style={[
                                                                            styles.eventBlock,
                                                                            {
                                                                                top,
                                                                                height,
                                                                                left: leftOffset + 2,
                                                                                width: columnWidth - 4,
                                                                                backgroundColor: (event.color || colors.primary) + '30',
                                                                                borderLeftColor: event.color || colors.primary,
                                                                            }
                                                                        ]}
                                                                        onPress={() => handleEditEvent(event)}
                                                                        onLongPress={() => handleLongPress(group)}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <Text
                                                                            style={[styles.eventBlockTitle, { color: colors.textPrimary }]}
                                                                            numberOfLines={1}
                                                                        >
                                                                            {event.title}
                                                                        </Text>
                                                                        <Text
                                                                            style={[styles.eventBlockTime, { color: colors.textSecondary }]}
                                                                            numberOfLines={1}
                                                                        >
                                                                            {event.startTime}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}

                                                            {hasMore && (
                                                                <TouchableOpacity
                                                                    style={[
                                                                        styles.moreEventsIndicator,
                                                                        {
                                                                            top: getEventPosition(group[1]).top + getEventPosition(group[1]).height + 4,
                                                                            right: 4,
                                                                            backgroundColor: colors.primary,
                                                                        }
                                                                    ]}
                                                                    onPress={() => handleLongPress(group)}
                                                                    activeOpacity={0.7}
                                                                >
                                                                    <Text style={styles.moreEventsText}>+{group.length - 2}</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}

                                                {isToday && (
                                                    <Animated.View
                                                        style={[
                                                            styles.currentTimeLine,
                                                            {
                                                                top: currentTimeLineY,
                                                                backgroundColor: '#FF5252',
                                                            }
                                                        ]}
                                                    >
                                                        <View style={styles.currentTimeDot} />
                                                    </Animated.View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </PanGestureHandler>

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/addEvent")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>

                <Modal
                    visible={showEventPopup}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowEventPopup(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowEventPopup(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                    Events
                                </Text>
                                <TouchableOpacity onPress={() => setShowEventPopup(false)}>
                                    <Feather name="x" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={popupEvents}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.popupEventItem, { borderLeftColor: item.isHoliday ? '#FF6B6B' : item.color || colors.primary }]}
                                        onPress={() => {
                                            setShowEventPopup(false);
                                            handleEditEvent(item);
                                        }}
                                    >
                                        <Text style={[styles.popupEventTitle, { color: colors.textPrimary }]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.popupEventTime, { color: colors.textSecondary }]}>
                                            {item.allDay ? t('all_day') : `${item.startTime} - ${item.endTime}`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </GestureHandlerRootView>
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
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    menuButton: {
        padding: 8,
    },
    menuIcon: {
        fontSize: 24,
        fontWeight: '600',
    },
    yearText: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
    },
    dateBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    weekRangeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    navButton: {
        padding: 8,
    },
    weekRangeButton: {
        flex: 1,
        alignItems: 'center',
    },
    weekRangeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    weekHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 8,
    },
    dayHeader: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayName: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateNumber: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    timeGrid: {
        flexDirection: 'row',
    },
    timeColumn: {
        width: TIME_COLUMN_WIDTH,
        paddingTop: HOUR_HEIGHT / 2,
    },
    timeSlot: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    daysContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    dayColumn: {
        position: 'relative',
    },
    hourLine: {
        borderBottomWidth: 1,
    },
    verticalLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        borderRightWidth: 1,
    },
    eventBlock: {
        position: 'absolute',
        borderLeftWidth: 3,
        borderRadius: 4,
        padding: 4,
        overflow: 'hidden',
    },
    allDayEventBlock: {
        position: 'absolute',
        left: 2,
        height: 40,
        borderLeftWidth: 3,
        borderRadius: 4,
        padding: 4,
        overflow: 'hidden',
    },
    eventBlockTitle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    eventBlockTime: {
        fontSize: 9,
    },
    moreEventsIndicator: {
        position: 'absolute',
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreEventsText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    currentTimeLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentTimeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        marginLeft: -4,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: SCREEN_WIDTH * 0.85,
        maxHeight: 400,
        borderRadius: 12,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    popupEventItem: {
        paddingVertical: 12,
        paddingLeft: 12,
        borderLeftWidth: 4,
        marginBottom: 8,
        borderRadius: 4,
    },
    popupEventTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    popupEventTime: {
        fontSize: 12,
    },
});