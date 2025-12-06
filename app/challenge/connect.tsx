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
    id: 'family',
    title: 'Talk with my family',
    subtitle: 'It builds a family relationship and family members.',
    icon: 'account-voice',
  },
  {
    id: 'reconnect',
    title: 'Reconnect with old friends',
    subtitle: 'You were a part of their lives at one point',
    icon: 'account-multiple-check',
  },
  {
    id: 'involved',
    title: 'Get involved in a community',
    subtitle: 'Be proactive. Share your voice and opinions',
    icon: 'account-group',
  },
  {
    id: 'travel',
    title: 'Travel',
    subtitle: 'Improves your understanding of other cultures.',
    icon: 'airplane',
  },
  {
    id: 'animals',
    title: 'Save animals',
    subtitle: 'Keep them safe at home',
    icon: 'paw',
  },
  {
    id: 'care',
    title: 'Care for others',
    subtitle: 'Helps to develop empathy and the ability to connect',
    icon: 'hand-heart',
  },
  {
    id: 'phone',
    title: 'Make a phone call',
    subtitle: 'Show your care to others',
    icon: 'phone',
  },
  {
    id: 'Value',
    title: 'Add Value',
    subtitle: 'Help others, even in small ways',
    icon: 'plus-circle',
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
                        Connect with others
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