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
        id: 'Tidy',
        title: 'Tidy up',
        subtitle: 'Get rid of your piles of mess',
        icon: 'broom',
    },
    {
        id: 'exercises',
        title: 'Do exercises',
        subtitle: 'Feel more relaxed and sleep better',
        icon: 'dumbbell',
    },
    {
        id: 'bed',
        title: 'Make your bed',
        subtitle: 'Improve your sleep quality',
        icon: 'bed-outline',
    },
    {
        id: 'running',
        title: 'Go running',
        subtitle: "Help maintain a healthy weight",
        icon: 'run',
    },
    {
        id: 'walk',
        title: 'Go for a walk',
        subtitle: 'Stronger bones and improved balance',
        icon: 'walk',
    },
    {
        id: 'Gowalk',
        title: 'Go for a walk',
        subtitle: 'Stronger bones and improved balance',
        icon: 'walk',
    },
    {
        id: 'join',
        title: 'Join a yoga class',
        subtitle: 'Improves strength, balance and flexibility',
        icon: 'yoga',
    },
    {
        id: 'cook',
        title: 'Cook at home',
        subtitle: 'It can make you a happier person',
        icon: 'chef-hat',
    },
    {
        id: 'creatively',
        title: 'Think creatively',
        subtitle: 'Become a better problem solver',
        icon: 'lightbulb-on-outline',
    },
    {
        id: 'health',
        title: 'Annual health check',
        subtitle: 'Reduce pressure in your life',
        icon: 'stethoscope',
    },
    {
        id: 'hardbreak',
        title: 'Break bad habits',
        subtitle: 'You can establish a pattern for new habits',
        icon: 'emoticon-sad-outline',
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
                        Be active my way
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