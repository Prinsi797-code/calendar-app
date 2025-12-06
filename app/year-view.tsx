import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function YearView() {
    const router = useRouter();
    const { colors, theme } = useTheme();
    const navigation = useNavigation();
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [refreshKey, setRefreshKey] = useState(0);
    const currentYear = new Date().getFullYear();
    const formatDate = (d) => (d < 10 ? `0${d}` : d);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();

    useEffect(() => {
        loadFirstDay();
    }, []);

    // Load first day when screen comes into focus
    useEffect(
        React.useCallback(() => {
            loadFirstDay();
        }, [])
    );

    const loadFirstDay = async () => {
        try {
            const day = await AsyncStorage.getItem('firstDayOfWeek');
            if (day) {
                const newFirstDay = parseInt(day);
                // console.log('📅 Year View - Loading first day:', newFirstDay);
                setFirstDayOfWeek(newFirstDay);
                setRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.log('Error loading first day:', error);
        }
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleYearSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            setSelectedYear(prev => prev + 1);
        } else {
            setSelectedYear(prev => prev - 1);
        }
    };

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            return Math.abs(gestureState.dx) > 50 && Math.abs(gestureState.dy) < 50;
        },
        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dx > 50) {
                handleYearSwipe('right');
            } else if (gestureState.dx < -50) {
                handleYearSwipe('left');
            }
        },
    });

    const getWeekDayHeaders = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Rotate array based on first day of week
        const rotatedDays = [...days.slice(firstDayOfWeek), ...days.slice(0, firstDayOfWeek)];
        const rotatedFullDays = [...fullDays.slice(firstDayOfWeek), ...fullDays.slice(0, firstDayOfWeek)];

        return { short: rotatedDays, full: rotatedFullDays };
    };

    const renderMonthCalendar = (monthIndex: number) => {
        const daysInMonth = getDaysInMonth(monthIndex, selectedYear);
        const firstDay = getFirstDayOfMonth(monthIndex, selectedYear);
        const days = [];
        const weekDays = getWeekDayHeaders();

        // Week day headers - Add unique key with refreshKey
        const headers = weekDays.short.map((day, index) => {
            const originalDayIndex = (index + firstDayOfWeek) % 7;
            const isSunday = originalDayIndex === 0;

            return (
                <View key={`header-${monthIndex}-${index}-${refreshKey}`} style={styles.dayHeader}>
                    <Text style={[
                        styles.dayHeaderText,
                        { color: colors.textSecondary },
                        isSunday && { color: colors.primary }
                    ]}>
                        {day}
                    </Text>
                </View>
            );
        });

        const adjustedFirstDay = (firstDay - firstDayOfWeek + 7) % 7;

        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, monthIndex, day);
            const dayOfWeek = date.getDay();
            const isSunday = dayOfWeek === 0;
            const isToday = selectedYear === currentYear && monthIndex === currentMonth && day === currentDate;

            days.push(
                <View
                    key={day}
                    style={[
                        styles.dayCell,
                        isToday && { backgroundColor: colors.primary, borderRadius: 50, paddingTop: 0 }
                    ]}>
                    <Text
                        style={[
                            styles.dayText,
                            { color: colors.textPrimary },
                            isSunday && { color: colors.primary, fontWeight: '600' },
                            isToday && { color: '#fff', fontWeight: 'bold' }
                        ]}>
                        {day}
                    </Text>
                </View>
            );
        }

        return (
            <View
                key={monthIndex}
                style={[
                    styles.monthCard,
                    { backgroundColor: colors.background },
                    { borderColor: colors.border },
                    selectedYear === currentYear && monthIndex === currentMonth && styles.currentMonthCard
                ]}
            >
                <Text style={[
                    styles.monthName,
                    { color: colors.textPrimary },
                    { backgroundColor: colors.textTertiary },
                    { paddingTop: 5 },
                    { paddingBottom: 5 },
                    selectedYear === currentYear && monthIndex === currentMonth && { color: colors.primary }
                ]}>
                    {months[monthIndex]}
                </Text>
                <View style={styles.calendar}>
                    <View style={styles.weekRow}>{headers}</View>
                    <View style={styles.daysGrid}>{days}</View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Custom Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Text style={[styles.menuIcon, { color: colors.textPrimary }]}>☰</Text>
                </TouchableOpacity>

                <Text style={[styles.yearText, { color: colors.textPrimary }]}>{selectedYear}</Text>

                <View style={styles.rightIcons}>
                    <TouchableOpacity style={styles.iconButton}>
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
            <ScrollView
                contentContainerStyle={styles.content}
                {...panResponder.panHandlers}
            >
                {months.map((month, index) => renderMonthCalendar(index))}
            </ScrollView>
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/addEvent')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
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
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '300',
    },
    menuButton: {
        padding: 8,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    yearText: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginRight: 160,
    },
    dateText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#FF5252',
        borderTopWidth: 5,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
        gap: 6,
    },
    menuIcon: {
        fontSize: 24,
    },
    iconButton: {
        padding: 4,
    },
    backIcon: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 8,
    },
    monthName: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    currentMonthName: {},

    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
        color: "#fff",
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    todayText: {
        fontWeight: 'bold',
    },
    // new onr 
    monthCard: {
        width: '48%',
        marginBottom: 12,
        backgroundColor: '#111',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
    },

    monthHeader: {
        backgroundColor: '#1A1A1A',
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },

    monthHeaderText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },

    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dayText: {
        fontSize: 11,
        color: '#DADADA',
    },

    dayHeaderText: {
        fontSize: 11,
        color: '#858585',
        fontWeight: '600',
    },

    todayCircle: {
        backgroundColor: '#FF4A4A',
        width: 28,
        height: 28,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

});