import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../../contexts/ThemeContext';
import { loadData, saveData } from '../../utils/storage';

// Country code to Google Calendar ID mapping
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

  const [currentMonth, setCurrentMonth] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadFirstDay();
    loadSelectedCountry();
  }, []);

  // Load selected country from storage
  const loadSelectedCountry = async () => {
    try {
      const country = await AsyncStorage.getItem('selectedCountry');
      if (country) {
        setSelectedCountry(country);
        fetchHolidays(country);
      } else {
        // Default to India if no country selected
        setSelectedCountry('India');
        fetchHolidays('India');
      }
    } catch (error) {
      console.log('Error loading country:', error);
      fetchHolidays('India');
    }
  };

  // Fetch holidays from Google Calendar API
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

  // Delete Event
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

  //share Event
  const handleShareEvent = (event: any) => {
    Alert.alert('Share', `Sharing: ${event.title}`);
    setMenuVisible(null);
  };

  // Reload events when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
      loadFirstDay();
      loadSelectedCountry(); // Reload holidays when returning to screen
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
        console.log('📅 Calendar - Loading first day:', newFirstDay);
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

    // Convert month-year → "YYYY-MM"
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

    // Events in this month
    const userEvents = events.filter((e) => e.date.startsWith(monthPrefix));

    // Holidays in this month
    const monthHolidays = holidays
      .filter((h) => h.date.startsWith(monthPrefix))
      .map((h) => ({
        id: `holiday-${h.date}`,
        title: h.name,
        date: h.date,
        allDay: true,
        isHoliday: true,
      }));

    return [...monthHolidays, ...userEvents];
  };

  const getMarkedDates = () => {
    const marked: any = {};

    events.forEach((event) => {
      marked[event.date] = { marked: true, dotColor: colors.primary };
    });

    holidays.forEach((h) => {
      marked[h.date] = { marked: true, dotColor: colors.primary };
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
    const userEvents = events.filter((e) => e.date === selectedDate);
    const todayHolidays = holidays
      .filter((h) => h.date === selectedDate)
      .map((h) => ({
        id: `holiday-${h.date}`,
        title: h.name,
        date: h.date,
        allDay: true,
        isHoliday: true,
      }));
    return [...todayHolidays, ...userEvents];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Calendar
          key={`${theme}-${firstDayOfWeek}-${refreshKey}`}
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
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />

        {/* EVENT LIST */}
        <View style={[styles.eventsList, { backgroundColor: colors.background }]}>
          {(showMonthEvents ? getMonthEvents() : getTodayEvents()).length > 0 ? (
            (showMonthEvents ? getMonthEvents() : getTodayEvents()).map((event, index) => (
              <View key={event.id} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.eventDateBar, { backgroundColor: event.isHoliday ? '#FF6B6B' : colors.primary }]} />

                  <View style={styles.eventContent}>
                    <Text style={[styles.eventTime, { color: colors.primary }]}>
                      {event.date}
                    </Text>

                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                      {event.title}
                    </Text>

                    <Text style={[styles.eventTime, { color: colors.textTertiary }]}>
                      {event.isHoliday ? "All-day" : `${event.startTime} - ${event.endTime}`}
                    </Text>
                  </View>

                  {/* 3 DOTS MENU - TOP RIGHT */}
                  <View style={styles.eventMenuContainer}>
                    <TouchableOpacity
                      onPress={() => setMenuVisible(menuVisible === event.id ? null : event.id)}
                      style={styles.menuButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="more-vertical" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {/* DROPDOWN MENU - CARD KE BAHAR */}
                {menuVisible === event.id && (
                  <View style={[styles.dropdownMenu, { backgroundColor: colors.cardBackground }]}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
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

                        // OPEN NORMAL EVENT EDIT SCREEN
                        router.push({
                          pathname: '/editEvent',
                          params: {
                            eventId: event.id,
                            title: event.title,
                            description: event.description,
                            startDate: event.startDate,
                            endDate: event.endDate,
                            startTime: event.startTime,
                            endTime: event.endTime,
                            allDay: event.allDay.toString(),
                            repeat: event.repeat,
                            reminders: JSON.stringify(event.reminders),
                          }
                        });
                      }}
                    >
                      <Feather name="edit-2" size={18} color="#FF5252" />
                      <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Edit</Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleDeleteEvent(event.id)}
                    >
                      <Feather name="trash-2" size={18} color="#FF5252" />
                      <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleShareEvent(event)}
                    >
                      <Feather name="share-2" size={18} color="#FF5252" />
                      <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Share</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.noDataText, { color: colors.textTertiary }]}>
              {showMonthEvents ? 'No events this month' : 'No events for this date'}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* FAB Button - Navigate to AddEvent Screen */}
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