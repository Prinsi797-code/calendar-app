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

interface memo {
  id: string;
  title: string;
  details: string;
  Date: string;
  reminder: string;
  location: string;
  url: string;
  completed: boolean;
}

export default function MemoScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [memos, setMemos] = useState<memo[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMemos, setSelectedMemos] = useState<string[]>([]);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');

  const loadmemo = async () => {
    try {
      const memoData = await AsyncStorage.getItem('memo');
      if (memoData) {
        setMemos(JSON.parse(memoData));
      } else {
        setMemos([]);
      }
    } catch (error) {
      console.error('Error loading memo:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadmemo();
      setSelectionMode(false);
      setSelectedMemos([]);
    }, [])
  );

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    setSelectedMemos([id]);
  };

  const handleSelectMemo = (id: string) => {
    if (selectedMemos.includes(id)) {
      const newList = selectedMemos.filter(x => x !== id);
      setSelectedMemos(newList);
      if (newList.length === 0) setSelectionMode(false);
    } else {
      setSelectedMemos([...selectedMemos, id]);
    }
  };

  const handleCardPress = (memo?: memo) => {
    if (selectionMode && memo) {
      handleSelectMemo(memo.id);
    } else if (memo) {
      router.push({ pathname: '/memo/memoDetails', params: { id: memo.id } });
    } else {
      router.push(`/memo/new?timestamp=${Date.now()}`);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMemos([]);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Memos',
      `Are you sure you want to delete ${selectedMemos.length} memo(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = memos.filter(m => !selectedMemos.includes(m.id));
            setMemos(updated);
            await AsyncStorage.setItem('memo', JSON.stringify(updated));
            setSelectionMode(false);
            setSelectedMemos([]);
          }
        }
      ]
    );
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
              {selectedMemos.length} Selected
            </Text>

            <TouchableOpacity
              onPress={handleDeleteSelected}
              style={styles.deleteButton}
              disabled={selectedMemos.length === 0}
            >
              <Feather
                name="trash-2"
                size={24}
                color={selectedMemos.length > 0 ? '#FF6B6B' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.memo}>
              <View style={styles.challengeList}>
                {memos.map(memo => (
                  <TouchableOpacity
                    key={memo.id}
                    style={[
                      styles.challengeCard,
                      { backgroundColor: colors.cardBackground },
                      selectedMemos.includes(memo.id) && styles.selectedCard
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectMemo(memo.id)}
                  >
                    <View
                      style={[
                        styles.leftLine,
                        selectedMemos.includes(memo.id) && styles.selectedLeftLine,
                      ]}
                    />
                    <View style={styles.challengeContent}>
                      <Text style={[styles.challengeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {memo.title}
                      </Text>

                      {memo.details ? (
                        <Text style={[styles.memoDetails, { color: colors.textSecondary }]} numberOfLines={1}>
                          {memo.details}
                        </Text>
                      ) : null}

                      <Text style={[styles.challengeDate, { color: colors.textSecondary }]}>
                        {formatDate(memo.Date)} {memo.reminder && formatTime(memo.reminder)}
                      </Text>
                    </View>

                    <View style={styles.radioContainer}>
                      {selectedMemos.includes(memo.id) ? (
                        <View style={[styles.radioSelected, { borderColor: '#FF6B6B' }]}>
                          <View style={styles.radioInner} />
                        </View>
                      ) : (
                        <View style={[styles.radioUnselected, { borderColor: colors.textSecondary }]} />
                      )}
                    </View>

                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

        </View>
      ) : (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.header, { color: colors.textPrimary }]}>Memo</Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.memo}>
              <View style={styles.challengeList}>
                {memos.length === 0 ? (
                  <TouchableOpacity
                    style={[styles.challengeCard, styles.defaultCard, { backgroundColor: colors.cardBackground }]}
                    activeOpacity={0.8}
                    onPress={() => handleCardPress()}
                  >
                    <View style={styles.leftLine} />
                    <View style={styles.challengeContent}>
                      <Text style={[styles.challengeTitle, { color: colors.textPrimary }]}>
                        Write a Moment to Remember.
                      </Text>
                      <Text style={[styles.challengeDate, { color: colors.textSecondary }]}>
                        {formattedDate}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  memos.map(memo => (
                    <TouchableOpacity
                      key={memo.id}
                      style={[
                        styles.challengeCard,
                        { backgroundColor: colors.cardBackground },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleCardPress(memo)}
                      onLongPress={() => handleLongPress(memo.id)}
                    >
                      <View style={styles.leftLine} />
                      <View style={styles.challengeContent}>
                        <Text style={[styles.challengeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                          {memo.title}
                        </Text>

                        {memo.details ? (
                          <Text style={[styles.memoDetails, { color: colors.textSecondary }]} numberOfLines={1}>
                            {memo.details}
                          </Text>
                        ) : null}

                        <Text style={[styles.challengeDate, { color: colors.textSecondary }]}>
                          {formatDate(memo.Date)} {memo.reminder && formatTime(memo.reminder)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/memo/new?timestamp=${Date.now()}`)}
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
