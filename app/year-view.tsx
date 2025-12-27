import AdsManager from "@/services/adsManager";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    BannerAdSize,
    GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function YearView() {
    const router = useRouter();
    const { colors, theme } = useTheme();
    const navigation = useNavigation();
    const { i18n } = useTranslation();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [refreshKey, setRefreshKey] = useState(0);
    const currentYear = new Date().getFullYear();
    const SWIPE_THRESHOLD = 60;
    const [bannerConfig, setBannerConfig] = useState<{
        show: boolean;
        id: string;
        position: string;
    } | null>(null);

    const formatDate = (d) => (d < 10 ? `0${d}` : d);

    const getMonths = (lang) => {
        return Array.from({ length: 12 }, (_, i) =>
            new Date(2024, i, 1).toLocaleString(
                lang === 'hi' ? 'hi-IN' : 'en-US',
                { month: 'long' }
            )
        );
    };

    const months = getMonths(i18n.language);
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const config = AdsManager.getBannerConfig('home');
        setBannerConfig(config);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const shouldReset = params.resetYear === 'true';
            if (shouldReset) {
                console.log('📅 Resetting year view to current year');
                setSelectedYear(new Date().getFullYear());
            }
        }, [params.resetYear])
    );

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const pulseStyle = {
        transform: [
            {
                scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.6],
                }),
            },
        ],
        opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 0],
        }),
    };

    useEffect(() => {
        loadFirstDay();
    }, []);

    const loadFirstDay = async () => {
        try {
            const day = await AsyncStorage.getItem('firstDayOfWeek');
            if (day) {
                const newFirstDay = parseInt(day);
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

    const handleDateBoxPress = () => {
        router.push({
            pathname: '/',
            params: {
                refresh: Date.now().toString(),
                resetToToday: 'true'
            }
        });
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
            const isHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy);
            const hasMovement = Math.abs(gesture.dx) > 10;
            return isHorizontal && hasMovement;
        },

        onPanResponderMove: () => {
        },

        onPanResponderRelease: (_, gesture) => {
            const velocity = gesture.vx;
            const movement = gesture.dx;

            if (movement > SWIPE_THRESHOLD || velocity > 0.4) {
                setSelectedYear(prev => prev - 1);

            } else if (movement < -SWIPE_THRESHOLD || velocity < -0.4) {
                setSelectedYear(prev => prev + 1);
            }
        },
    });

    const getWeekDayHeaders = () => {
        const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
        const baseDate = new Date(2024, 0, 7);
        const shortDays = [];
        const fullDays = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);

            shortDays.push(
                date.toLocaleDateString(locale, { weekday: 'narrow' })
            );
            fullDays.push(
                date.toLocaleDateString(locale, { weekday: 'long' })
            );
        }
        return {
            short: [...shortDays.slice(firstDayOfWeek), ...shortDays.slice(0, firstDayOfWeek)],
            full: [...fullDays.slice(firstDayOfWeek), ...fullDays.slice(0, firstDayOfWeek)],
        };
    };

    const renderMonthCalendar = (monthIndex: number) => {
        const daysInMonth = getDaysInMonth(monthIndex, selectedYear);
        const firstDay = getFirstDayOfMonth(monthIndex, selectedYear);
        const days = [];
        const weekDays = getWeekDayHeaders();
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
                        isToday && { backgroundColor: colors.primary, borderRadius: 50 }
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
                <Text
                    style={[
                        styles.monthName,
                        {
                            color:
                                selectedYear === currentYear && monthIndex === currentMonth
                                    ? '#FF4A4A'
                                    : colors.textPrimary,
                        },
                    ]}
                >
                    {months[monthIndex].slice(0, 3)}
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
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        style={styles.backButton}
                    >
                        <Feather name="menu" size={26} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        {selectedYear}
                    </Text>
                </View>

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
                    <TouchableOpacity
                        style={[styles.dateBox]}
                        onPress={handleDateBoxPress}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                            {formatDate(new Date().getDate())}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View
                style={{ flex: 1 }}
                {...panResponder.panHandlers}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    {months.map((month, index) => renderMonthCalendar(index))}
                </ScrollView>
            </View>

            {/* FAB */}
            <View style={{ position: "absolute", right: 16, bottom: 80 }}>
                <Animated.View
                    style={[
                        styles.pulseRing,
                        pulseStyle,
                        { backgroundColor: colors.primary },
                    ]}
                />
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/addEvent")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>

            {bannerConfig && bannerConfig.show && (
                <View style={styles.stickyAdContainer}>
                    <GAMBannerAd
                        unitId={bannerConfig.id}
                        sizes={[BannerAdSize.FULL_BANNER]}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,
                        }}
                        onAdLoaded={() => console.log("Home Banner Ad Loaded")}
                        onAdFailedToLoad={(error) => console.log("Home Banner Ad Failed:", error)}
                    />
                </View>
            )}
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
        paddingTop: 60,
    },
    backButton: {
        padding: 4,
        marginRight: 10,
    },
    pulseRing: {
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fabText: {
        fontSize: 32,
        color: '#FFFFFF',
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
    stickyAdContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        marginTop: 6,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
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
        marginTop: 5,
    },
    iconButton: {
        padding: 4,
    },
    backIcon: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
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
    monthCard: {
        width: '31%',
        marginBottom: 14,
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
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
    calendar: {
        gap: 2,
    },
    currentMonthCard: {
        // borderColor: '#FF4A4A',
        // borderRadius: 5,
        // borderWidth: 2,
    },
});