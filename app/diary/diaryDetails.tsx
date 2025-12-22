import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Diary {
    id: string;
    title: string;
    icon: string;
    Date: string;
    reminder: string;
    completed: boolean;
    location: string;
    url: string;
}

export default function DiaryDetailsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const [diary, setDiary] = useState<Diary | null>(null);

    const loadDiary = async () => {
        try {
            const diaryData = await AsyncStorage.getItem('diarys');
            if (diaryData) {
                const diarys = JSON.parse(diaryData);
                const foundDiary = diarys.find((d: Diary) => d.id === params.id);
                if (foundDiary) {
                    setDiary(foundDiary);
                }
            }
        } catch (error) {
            console.error('Error loading diary:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDiary();
        }, [params.id])
    );

    const handleDelete = () => {
        Alert.alert(
             t('delete_diary'),
            t('are_sure_diary_entries'),
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
                            const diaryData = await AsyncStorage.getItem('diarys');
                            if (diaryData) {
                                const diarys = JSON.parse(diaryData);
                                const updatedDiarys = diarys.filter(
                                    (d: Diary) => d.id !== params.id
                                );
                                await AsyncStorage.setItem(
                                    'diarys',
                                    JSON.stringify(updatedDiarys)
                                );
                                router.back();
                            }
                        } catch (error) {
                            console.error('Error deleting diary:', error);
                            Alert.alert('Error', 'Failed to delete diary');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        router.push({
            pathname: '/diary/new',
            params: { id: diary?.id }
        });
    };

    const handleOpenUrl = (url: string) => {
        if (url) {
            let formattedUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                formattedUrl = 'https://' + url;
            }
            Linking.openURL(formattedUrl).catch(() => {
                Alert.alert('Error', 'Unable to open URL');
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    if (!diary) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t("diary_details")}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleEdit}
                        style={styles.headerButton}
                    >
                        <Feather name="edit" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={styles.headerButton}
                    >
                        <Feather name="trash-2" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Section with Icon */}
                {/* <View style={[styles.titleSection, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.titleWithIcon}>
                        <Text style={styles.iconEmoji}>{diary.icon}</Text>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{diary.title}</Text>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Feather name="calendar" size={14} color={colors.textSecondary} />
                            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                {formatDate(diary.Date)}
                            </Text>
                        </View>
                        {diary.reminder && (
                            <View style={styles.infoItem}>
                                <Feather name="clock" size={14} color={colors.textSecondary} />
                                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                    {formatTime(diary.reminder)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View> */}
                <View style={[styles.challengeHeader, { backgroundColor: colors.cardBackground }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                        <Text style={styles.icon}>{diary.icon}</Text>
                    </View>
                    <View style={styles.challengeInfo}>
                        <Text style={[styles.challengeTitle, { color: colors.textPrimary }]}>{diary.title}</Text>
                        <View style={styles.infoGrid}>
                            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                {formatDate(diary.Date)}
                            </Text>
                            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                                {formatTime(diary.reminder)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Location Section */}
                {diary.location ? (
                    <View style={[styles.detailRow, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.detailItem}>
                            <View style={styles.leftSide}>
                                <View style={[styles.iconCircle, { backgroundColor: '#FF9800' + '20' }]}>
                                    <Feather name="map-pin" size={18} color="#FF9800" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
                                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                                        {diary.location}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* URL Section */}
                {diary.url ? (
                    <TouchableOpacity
                        style={[styles.detailRow, { backgroundColor: colors.cardBackground }]}
                        onPress={() => handleOpenUrl(diary.url)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.detailItem}>
                            <View style={styles.leftSide}>
                                <View style={[styles.iconCircle, { backgroundColor: '#9C27B0' + '20' }]}>
                                    <Feather name="link" size={18} color="#9C27B0" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>URL</Text>
                                    <Text style={[styles.detailValue, { color: '#2196F3' }]} numberOfLines={1}>
                                        {diary.url}
                                    </Text>
                                </View>
                            </View>
                            <Feather name="external-link" size={16} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ) : null}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        borderRadius: 15,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        marginLeft: 15,
    },
    backButton: {
        padding: 4,
    },
    icon: {
        fontSize: 32,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginLeft: 12,
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
        fontSize: 16,
    },
    challengeInfo: {
        flex: 1,
    },
    challengeTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    challengeDate: {
        fontSize: 14,
        color: '#888',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    titleSection: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    titleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailRow: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSide: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
    },
});