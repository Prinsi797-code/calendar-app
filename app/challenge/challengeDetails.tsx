import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Challenge {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  icon: string;
  repeat: string;
  reminder: string;
  completed: boolean;
}

export default function ChallengeDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const loadChallenge = async () => {
    try {
      const challengesData = await AsyncStorage.getItem('challenges');
      if (challengesData) {
        const challenges = JSON.parse(challengesData);
        const foundChallenge = challenges.find((c: Challenge) => c.id === params.id);
        if (foundChallenge) {
          setChallenge(foundChallenge);
        }
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChallenge();
    }, [params.id])
  );

  const handleDelete = () => {
    Alert.alert(
      t('delete_challenge_title'),
      t('delete_challenge_message'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const challengesData = await AsyncStorage.getItem('challenges');
              if (challengesData) {
                const challenges = JSON.parse(challengesData);
                const updatedChallenges = challenges.filter(
                  (c: Challenge) => c.id !== params.id
                );
                await AsyncStorage.setItem(
                  'challenges',
                  JSON.stringify(updatedChallenges)
                );
                router.back();
              }
            } catch (error) {
              console.error('Error deleting challenge:', error);
              Alert.alert('Error', 'Failed to delete challenge');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} style={{ color: colors.textPrimary }}/>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t("challenge_details")}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/challenge/new',
              params: { id: challenge.id }
            })}
            style={styles.headerButton}
          >
            <Feather name="edit" size={20}  style={{ color: colors.textPrimary }}/>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <Feather name="trash-2" size={20} style={{ color: colors.textPrimary }}/>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.challengeHeader, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
            <Text style={styles.icon}>{challenge.icon}</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeTitle, { color: colors.textPrimary }]}>{challenge.title}</Text>
            <Text style={styles.challengeDate}>
              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={[styles.detailRow,  { backgroundColor: colors.cardBackground }]}>
            <View style={styles.detailItem}>
              <View style={styles.leftSide}>
                <Feather name="repeat" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>
                  {t("repeat")}
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {t(challenge.repeat)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.detailItem}>
              <View style={styles.leftSide}>
                <Feather name="calendar" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>
                  {t("start_date")}
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {formatDate(challenge.startDate)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.detailItem}>
              <View style={styles.leftSide}>
                <Feather name="calendar" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>
                  {t("end_date")}
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {formatDate(challenge.endDate)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.detailItem}>
              <View style={styles.leftSide}>
                <Feather name="bell" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>
                  {t("reminder")}
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {challenge.reminder}
              </Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              challenge.completed ? styles.statusCompleted : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                challenge.completed
                  ? styles.statusTextCompleted
                  : styles.statusTextPending,
              ]}
            >
              {challenge.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color: '#fff',
    flex: 1,
    marginLeft: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    // color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: '#1a1a1a',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    // backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginLeft: 15,
  },
  icon: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    // color: '#fff',
    marginBottom: 4,
  },
  challengeDate: {
    fontSize: 14,
    color: '#888',
  },
  detailsSection: {
    marginTop: 24,
    // backgroundColor: '#1a1a1a',
    borderRadius: 12,
    // padding: 16,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,  // optional
  },
  detailRow: {
    // paddingVertical: 12,
    marginTop: 8,
    padding: 15,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    // color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    // color: '#fff',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
  },

});