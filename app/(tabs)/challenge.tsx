import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

export default function ChallengeScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load challenges from AsyncStorage
  const loadChallenges = async () => {
    try {
      const challengesData = await AsyncStorage.getItem('challenges');
      if (challengesData) {
        const parsedChallenges = JSON.parse(challengesData);
        setChallenges(parsedChallenges);
      } else {
        setChallenges([]);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
      // Reset selection mode when screen loses focus
      return () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
      };
    }, [])
  );

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const handleSelectToggle = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
    if (newSelectedIds.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleCardPress = (challenge?: Challenge) => {
    if (selectionMode && challenge) {
      handleSelectToggle(challenge.id);
    } else if (challenge) {
      router.push({
        pathname: '/challenge/challengeDetails',
        params: { id: challenge.id }
      });
    } else {
      router.push('/challenge/new');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Challenges',
      `Are you sure you want to delete ${selectedIds.size} challenge${selectedIds.size > 1 ? 's' : ''}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedChallenges = challenges.filter(
                (c) => !selectedIds.has(c.id)
              );
              setChallenges(updatedChallenges);
              await AsyncStorage.setItem('challenges', JSON.stringify(updatedChallenges));
              setSelectionMode(false);
              setSelectedIds(new Set());
            } catch (error) {
              console.error('Error deleting challenges:', error);
            }
          },
        },
      ]
    );
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <>
      {selectionMode ? (
        <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
          {/* Selection Header */}
          <View style={[styles.selectionHeader, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={handleCancelSelection} style={styles.cancelButton}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.selectionTitle, { color: colors.textPrimary }]}>
              {selectedIds.size} Selected
            </Text>

            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              disabled={selectedIds.size === 0}
            >
              <Feather
                name="trash-2"
                size={24}
                color={selectedIds.size > 0 ? '#FF6B6B' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.challengeList}>
              {challenges.map((challenge) => {
                const isSelected = selectedIds.has(challenge.id);
                return (
                  <TouchableOpacity
                    key={challenge.id}
                    style={[
                      styles.challengeCard,
                      { backgroundColor: colors.cardBackground },
                      isSelected && styles.selectedCard
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectToggle(challenge.id)}
                  >
                    <View style={styles.challengeContent}>
                      <Text style={[styles.challengeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {challenge.title}
                      </Text>
                      <Text style={[styles.challengeDate, { color: colors.textSecondary }]}>
                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                      </Text>
                    </View>

                    <View style={styles.radioContainer}>
                      {isSelected ? (
                        <View style={[styles.radioSelected, { borderColor: '#FF6B6B' }]}>
                          <View style={styles.radioInner} />
                        </View>
                      ) : (
                        <View style={[styles.radioUnselected, { borderColor: colors.textSecondary }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.header, { color: colors.textPrimary }]}>Challenge</Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.challengeList}>
              {challenges.length === 0 ? (
                <TouchableOpacity
                  style={[styles.challengeCard, { backgroundColor: colors.cardBackground }]}
                  activeOpacity={0.8}
                  onPress={() => handleCardPress()}
                >
                  <View style={styles.challengeContent}>
                    <Text style={[styles.challengeTitle, { color: colors.textPrimary }]}>
                      Challenge Yourself Today.
                    </Text>
                    <Text style={[styles.challengeDate, { color: colors.textSecondary }]}>
                      {formattedDate} - {formattedDate}
                    </Text>
                  </View>
                  {/* <View style={styles.emptyCheckbox} /> */}
                </TouchableOpacity>
              ) : (
                challenges.map((challenge) => (
                  <TouchableOpacity
                    key={challenge.id}
                    style={[
                      styles.challengeCard,
                      { backgroundColor: colors.cardBackground },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleCardPress(challenge)}
                    onLongPress={() => handleLongPress(challenge.id)}
                    delayLongPress={500}
                  >
                    <View style={styles.challengeContent}>
                      <Text style={[styles.challengeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {challenge.title}
                      </Text>
                      <Text style={[styles.challengeDate, { color: colors.textSecondary }]}>
                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/challenge/create')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullScreenContainer: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 20, marginHorizontal: 16 },

  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: { padding: 4 },
  selectionTitle: { fontSize: 18, fontWeight: '600', flex: 1, marginLeft: 12 },
  deleteButton: { padding: 4 },

  memo: { paddingBottom: 100 },
  challengeList: { gap: 12 },

  challengeCard: {
    borderRadius: 12,
    padding: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },

  selectedCard: { opacity: 0.8 },

  defaultCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },

  leftLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#5a0a0aff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  selectedLeftLine: { backgroundColor: '#FF6B6B' },

  challengeContent: { flex: 1 },
  challengeTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  memoDetails: { fontSize: 14, marginBottom: 4 },
  challengeDate: { fontSize: 13 },

  radioContainer: { marginLeft: 12 },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B6B' },
  radioUnselected: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },

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
  },

  fabText: { color: '#fff', fontSize: 32, fontWeight: '300' },
});