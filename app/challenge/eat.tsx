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
        id: 'breakfast',
        title: 'Have a great breakfast',
        subtitle: 'Breakfast can help you be more alert',
        icon: 'coffee-outline',
    },
    {
        id: 'lunch',
        title: 'Packed lunches',
        subtitle: 'Provide energy and nutrients to keep you going',
        icon: 'food',
    },
    {
        id: 'fish',
        title: 'Eat fish',
        subtitle: 'An important source of Omega-3 fatty acids',
        icon: 'fish',
    },
    {
        id: 'beef',
        title: 'Eat beef',
        subtitle: "It's an excellent source of iron, zinc, niacin",
        icon: 'food-steak',
    },
    {
        id: 'vitamins',
        title: 'Take multivitamins daily',
        subtitle: 'Reduce stress and anxiety',
        icon: 'pill',
    },
    {
        id: 'cakes',
        title: 'Have cakes',
        subtitle: 'Helps with your digestion',
        icon: 'cake-variant',
    },
    {
        id: 'tea',
        title: 'Daily cup of tea',
        subtitle: 'Tea may reduce your risk of heart attack',
        icon: 'tea-outline',
    },
    {
        id: 'water',
        title: 'Drink water',
        subtitle: 'Regulate body temperature',
        icon: 'cup-water',
    },
    {
        id: 'beans',
        title: 'Add beans to your day',
        subtitle: 'Beans are high in amino acids',
        icon: 'circle',
    },
    {
        id: 'apple',
        title: 'An apple a day helps',
        subtitle: 'Support a healthy immune system',
        icon: 'apple',
    },
    {
        id: 'bananas',
        title: 'Eat bananas',
        subtitle: 'Bananas are one of the best fruit',
        icon: 'fruit-pineapple',
    },
    {
        id: 'cheese',
        title: 'Add cheese to your meals',
        subtitle: 'You gain weight in a healthy way',
        icon: 'cheese',
    },
    {
        id: 'clean',
        title: 'Eat clean, eat green',
        subtitle: 'Eat plenty every day',
        icon: 'leaf',
    },
    {
        id: 'everyday',
        title: 'A glass of fruit juice everyday',
        subtitle: 'It`s a great way to add nutrients',
        icon: 'cup',
    },
    {
        id: 'egg',
        title: 'Eat egg',
        subtitle: 'Eggs provide the highest quality protein',
        icon: 'egg',
    },
    {
        id: 'body',
        title: 'Bread fuels your body',
        subtitle: 'Bread contains fiber and protein',
        icon: 'bread-slice',
    },
    {
        id: 'carrots',
        title: 'Eat carrots',
        subtitle: 'Boosts eye health',
        icon: 'food',
    },
    {
        id: 'avocados',
        title: 'Have avocados regularly',
        subtitle: 'It lowers the risk of heart disease',
        icon: 'fruit-grapes-outline',
    },
    {
        id: 'shrimps',
        title: 'Eat Shrimps',
        subtitle: 'Promote brain health with omega-3',
        icon: 'fish',
    },
    {
        id: 'daily',
        title: 'Mushrooms to your daily meals',
        subtitle: 'Boosts immune system',
        icon: 'mushroom-outline',
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
                        Eat healthy
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