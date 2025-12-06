import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ChallengeOption {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
}

const eatChallenges: ChallengeOption[] = [
  {
    id: 'languages',
    title: 'Learn new languages',
    subtitle: 'Open up a world of job opportunities',
    icon: 'translate',
  },
  {
    id: 'workload',
    title: 'Manage workload',
    subtitle: 'Provide a better quality of work',
    icon: 'account-clock',
  },
  {
    id: 'workAboard',
    title: 'Work abroad',
    subtitle: 'Learn a new skill',
    icon: 'briefcase-account',
  },
  {
    id: 'skill',
    title: 'Learn a new skill',
    subtitle: 'It increases your adaptability',
    icon: 'lightbulb-on',
  },
  {
    id: 'deadline',
    title: 'Get things done before deadline',
    subtitle: 'It will help generate more motivation',
    icon: 'calendar-clock',
  },
  {
    id: 'instrument',
    title: 'Learn to play an instrument',
    subtitle: 'It makes you creative',
    icon: 'guitar-acoustic',
  },
  {
    id: 'daily',
    title: 'Make daily to-do list',
    subtitle: 'Break goals into action points',
    icon: 'format-list-checkbox',
  },
  {
    id: 'expectations',
    title: 'Stabilize expectations',
    subtitle: 'Help others, even in small ways',
    icon: 'target',
  },
  {
    id: 'eliminate',
    title: 'Eliminate distractions',
    subtitle: 'Improve your concentration',
    icon: 'eye-off',
  },
  {
    id: 'Refresh',
    title: 'Refresh your mind',
    subtitle: 'Decrease anxiety and depression',
    icon: 'refresh-circle',
  },
];

export default function EatHealthyScreen() {
    const router = useRouter();
    const { theme, colors } = useTheme();

    const handleChallengeSelect = (challenge: ChallengeOption) => {
        router.push({
            pathname: '/challenge/new',
            params: {
                title: challenge.title,
                icon: challenge.icon,
                category: 'eat'
            }
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        >
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Self improvement
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.challengesList}>
                    {eatChallenges.map((challenge) => (
                        <TouchableOpacity
                            key={challenge.id}
                            style={[styles.challengeCard, { backgroundColor: colors.cardBackground }]}
                            activeOpacity={0.7}
                            onPress={() => handleChallengeSelect(challenge)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.cardBackground }]}>
                                <MaterialCommunityIcons
                                    name={challenge.icon}
                                    size={24}
                                    color={colors.textPrimary}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.challengeTitle, { color: colors.textPrimary }]}>
                                    {challenge.title}
                                </Text>
                                <Text style={[styles.challengeSubtitle, { color: colors.textSecondary }]}>
                                    {challenge.subtitle}
                                </Text>
                            </View>
                        </TouchableOpacity>

                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
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
        // borderBottomWidth: 1,
        // borderBottomColor: '#2a2a2a',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    challengesList: {
        paddingVertical: 16,
        gap: 12,
    },
    challengeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
    },
    iconContainer: {
        // width: 48,
        // height: 48,
        borderRadius: 24,
        // backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    challengeSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
});