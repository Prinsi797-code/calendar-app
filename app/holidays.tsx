import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import NotificationService from '../services/NotificationService';

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

export default function Holidays() {
  const router = useRouter();
  const { colors } = useTheme();
  const { country } = useLocalSearchParams();
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

  const formatDate = (rawDate, lang) => {
    const date = new Date(rawDate);
    return date.toLocaleDateString(
      lang === 'hi' ? 'hi-IN' : 'en-IN',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      setError(null);
      try {
        const countryName = Array.isArray(country) ? country[0] : country || 'India';
        const calendarId = COUNTRY_CALENDAR_IDS[countryName];
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01T00:00:00Z`;
        const endDate = `${currentYear + 3}-12-31T23:59:59Z`;
        if (!calendarId) {
          setError(`Holidays not available for ${countryName}`);
          setLoading(false);
          return;
        }

        const encodedCalendarId = encodeURIComponent(calendarId);
        const API_URL =
          `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events` +
          `?key=${API_KEY}` +
          `&timeMin=${currentYear}-01-01T00:00:00Z` +
          `&timeMax=${currentYear + 3}-12-31T23:59:59Z` +
          `&maxResults=1000` +
          `&singleEvents=true` +
          `&orderBy=startTime` +
          `&hl=${i18n.language === 'hi' ? 'hi' : 'en'}`;
          
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.error) {
          setError(`Error: ${data.error.message}`);
          setLoading(false);
          return;
        }

        if (data.items) {
          const formatted = data.items.map((item: any) => {
            NotificationService.scheduleFestivalNotification(
              item.id,
              item.summary,
              item.start.date
            );

            return {
              date: formatDate(item.start.date, i18n.language),
              name: item.summary,
            };
          });
          setHolidays(formatted);
        } else {
          setHolidays([]);
        }
      } catch (err) {
        console.log("Error fetching holidays:", err);
        setError("Failed to load holidays. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [country]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t("holiday")}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="large" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.content}>
          {holidays.map((holiday, index) => (
            <View key={index} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.redBar, { backgroundColor: '#FF433A' }]} />
              <View style={styles.textSection}>
                <Text style={[styles.date, { color: '#FF433A' }]}>{holiday.date}</Text>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{holiday.name}</Text>
                <Text style={[styles.subText, { color: colors.textTertiary }]}>{t("allday")}</Text>
              </View>
              <Text style={[styles.never, { color: colors.textTertiary }]}>{t("never")}</Text>
            </View>
          ))}
        </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 26,
    fontWeight: "600"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  content: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    borderRadius: 18,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  redBar: {
    width: 4,
    borderRadius: 50,
    marginRight: 16,
    height: "100%",
  },
  textSection: {
    flex: 1,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  subText: {
    fontSize: 14,
  },
  never: {
    fontSize: 14,
    marginTop: 5,
  },
});
