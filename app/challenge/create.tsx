// create.tsx - Use router.replace to clear previous params

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    BannerAdSize,
    GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../../contexts/ThemeContext';
import AdsManager from '../../services/adsManager';

interface CreateOption {
    id: string;
    title: string;
    icon: string;
    iconBg: string;
}

interface Category {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
}

const createOptions: CreateOption[] = [
    {
        id: 'regular',
        title: 'regular_habit',
        icon: 'calendar',
        iconBg: '#9333EA',
    },
    {
        id: 'onetime',
        title: 'one_time_task',
        icon: 'file-text',
        iconBg: '#F59E0B',
    },
];

const categories: Category[] = [
    {
        id: 'eat',
        title: 'eat_healthy',
        subtitle: 'eating_health',
        emoji: '🥗',
    },
    {
        id: 'relax',
        title: 'self_relaxation',
        subtitle: 'do_something',
        emoji: '🧘',
    },
    {
        id: 'active',
        title: 'be_active_my',
        subtitle: 'bunch_of_other',
        emoji: '🚴',
    },
    {
        id: 'weird',
        title: 'be_weird',
        subtitle: 'being_called',
        emoji: '🦄',
    },
    {
        id: 'connect',
        title: 'connect_with_others',
        subtitle: 'live_longer',
        emoji: '👥',
    },
    {
        id: 'improvement',
        title: 'self_improvement',
        subtitle: 'aware_of_your',
        emoji: '💡',
    },
];

export default function CreateScreen() {
    const router = useRouter();
    const { theme, colors } = useTheme();
    const { t } = useTranslation();

    const [bannerConfig, setBannerConfig] = useState<{
        show: boolean;
        id: string;
        position: string;
    } | null>(null);

    useEffect(() => {
        const config = AdsManager.getBannerConfig('home');
        setBannerConfig(config);
    }, []);

    // ✅ FIX: Use push without params to start fresh
    const handleCreateOption = (optionId: string) => {
        router.push({
            pathname: '/challenge/new',
            params: { 
                type: optionId,
                // Don't pass any title/icon - let it use defaults
            }
        });
    };

    const handleCategory = (categoryId: string) => {
        // Navigate to specific category pages
        const categoryPaths: { [key: string]: string } = {
            'eat': '/challenge/eat',
            'relax': '/challenge/relax',
            'active': '/challenge/active',
            'weird': '/challenge/weird',
            'connect': '/challenge/connect',
            'improvement': '/challenge/improvement',
        };

        const path = categoryPaths[categoryId];
        if (path) {
            router.push(path as any);
        }
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
                        {t("create")}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Create your own section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    {t("create_your_own")}
                </Text>

                <View style={styles.createOptionsContainer}>
                    {createOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.createOptionCard, { backgroundColor: colors.cardBackground }]}
                            activeOpacity={0.7}
                            onPress={() => handleCreateOption(option.id)}
                        >
                            <View style={[styles.optionIconContainer, { backgroundColor: option.iconBg }]}>
                                <Feather name={option.icon as any} size={24} color="#fff" />
                            </View>
                            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                                {t(option.title)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Categories section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>
                    {t("choose_categories")}
                </Text>

                <View style={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryCard, { backgroundColor: colors.cardBackground }]}
                            activeOpacity={0.7}
                            onPress={() => handleCategory(category.id)}
                        >
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                <View style={styles.categoryTextContainer}>
                                    <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>
                                        {t(category.title)}
                                    </Text>
                                    <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
                                        {t(category.subtitle)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {bannerConfig?.show && (
                <View style={styles.stickyAdContainer}>
                    <GAMBannerAd
                        unitId={bannerConfig.id}
                        sizes={[BannerAdSize.BANNER]}
                        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    />
                </View>
            )}
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
    sectionTitle: {
        fontSize: 14,
        marginTop: 20,
        marginBottom: 12,
    },
    createOptionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    createOptionCard: {
        flex: 1,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    categoriesContainer: {
        gap: 12,
        marginTop: 10,
        paddingBottom: 24,
    },
    stickyAdContainer: {
        // position: 'absolute',
        // bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    categoryCard: {
        borderRadius: 12,
        padding: 16,
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    categoryTextContainer: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
});