import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../contexts/ThemeContext";

export default function RepeatScreen() {
    const { selectedRepeat } = useLocalSearchParams();
    const { colors } = useTheme();

    const [repeatType, setRepeatType] = useState(
        selectedRepeat || "Does not repeat"
    );

    const [durationType, setDurationType] = useState("Forever");

    const [timesCount, setTimesCount] = useState("10");
    const [untilDate, setUntilDate] = useState(new Date());
    const [showDateModal, setShowDateModal] = useState(false);

    const repeatOptions = [
        "Does not repeat",
        "Everyday",
        "Every week",
        "Every month",
        "Every year",
    ];

    const durationOptions = ["Forever", "Until", "Specific number of times"];

    const saveAndGoBack = () => {
        router.replace({
            pathname: "/addEvent",
            params: {
                repeatValue: repeatType,
                repeatDuration: durationType,
                repeatCount: timesCount,
                repeatUntil: formatDateForDisplay(untilDate),
            },
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* HEADER */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>

                {/* Back Arrow */}
                <TouchableOpacity style={styles.headerLeft} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                {/* Center Title */}
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Repeat
                    </Text>
                </View>

                {/* Save */}
                <TouchableOpacity style={styles.headerRight} onPress={saveAndGoBack}>
                    <Feather name="check" size={24} color="#FF5252" />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>

                {/* Top Info */}
                <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                    This event will repeat {repeatType} {durationType.toLowerCase()}
                </Text>

                {/* REPEAT OPTIONS */}
                {repeatOptions.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.option,
                            { backgroundColor: colors.cardBackground },
                        ]}
                        onPress={() => setRepeatType(item)}
                    >
                        <Text style={[styles.text, { color: colors.textPrimary }]}>
                            {item}
                        </Text>

                        <View
                            style={[
                                styles.circle,
                                repeatType === item && styles.circleSelected,
                            ]}
                        >
                            {repeatType === item && (
                                <Feather name="check" size={14} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* DURATION SECTION */}
                {repeatType !== "Does not repeat" && (
                    <>
                        <Text
                            style={[styles.durationTitle, { color: colors.textSecondary }]}
                        > Duration
                        </Text>

                        {durationOptions.map((item) => (
                            <View key={item}>
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        { backgroundColor: colors.cardBackground },
                                    ]}
                                    onPress={() => {
                                        setDurationType(item);

                                        if (item === "Until") {
                                            setShowDateModal(true);
                                        }
                                    }}
                                >
                                    <View style={styles.optionLeft}>
                                        <Text style={[styles.text, { color: colors.textPrimary }]}>
                                            {item}
                                        </Text>

                                        {/* Show Date inline for Until option */}
                                        {item === "Until" && durationType === "Until" && (
                                            <Text style={[styles.subText, { color: colors.textSecondary }]}>
                                                {formatDateForDisplay(untilDate)}
                                            </Text>
                                        )}

                                        {/* Show Input inline for Specific number of times */}
                                        {item === "Specific number of times" && durationType === "Specific number of times" && (
                                            <View style={styles.inlineInputContainer}>
                                                <TextInput
                                                    keyboardType="numeric"
                                                    value={timesCount}
                                                    onChangeText={setTimesCount}
                                                    style={[
                                                        styles.inlineInput,
                                                        {
                                                            color: colors.textPrimary,
                                                            borderColor: colors.border,
                                                        }
                                                    ]}
                                                    maxLength={3}
                                                />
                                                <Text style={[styles.timesText, { color: colors.textSecondary }]}>
                                                    Times total
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View
                                        style={[
                                            styles.circle,
                                            durationType === item && styles.circleSelected,
                                        ]}
                                    >
                                        {durationType === item && (
                                            <Feather name="check" size={14} color="#fff" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* DATE PICKER MODAL - Calendar Style */}
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
                                Select End Date
                            </Text>
                        </View>

                        <Calendar
                            minDate={getTodayString()}
                            onDayPress={(day) => {
                                setUntilDate(new Date(day.dateString));
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
                                [untilDate.toISOString().split('T')[0]]: {
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
                                    CANCEL
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setShowDateModal(false)}
                                style={styles.modalButton}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FF5252' }]}>
                                    OK
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
        borderBottomWidth: 1,
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
        fontSize: 12, 
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