import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { loadData } from '../utils/storage';

export default function SearchScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  const holidays = [
    { date: '2024-09-07', name: 'Ganesh Chaturthi' },
    { date: '2024-09-15', name: 'Onam' },
    { date: '2024-09-16', name: 'Milad un-Nabi' },
    { date: '2024-10-02', name: 'Mahatma Gandhi Jayanti' },
    { date: '2024-10-03', name: 'Sharad Navratri' },
    { date: '2024-10-09', name: 'Durga Puja Festivities' },
    { date: '2024-10-10', name: 'Maha Saptami' },
    { date: '2024-10-11', name: 'Maha Ashtami' },
    { date: '2024-10-12', name: 'Dussehra' },
    { date: '2024-10-17', name: 'Valmiki Jayanti' },
    { date: '2024-10-20', name: 'Karaka Chaturthi' },
    { date: '2024-10-31', name: 'Diwali' },
    { date: '2024-11-02', name: 'Govardhan Puja' },
    { date: '2024-11-03', name: 'Bhai Duj' },
    { date: '2024-11-07', name: 'Chhat Puja' },
    { date: '2024-11-15', name: 'Guru Nanak Jayanti' },
    { date: '2024-12-25', name: 'Christmas' },
    { date: '2025-01-01', name: 'New Year' },
    { date: '2025-01-13', name: 'Lohri' },
    { date: '2025-01-14', name: 'Makar Sankranti' },
    { date: '2025-01-15', name: 'Pongal' },
    { date: '2025-01-17', name: 'Guru Govind Singh Jayanti' },
    { date: '2025-01-25', name: "Hazarat Ali's Birthday" },
    { date: '2025-01-26', name: 'Republic Day' },
    { date: '2025-11-05', name: 'Chhath Puja' },
    { date: '2025-12-05', name: 'Guru Nanak Jayanti' },
    { date: '2025-12-24', name: 'Christmas Eve' },
    { date: '2025-12-25', name: 'Christmas' },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, events]);

  const loadEvents = async () => {
    const data = await loadData('events');
    if (data) setEvents(data);
  };

  const filterEvents = () => {
    // Combine user events and holidays
    const userEvents = events.map((e) => ({
      ...e,
      isHoliday: false,
    }));

    const holidayEvents = holidays.map((h) => ({
      id: `holiday-${h.date}`,
      title: h.name,
      date: h.date,
      allDay: true,
      isHoliday: true,
    }));

    const allEvents = [...holidayEvents, ...userEvents];

    // Filter based on search query
    if (searchQuery.trim() === '') {
      setFilteredEvents(allEvents);
    } else {
      const filtered = allEvents.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  };

  // Group events by date
  const groupEventsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    filteredEvents.forEach((event) => {
      const date = event.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    // Sort dates in ascending order
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      events: grouped[date],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
  };

  const groupedEvents = groupEventsByDate();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Search events..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            /* Add settings action */
          }}
        >
          <Feather name="settings" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView style={styles.content}>
        {groupedEvents.length > 0 ? (
          groupedEvents.map((group) => (
            <View key={group.date} style={styles.dateGroup}>
              {/* Date Header */}
              <Text style={[styles.dateHeader, { color: colors.textPrimary }]}>
                {formatDate(group.date)}
              </Text>

              {/* Events for this date */}
              {group.events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventCard,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!event.isHoliday) {
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
                        },
                      });
                    }
                  }}
                >
                  {/* Color Bar */}
                  <View
                    style={[
                      styles.eventColorBar,
                      {
                        backgroundColor: event.isHoliday
                          ? '#FF6B6B'
                          : colors.primary,
                      },
                    ]}
                  />

                  {/* Event Content */}
                  <View style={styles.eventContent}>
                    <Text
                      style={[styles.eventTitle, { color: colors.textPrimary }]}
                    >
                      {event.title}
                    </Text>

                    <View style={styles.eventDetails}>
                      <Text
                        style={[styles.eventTime, { color: colors.textTertiary }]}
                      >
                        {event.isHoliday
                          ? 'All-day'
                          : `${event.startTime} - ${event.endTime}`}
                      </Text>

                      {!event.allDay && event.repeat && (
                        <Text
                          style={[
                            styles.repeatBadge,
                            {
                              color: colors.textTertiary,
                              backgroundColor: colors.background,
                            },
                          ]}
                        >
                          {event.repeat === 'Does not repeat'
                            ? 'Never'
                            : event.repeat.replace('Every ', '')}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Holiday Badge */}
                  {event.isHoliday && (
                    <View
                      style={[
                        styles.holidayBadge,
                        { backgroundColor: '#FF6B6B' },
                      ]}
                    >
                      <Text style={styles.holidayBadgeText}>Holiday</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Feather
              name="search"
              size={64}
              color={colors.textTertiary}
              style={styles.noResultsIcon}
            />
            <Text style={[styles.noResultsText, { color: colors.textTertiary }]}>
              {searchQuery.trim() === ''
                ? 'Start typing to search events'
                : 'No events found'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTime: {
    fontSize: 14,
  },
  repeatBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  holidayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  holidayBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  noResultsIcon: {
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});