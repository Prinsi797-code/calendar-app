import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from '../../contexts/ThemeContext';
import { loadData, saveData } from '../../utils/storage';

declare global {
  var firstDayChanged: ((day: number) => void) | undefined;
}

export { };

const COUNTRY_CALENDAR_IDS: Record<string, string> = {
  'Afghanistan': 'en.afghan#holiday@group.v.calendar.google.com',
  'Albania': 'en.albanian#holiday@group.v.calendar.google.com',
  'Algeria': 'en.algerian#holiday@group.v.calendar.google.com',
  'Angola': 'en.angolan#holiday@group.v.calendar.google.com',
  'Andorra': 'en.andorran#holiday@group.v.calendar.google.com',
  'Anguilla': 'en.anguilla#holiday@group.v.calendar.google.com',
  'Argentina': 'en.argentine#holiday@group.v.calendar.google.com',
  'Australia': 'en.australian#holiday@group.v.calendar.google.com',
  'Bahamas': 'en.bahamian#holiday@group.v.calendar.google.com',
  'Bangladesh': 'en.bd#holiday@group.v.calendar.google.com',
  'Barbados': 'en.barbadian#holiday@group.v.calendar.google.com',
  'Belarus': 'en.belarusian#holiday@group.v.calendar.google.com',
  'Belgium': 'en.be#holiday@group.v.calendar.google.com',
  'Belize': 'en.belizean#holiday@group.v.calendar.google.com',
  'Benin': 'en.beninese#holiday@group.v.calendar.google.com',
  'Bermuda': 'en.bermudian#holiday@group.v.calendar.google.com',
  'Bhutan': 'en.bhutanese#holiday@group.v.calendar.google.com',
  'Bolivia': 'en.bolivian#holiday@group.v.calendar.google.com',
  'Botswana': 'en.botswanan#holiday@group.v.calendar.google.com',
  'Brazil': 'en.brazilian#holiday@group.v.calendar.google.com',
  'Bulgaria': 'en.bulgarian#holiday@group.v.calendar.google.com',
  'Burundi': 'en.burundian#holiday@group.v.calendar.google.com',
  'Cambodia': 'en.cambodian#holiday@group.v.calendar.google.com',
  'Cameroon': 'en.cameroonian#holiday@group.v.calendar.google.com',
  'Canada': 'en.canadian#holiday@group.v.calendar.google.com',
  'Cape Verde': 'en.cape_verdean#holiday@group.v.calendar.google.com',
  'Cayman Islands': 'en.cayman_islands#holiday@group.v.calendar.google.com',
  'India': 'en.indian#holiday@group.v.calendar.google.com',
};

export default function CalendarScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
  const { colors, theme } = useTheme();
  const router = useRouter();
  const { setCurrentYear } = useTheme();
  const [showMonthEvents, setShowMonthEvents] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const { t, i18n } = useTranslation();

  const [currentMonth, setCurrentMonth] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

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
    LocaleConfig.locales['custom'] = {
      monthNames: [
        t('January'),
        t('February'),
        t('March'),
        t('April'),
        t('May'),
        t('June'),
        t('July'),
        t('August'),
        t('September'),
        t('October'),
        t('November'),
        t('December')
      ],
      monthNamesShort: [
        t('January').substring(0, 3),
        t('February').substring(0, 3),
        t('March').substring(0, 3),
        t('April').substring(0, 3),
        t('May').substring(0, 3),
        t('June').substring(0, 3),
        t('July').substring(0, 3),
        t('August').substring(0, 3),
        t('September').substring(0, 3),
        t('October').substring(0, 3),
        t('November').substring(0, 3),
        t('December').substring(0, 3)
      ],
      dayNames: [
        t('Sunday'),
        t('Monday'),
        t('Tuesday'),
        t('Wednesday'),
        t('Thursday'),
        t('Friday'),
        t('Saturday')
      ],
      dayNamesShort: [
        t('Sunday').substring(0, 3),
        t('Monday').substring(0, 3),
        t('Tuesday').substring(0, 3),
        t('Wednesday').substring(0, 3),
        t('Thursday').substring(0, 3),
        t('Friday').substring(0, 3),
        t('Saturday').substring(0, 3)
      ],
      today: t('Today')
    };

    LocaleConfig.defaultLocale = 'custom';
    setRefreshKey(prev => prev + 1);
  }, [i18n.language, t]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    // loadFirstDay();
    setShowMonthEvents(true);
    loadSelectedCountry();
  }, []);
  useEffect(() => {
    global.firstDayChanged = (day: number) => {
      setFirstDayOfWeek(day);
      setRefreshKey(prev => prev + 1);
    };

    return () => {
      global.firstDayChanged = undefined;
    };
  }, []);

  const loadSelectedCountry = async () => {
    try {
      const country = await AsyncStorage.getItem('selectedCountry');
      if (country) {
        setSelectedCountry(country);
        fetchHolidays(country);
      } else {
        setSelectedCountry('India');
        fetchHolidays('India');
      }
    } catch (error) {
      console.log('Error loading country:', error);
      fetchHolidays('India');
    }
  };

  const fetchHolidays = async (countryName: string) => {
    setLoadingHolidays(true);
    try {
      const calendarId = COUNTRY_CALENDAR_IDS[countryName];

      if (!calendarId) {
        console.log(`No calendar found for ${countryName}`);
        setHolidays([]);
        setLoadingHolidays(false);
        return;
      }

      const encodedCalendarId = encodeURIComponent(calendarId);
      const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?key=${API_KEY}&timeMin=2024-01-01T00:00:00Z&timeMax=2030-12-31T23:59:59Z&maxResults=1000`;

      const res = await fetch(API_URL);
      const data = await res.json();

      if (data.error) {
        console.log('API Error:', data.error.message);
        setHolidays([]);
        setLoadingHolidays(false);
        return;
      }

      if (data.items) {
        const formattedHolidays = data.items.map((item: any) => ({
          date: item.start.date,
          name: item.summary,
        }));
        setHolidays(formattedHolidays);
      } else {
        setHolidays([]);
      }
    } catch (err) {
      console.log('Error fetching holidays:', err);
      setHolidays([]);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const getRepeatDisplayText = (repeat: string) => {
    switch (repeat) {
      case 'Does not repeat':
        return 'Never';
      case 'Everyday':
        return 'Daily';
      case 'Every week':
        return 'Weekly';
      case 'Every month':
        return 'Monthly';
      case 'Every year':
        return 'Yearly';
      default:
        return 'Never';
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const events = await loadData('events') || [];
              const updatedEvents = events.filter((e: any) => e.id !== eventId);
              await saveData('events', updatedEvents);
              setMenuVisible(null);
              setEvents(updatedEvents);
              console.log('Event deleted successfully');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  const handleShareEvent = (event: any) => {
    Alert.alert('Share', `Sharing: ${event.title}`);
    setMenuVisible(null);
  };
  useEffect(() => {
    if (!selectedDate || holidays.length === 0) return;
    setShowMonthEvents(false);
  }, [selectedDate, holidays]);

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
        const newFirstDay = parseInt(day);
        console.log('Calendar - Loading first day:', newFirstDay);
        setFirstDayOfWeek(newFirstDay);
        setRefreshKey(prev => prev + 1);

        const data = await loadData('events');
        if (data) setEvents(data);
      }
    } catch (error) {
      console.log('Error loading first day:', error);
    }
  };

  const getMonthEvents = () => {
    const { month, year } = currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const monthEvents = events.filter((e) => {
      const start = new Date(e.startDate);
      if (e.allDay) {
        return start <= lastDay;
      }
      const end = new Date(e.endDate);
      return (start <= lastDay && end >= firstDay);
    });

    const monthHolidays = holidays
      .filter((h) => h.date.startsWith(`${year}-${String(month).padStart(2, "0")}`))
      .map((h, index) => ({
        id: `holiday-${h.date}-${index}`,
        title: h.name,
        date: h.date,
        allDay: true,
        isHoliday: true,
      }));

    return [...monthHolidays, ...monthEvents];
  };

  const getMarkedDates = () => {
    const marked: any = {};
    const eventDotsByDate: any = {};

    events.forEach((event) => {
      let start = new Date(event.startDate);

      if (event.allDay) {
        const today = new Date();
        const futureDate = new Date(today.getFullYear() + 10, 11, 31);
        let current = new Date(start);

        while (current <= futureDate) {
          const dateString = current.toISOString().split("T")[0];

          if (!eventDotsByDate[dateString]) {
            eventDotsByDate[dateString] = [];
          }
          const eventColor = event.color || '#0267FF';
          eventDotsByDate[dateString].push(eventColor);

          current.setDate(current.getDate() + 1);
        }
      } else {
        let end = new Date(event.endDate);
        let current = new Date(start);

        while (current <= end) {
          const dateString = current.toISOString().split("T")[0];

          if (!eventDotsByDate[dateString]) {
            eventDotsByDate[dateString] = [];
          }
          const eventColor = event.color || '#0267FF';
          eventDotsByDate[dateString].push(eventColor);

          current.setDate(current.getDate() + 1);
        }
      }
    });
    holidays.forEach((h) => {
      if (!marked[h.date]) {
        marked[h.date] = { marked: true, dots: [{ color: "#FF5252" }] };
      }
    });

    Object.keys(eventDotsByDate).forEach((dateString) => {
      const eventColors = eventDotsByDate[dateString];
      const firstEventColor = eventColors[0];
      if (!marked[dateString]) {
        marked[dateString] = { marked: true, dots: [{ color: firstEventColor }] };
      } else {
        if (marked[dateString].dots && marked[dateString].dots.length < 2) {
          marked[dateString].dots.push({ color: firstEventColor });
        }
      }
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marked;
  };
  const getTodayEvents = () => {
    const selected = selectedDate;
    const selectedD = new Date(selected);

    const userEvents = events.filter((e) => {
      const start = new Date(e.startDate);
      if (e.allDay) {
        return selectedD >= start;
      }
      const end = new Date(e.endDate);
      return selectedD >= start && selectedD <= end;
    });

    // const todayHolidays = holidays
    //   .filter((h) => h.date === selected)
    //   .map((h, index) => ({
    //     id: `holiday-${h.date}-${index}`,
    //     title: h.name,
    //     date: h.date,
    //     allDay: true,
    //     isHoliday: true,
    //   }));

    // return [...todayHolidays, ...userEvents];
    const todayHolidays = holidays
      .filter((h) => {
        return h.date === selected;
      })
      .map((h, index) => ({
        id: `holiday-${h.date}-${index}`,
        title: h.name,
        date: h.date,
        allDay: true,
        isHoliday: true,
      }));
    return [...todayHolidays, ...userEvents];
  };

  const handleEditEvent = (event: any) => {
    setMenuVisible(null);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* STICKY CALENDAR HEADER */}
      <View style={[styles.calendarContainer, { backgroundColor: colors.background }]}>
        <Calendar
          key={`${theme}-${firstDayOfWeek}-${refreshKey}-${i18n.language}`}
          firstDay={firstDayOfWeek}
          current={selectedDate}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setShowMonthEvents(false);
          }}
          markedDates={getMarkedDates()}
          onMonthChange={(month) => {
            setCurrentMonth({
              month: month.month,
              year: month.year,
            });
            setCurrentYear(month.year);
            setShowMonthEvents(true);
          }}
          enableSwipeMonths={true}
          style={{ backgroundColor: colors.background }}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.textPrimary,
            textSectionTitleDisabledColor: colors.textTertiary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
            dayTextColor: colors.textPrimary,
            textDisabledColor: colors.textTertiary,
            dotColor: colors.primary,
            selectedDotColor: '#ffffff',
            arrowColor: colors.primary,
            disabledArrowColor: colors.textTertiary,
            monthTextColor: colors.textPrimary,
            indicatorColor: colors.primary,
            'stylesheet.day.basic': {
              base: {
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              },
              text: {
                marginTop: 4,
                fontSize: 16,
                fontFamily: 'System',
                fontWeight: '300',
                color: colors.textPrimary,
              },
              selected: {
                backgroundColor: colors.primary,
                borderRadius: 16,
              },
              today: {
                backgroundColor: 'transparent',
              },
              todayText: {
                color: colors.primary,
                fontWeight: 'bold',
              },
              sunday: {
                color: '#FF5252',
              },
            },
          }}
          dayComponent={({ date, state, marking }: any) => {
            const isSunday = new Date(date.dateString).getDay() === 0;
            const isSelected = date.dateString === selectedDate;
            const isToday = date.dateString === new Date().toISOString().split('T')[0];

            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(date.dateString);
                  setShowMonthEvents(false);
                }}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: isSelected
                      ? '#ffffff'
                      : state === 'disabled'
                        ? colors.textTertiary
                        : isSunday
                          ? '#FF5252'
                          : isToday
                            ? colors.primary
                            : colors.textPrimary,
                    fontWeight: isToday ? 'bold' : '400',
                  }}
                >
                  {date.day}
                </Text>
                {marking?.dots && marking.dots.length > 0 && (
                  <View style={{ flexDirection: "row", position: "absolute", bottom: 3 }}>
                    {marking.dots.map((dot, index) => (
                      <View
                        key={index}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: isSelected ? '#ffffff' : dot.color,
                          marginHorizontal: 1,
                        }}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* SCROLLABLE EVENT LIST */}
      <ScrollView style={styles.eventsScrollView}>
        <View style={[styles.eventsList, { backgroundColor: colors.background }]}>
          {(showMonthEvents ? getMonthEvents() : getTodayEvents()).length > 0 ? (
            (showMonthEvents ? getMonthEvents() : getTodayEvents()).map((event, index) => (
              <View key={`${event.id}-${index}`} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.eventDateBar,
                      {
                        backgroundColor: event.isHoliday
                          ? '#FF6B6B'
                          : event.color || colors.primary,
                      },
                    ]}
                  />
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventTime, { color: colors.primary }]}>
                      {selectedDate}
                    </Text>

                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                      {event.title}
                    </Text>

                    <Text style={[styles.eventTime, { color: colors.textTertiary }]}>
                      {event.isHoliday ? t('all_day') : `${event.startTime} - ${event.endTime}`}
                    </Text>
                  </View>

                  <View style={styles.eventMenuContainer}>
                    <TouchableOpacity
                      onPress={() => setMenuVisible(menuVisible === `${event.id}-${index}` ? null : `${event.id}-${index}`)}
                      style={styles.menuButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="more-vertical" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {menuVisible === `${event.id}-${index}` && (
                  <View style={[styles.dropdownMenu, { backgroundColor: colors.cardBackground }]}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleEditEvent(event)}
                    >
                      <Feather name="edit-2" size={18} color="#FF5252" />
                      <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>{t("edit")}</Text>
                    </TouchableOpacity>

                    {!event.isHoliday && (
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleDeleteEvent(event.id)}
                      >
                        <Feather name="trash-2" size={18} color="#FF5252" />
                        <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                          {t("delete")}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleShareEvent(event)}
                    >
                      <Feather name="share-2" size={18} color="#FF5252" />
                      <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>{t("share")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Image
                source={
                  theme
                    ? require("../../assets/images/dark-no-event.png")
                    : require("../../assets/images/no-events.png")
                }
                style={{ width: 140, height: 140, marginBottom: 12, opacity: 0.8 }}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.noDataText,
                  { color: colors.textTertiary, fontSize: 16 }
                ]}
              >
                {t("no_event_yet")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB BUTTON */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
  },
  eventsScrollView: {
    flex: 1,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
  },
  eventDateBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
  },
  eventRepeatContainer: {
    justifyContent: 'center',
    paddingRight: 12,
    paddingLeft: 8,
  },
  eventRepeatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
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
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  eventMenuContainer: {
    position: 'relative',
    paddingTop: 8,
    paddingRight: 8,
  },
  menuButton: {
    padding: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 0,
    right: 30,
    width: 130,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
});