import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function HolidayDetails() {
  const router = useRouter();
  const { title, date, alert, startTime, endTime,  } = useLocalSearchParams();
  const { colors, theme } = useTheme();

  const formatTime = (time) => {
    if (!time) return null;
    const [hour, minute] = time.split(':');
    const dateObj = new Date();
    dateObj.setHours(hour);
    dateObj.setMinutes(minute);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleShare = () => {
    // Add share logic
  };


  const eventTime =
    startTime && endTime
      ? `${formatTime(startTime)} - ${formatTime(endTime)}`
      : "12:00 AM";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ---------- HEADER ---------- */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Event Details
        </Text>

        <TouchableOpacity onPress={handleShare}>
          <Feather name="share" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ---------- CONTENT CARD ---------- */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date Time</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{date} , {eventTime}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Alert</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{"On the day at 9 AM"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },

  // HEADER
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  // CARD
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  label: {
    fontSize: 16,
    fontWeight: "500",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  }
});
