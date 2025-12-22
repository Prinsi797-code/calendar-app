import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from "react-i18next";
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
        title: 'learn_mew_languages',
        subtitle: 'open_up_worls_opportunities',
        icon: 'translate',
    },
    {
        id: 'workload',
        title: 'manage_workload',
        subtitle: 'provide_better',
        icon: 'account-clock',
    },
    {
        id: 'workAboard',
        title: 'work_abroad',
        subtitle: 'it_good_personal',
        icon: 'briefcase-account',
    },
    {
        id: 'skill',
        title: 'learn_new_skill',
        subtitle: 'it_increases_adaptability',
        icon: 'lightbulb-on',
    },
    {
        id: 'deadline',
        title: 'get_things_done',
        subtitle: 'it_will_help_generate',
        icon: 'calendar-clock',
    },
    {
        id: 'instrument',
        title: 'learn_play_instrument',
        subtitle: 'it_makes_creative',
        icon: 'guitar-acoustic',
    },
    {
        id: 'daily',
        title: 'make_daily_list',
        subtitle: 'break_goals_points',
        icon: 'format-list-checkbox',
    },
    {
        id: 'expectations',
        title: 'stabilize_exppectation',
        subtitle: 'help_others_small',
        icon: 'target',
    },
    {
        id: 'eliminate',
        title: 'eliminate_distractions',
        subtitle: 'improve_concentration',
        icon: 'eye-off',
    },
    {
        id: 'Refresh',
        title: 'refresh_your_mind',
        subtitle: 'decrease_anxiety_depression',
        icon: 'refresh-circle',
    },
];

export default function EatHealthyScreen() {
    const router = useRouter();
    const { from } = useLocalSearchParams();
    const { t } = useTranslation();
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

    const handleBackPress = async () => {
        try {
            if (from === "challenge/improvement") {
                router.replace("/challenge/create");
            } else {
                router.replace("/challenge/create");
            }
        } catch (error) {
            console.error("Error showing back ad:", error);
            if (from === "challenge/improvement") {
                router.replace("/challenge/create");
            } else {
                router.replace("/challenge/create");
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        {t("self_improvement")}
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
                                    {t(challenge.title)}
                                </Text>
                                <Text style={[styles.challengeSubtitle, { color: colors.textSecondary }]}>
                                    {t(challenge.subtitle)}
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