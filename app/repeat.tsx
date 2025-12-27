import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../contexts/ThemeContext";

export default function RepeatScreen() {
    const allParams = useLocalSearchParams();
    const { selectedRepeat, source, eventId } = allParams;
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [tempRepeatType, setTempRepeatType] = useState("does_not");
    const [tempDurationType, setTempDurationType] = useState("forever");
    const [tempTimesCount, setTempTimesCount] = useState("10");
    const [tempUntilDate, setTempUntilDate] = useState(new Date());

    const router = useRouter();
    const [showDateModal, setShowDateModal] = useState(false);

    const getParamValue = (value?: string | string[]) => {
        if (Array.isArray(value)) {
            return value[0];
        }
        return value;
    };

    useFocusEffect(
        React.useCallback(() => {
            setTempRepeatType(getParamValue(allParams.repeatValue) ?? "does_not");
            setTempDurationType(getParamValue(allParams.repeatDuration) ?? "forever");
            setTempTimesCount(getParamValue(allParams.repeatCount) ?? "10");

            // ✅ Proper date parsing
            const untilDateStr = getParamValue(allParams.repeatUntil);
            if (untilDateStr) {
                try {
                    const parsedDate = new Date(untilDateStr);
                    // Check if date is valid
                    if (!isNaN(parsedDate.getTime())) {
                        setTempUntilDate(parsedDate);
                    } else {
                        setTempUntilDate(new Date());
                    }
                } catch (error) {
                    setTempUntilDate(new Date());
                }
            } else {
                setTempUntilDate(new Date());
            }
        }, [allParams.repeatValue, allParams.repeatDuration, allParams.repeatCount, allParams.repeatUntil])
    );

    // const repeatOptions = [
    //     { key: "does_not", label: t("does_not_repeat") },
    //     { key: "everyday", label: t("everyday") },
    //     { key: "every_week", label: t("every_week") },
    //     { key: "every_month", label: t("every_month") },
    //     { key: "every_year", label: t("every_year") },
    // ];

    const repeatOptions = [
        { key: "does_not", label: t("does_not_repeat") },
        { key: "everyday", label: t("everyday") },
        { key: "every_week", label: t("every_week") },
        { key: "every_month", label: t("every_month") },
        { key: "every_year", label: t("every_year") },
    ];
    const durationOptions = [
        { key: "forever", label: t("forever") },
        // { key: "until", label: t("until") },
        // { key: "specific", label: t("specific") }
    ];

    const handleBack = () => {
        if (source === "editEvent") {
            router.replace({
                pathname: "/editEvent",
                params: {
                    ...allParams,
                    repeatValue: getParamValue(allParams.repeatValue) ?? "does_not",
                    repeatDuration: getParamValue(allParams.repeatDuration) ?? "forever",
                    repeatCount: getParamValue(allParams.repeatCount) ?? "10",
                    repeatUntil: getParamValue(allParams.repeatUntil),
                }

            });
        } else {
            router.replace({
                pathname: "/addEvent",
                params: {
                    repeatValue: getParamValue(allParams.repeatValue) ?? "does_not",
                    repeatDuration: getParamValue(allParams.repeatDuration) ?? "forever",
                    repeatCount: getParamValue(allParams.repeatCount) ?? "10",
                    repeatUntil: getParamValue(allParams.repeatUntil),
                },
            });

        }
    };
    // const handleBack = () => {
    //     router.replace({
    //         pathname: source === "editEvent" ? "/editEvent" : "/addEvent",
    //     });
    // };

    const saveAndGoBack = () => {
        const targetPath = source === 'editEvent' ? '/editEvent' : '/addEvent';
        const params: any = {
            repeatValue: tempRepeatType,
            repeatDuration: tempDurationType,
            repeatCount: tempTimesCount,
            repeatUntil: tempUntilDate.toISOString(),
        };

        if (source === 'editEvent' && eventId) {
            params.eventId = eventId;
            Object.keys(allParams).forEach(key => {
                if (key !== 'repeatValue' && key !== 'repeatDuration' && key !== 'repeatCount' && key !== 'repeatUntil' && key !== 'source' && key !== 'selectedRepeat') {
                    params[key] = allParams[key];
                }
            });
        }
        if (source === 'addEvent') {
            params.source = 'addEvent';
        }

        router.replace({
            pathname: targetPath,
            params: params,
        });
    };

    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const getRepeatLabel = (key) => {
        const found = repeatOptions.find(i => i.key === key);
        return found ? found.label : "";
    };

    const getDurationLabel = (key) => {
        const found = durationOptions.find(i => i.key === key);
        return found ? found.label : "";
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header]}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        {t("repeat")}
                    </Text>
                </View>

                <TouchableOpacity style={styles.headerRight} onPress={saveAndGoBack}>
                    <Feather name="check" size={24} color="#FF5252" />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
                {tempRepeatType !== "does_not" && (
                    <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                        {t("this_event_will_repeat")} {getRepeatLabel(tempRepeatType)?.toLowerCase()} {getDurationLabel(tempDurationType)?.toLowerCase()}
                    </Text>
                )}

                {repeatOptions.map(item => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.option,
                            { backgroundColor: colors.cardBackground },
                        ]}
                        onPress={() => setTempRepeatType(item.key)}
                    >
                        <Text style={[styles.text, { color: colors.textPrimary }]}>
                            {item.label}
                        </Text>

                        <View
                            style={[
                                styles.circle,
                                tempRepeatType === item.key && styles.circleSelected,
                            ]}
                        >
                            {tempRepeatType === item.key && (
                                <Feather name="check" size={14} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal transparent visible={showDateModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowDateModal(false)}
                    />
                    <View
                        style={[
                            styles.modalBox,
                            { backgroundColor: colors.cardBackground },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {t("select_end_date")}
                            </Text>
                        </View>

                        <Calendar
                            minDate={getTodayString()}
                            onDayPress={(day) => {
                                setTempUntilDate(new Date(day.dateString));
                                setShowDateModal(false);
                            }}
                            theme={{
                                backgroundColor: colors.cardBackground,
                                calendarBackground: colors.cardBackground,
                                textSectionTitleColor: colors.textPrimary,
                                selectedDayBackgroundColor: '#FF5252',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#FF5252',
                                dayTextColor: colors.textPrimary,
                                textDisabledColor: colors.textSecondary,
                                monthTextColor: colors.textPrimary,
                                textMonthFontWeight: '600',
                            }}
                            markedDates={{
                                [tempUntilDate.toISOString().split('T')[0]]: {
                                    selected: true,
                                    selectedColor: '#FF5252'
                                }
                            }}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setShowDateModal(false)}
                                style={styles.modalButton}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                                    {t("cancel")}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowDateModal(false)}
                                style={styles.modalButton}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FF5252' }]}>
                                    {t("ok")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginTop: 50,
    },
    headerLeft: { position: "absolute", left: 20 },
    headerRight: { position: "absolute", right: 20 },
    headerCenter: { justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "600" },
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        marginBottom: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    optionLeft: {
        flex: 1,
        marginRight: 10,
    },
    text: { fontSize: 16 },
    subText: {
        fontSize: 14,
        marginTop: 6,
    },
    smallText: { marginBottom: 15, fontSize: 13 },
    durationTitle: {
        marginTop: 20,
        marginBottom: 10,
        fontSize: 15,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    circle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#666",
        justifyContent: "center",
        alignItems: "center",
    },
    circleSelected: { backgroundColor: "#FF5252", borderColor: "#FF5252" },
    inlineInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    inlineInput: {
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontSize: 16,
        minWidth: 60,
        textAlign: 'center',
    },
    timesText: {
        fontSize: 14,
    },
    backButton: {
        padding: 4,
        marginRight: 10,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    modalBox: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    modalHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },

    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },

    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});