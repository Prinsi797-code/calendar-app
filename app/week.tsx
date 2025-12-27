import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Animated, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { loadData } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HOUR_HEIGHT = 80;
const DAY_HEADER_HEIGHT = 80;
const TIME_COLUMN_WIDTH = 60;
const SWIPE_THRESHOLD = 50;

const COUNTRY_CALENDAR_IDS: Record<string, string> = {
   'Afghanistan': 'en.afghan#holiday@group.v.calendar.google.com',
  'Albania': 'en.albanian#holiday@group.v.calendar.google.com',
  'Algeria': 'en.algerian#holiday@group.v.calendar.google.com',
  'Angola': 'en.angolan#holiday@group.v.calendar.google.com',
  'Andorra': 'en.andorran#holiday@group.v.calendar.google.com',
  'Anguilla': 'en.anguilla#holiday@group.v.calendar.google.com',
  'Argentina': 'en.argentine#holiday@group.v.calendar.google.com',
  'Australia': 'en.australian#holiday@group.v.calendar.google.com',
  'Bahamas': 'en.bahamian#holiday@group.v.calendar.google.com',
  'Bangladesh': 'en.bd#holiday@group.v.calendar.google.com',
  'Barbados': 'en.barbadian#holiday@group.v.calendar.google.com',
  'Belarus': 'en.belarusian#holiday@group.v.calendar.google.com',
  'Belgium': 'en.be#holiday@group.v.calendar.google.com',
  'Belize': 'en.belizean#holiday@group.v.calendar.google.com',
  'Benin': 'en.beninese#holiday@group.v.calendar.google.com',
  'Bermuda': 'en.bermudian#holiday@group.v.calendar.google.com',
  'Bhutan': 'en.bhutanese#holiday@group.v.calendar.google.com',
  'Bolivia': 'en.bolivian#holiday@group.v.calendar.google.com',
  'Botswana': 'en.botswanan#holiday@group.v.calendar.google.com',
  'Brazil': 'en.brazilian#holiday@group.v.calendar.google.com',
  'Bulgaria': 'en.bulgarian#holiday@group.v.calendar.google.com',
  'Burundi': 'en.burundian#holiday@group.v.calendar.google.com',
  'Cambodia': 'en.cambodian#holiday@group.v.calendar.google.com',
  'Cameroon': 'en.cameroonian#holiday@group.v.calendar.google.com',
  'Canada': 'en.canadian#holiday@group.v.calendar.google.com',
  'Cape Verde': 'en.cape_verdean#holiday@group.v.calendar.google.com',
  'Cayman Islands': 'en.cayman_islands#holiday@group.v.calendar.google.com',
  'Central African Republic': 'en.central_african_republic#holiday@group.v.calendar.google.com',
  'Chad': 'en.chadian#holiday@group.v.calendar.google.com',
  'Chile': 'en.chilean#holiday@group.v.calendar.google.com',
  'China': 'en.china#holiday@group.v.calendar.google.com',
  'Colombia': 'en.colombian#holiday@group.v.calendar.google.com',
  'Comoros': 'en.comorian#holiday@group.v.calendar.google.com',
  'Congo - Brazzaville': 'en.congo_brazzaville#holiday@group.v.calendar.google.com',
  'Congo - Kinshasa': 'en.congo_kinshasa#holiday@group.v.calendar.google.com',
  'Cook Islands': 'en.cook_islands#holiday@group.v.calendar.google.com',
  'Costa Rica': 'en.costarican#holiday@group.v.calendar.google.com',
  'Croatia': 'en.croatian#holiday@group.v.calendar.google.com',
  'Cuba': 'en.cuban#holiday@group.v.calendar.google.com',
  'Curaçao': 'en.curacao#holiday@group.v.calendar.google.com',
  'Cyprus': 'en.cyprus#holiday@group.v.calendar.google.com',
  'Czechia': 'en.czech#holiday@group.v.calendar.google.com',
  'Côte d’Ivoire': 'en.cote_d_ivoire#holiday@group.v.calendar.google.com',
  'Denmark': 'en.danish#holiday@group.v.calendar.google.com',
  'Djibouti': 'en.djiboutian#holiday@group.v.calendar.google.com',
  'Dominica': 'en.dominican#holiday@group.v.calendar.google.com',
  'Dominican Republic': 'en.dominican_republic#holiday@group.v.calendar.google.com',
  'Ecuador': 'en.ecuadorian#holiday@group.v.calendar.google.com',
  'Egypt': 'en.egyptian#holiday@group.v.calendar.google.com',
  'El Salvador': 'en.salvadoran#holiday@group.v.calendar.google.com',
  'Equatorial Guinea': 'en.equatorial_guinea#holiday@group.v.calendar.google.com',
  'Eritrea': 'en.eritrean#holiday@group.v.calendar.google.com',
  'Estonia': 'en.estonian#holiday@group.v.calendar.google.com',
  'Eswatini': 'en.eswatini#holiday@group.v.calendar.google.com',
  'Ethiopia': 'en.ethiopian#holiday@group.v.calendar.google.com',
  'Falkland Islands (Islas Malvinas)': 'en.falkland_islands#holiday@group.v.calendar.google.com',
  'Faroe Islands': 'en.faroese#holiday@group.v.calendar.google.com',
  'Fiji': 'en.fijian#holiday@group.v.calendar.google.com',
  'Finland': 'en.finnish#holiday@group.v.calendar.google.com',
  'France': 'en.french#holiday@group.v.calendar.google.com',
  'French Guiana': 'en.french_guiana#holiday@group.v.calendar.google.com',
  'French Polynesia': 'en.french_polynesia#holiday@group.v.calendar.google.com',
  'Gabon': 'en.gabonese#holiday@group.v.calendar.google.com',
  'Gambia': 'en.gambian#holiday@group.v.calendar.google.com',
  'Georgia': 'en.georgian#holiday@group.v.calendar.google.com',
  'Germany': 'en.german#holiday@group.v.calendar.google.com',
  'Ghana': 'en.ghanaian#holiday@group.v.calendar.google.com',
  'Gibraltar': 'en.gibraltar#holiday@group.v.calendar.google.com',
  'Greece': 'en.greek#holiday@group.v.calendar.google.com',
  'Greenland': 'en.greenland#holiday@group.v.calendar.google.com',
  'Grenada': 'en.grenadian#holiday@group.v.calendar.google.com',
  'Guadeloupe': 'en.guadeloupe#holiday@group.v.calendar.google.com',
  'Guam': 'en.guam#holiday@group.v.calendar.google.com',
  'Guatemala': 'en.guatemalan#holiday@group.v.calendar.google.com',
  'Guernsey': 'en.guernsey#holiday@group.v.calendar.google.com',
  'Guinea': 'en.guinean#holiday@group.v.calendar.google.com',
  'Guinea-Bissau': 'en.guinea_bissau#holiday@group.v.calendar.google.com',
  'Guyana': 'en.guyanese#holiday@group.v.calendar.google.com',
  'Haiti': 'en.haitian#holiday@group.v.calendar.google.com',
  'Honduras': 'en.honduran#holiday@group.v.calendar.google.com',
  'Hong Kong': 'en.hong_kong#holiday@group.v.calendar.google.com',
  'Hungary': 'en.hungarian#holiday@group.v.calendar.google.com',
  'Iceland': 'en.icelandic#holiday@group.v.calendar.google.com',
  'India': 'en.indian#holiday@group.v.calendar.google.com',
  'Indonesia': 'en.indonesian#holiday@group.v.calendar.google.com',
  'Iran': 'en.iranian#holiday@group.v.calendar.google.com',
  'Iraq': 'en.iraqi#holiday@group.v.calendar.google.com',
  'Ireland': 'en.irish#holiday@group.v.calendar.google.com',
  'Isle of Man': 'en.isle_of_man#holiday@group.v.calendar.google.com',
  'Israel': 'en.israeli#holiday@group.v.calendar.google.com',
  'Italy': 'en.italian#holiday@group.v.calendar.google.com',
  'Jamaica': 'en.jamaican#holiday@group.v.calendar.google.com',
  'Japan': 'en.japanese#holiday@group.v.calendar.google.com',
  'Jersey': 'en.jersey#holiday@group.v.calendar.google.com',
  'Jordan': 'en.jordanian#holiday@group.v.calendar.google.com',
  'Kazakhstan': 'en.kazakhstani#holiday@group.v.calendar.google.com',
  'Kenya': 'en.kenyan#holiday@group.v.calendar.google.com',
  'Kiribati': 'en.kiribati#holiday@group.v.calendar.google.com',
  'Kosovo': 'en.kosovo#holiday@group.v.calendar.google.com',
  'Kuwait': 'en.kuwaiti#holiday@group.v.calendar.google.com',
  'Kyrgyzstan': 'en.kyrgyzstan#holiday@group.v.calendar.google.com',
  'Laos': 'en.laos#holiday@group.v.calendar.google.com',
  'Latvia': 'en.latvian#holiday@group.v.calendar.google.com',
  'Lebanon': 'en.lebanese#holiday@group.v.calendar.google.com',
  'Lesotho': 'en.lesotho#holiday@group.v.calendar.google.com',
  'Liberia': 'en.liberian#holiday@group.v.calendar.google.com',
  'Libya': 'en.libyan#holiday@group.v.calendar.google.com',
  'Liechtenstein': 'en.liechtenstein#holiday@group.v.calendar.google.com',
  'Lithuania': 'en.lithuanian#holiday@group.v.calendar.google.com',
  'Luxembourg': 'en.luxembourgish#holiday@group.v.calendar.google.com',
  'Macao': 'en.macao#holiday@group.v.calendar.google.com',
  'Madagascar': 'en.madagascan#holiday@group.v.calendar.google.com',
  'Malawi': 'en.malawian#holiday@group.v.calendar.google.com',
  'Malaysia': 'en.malaysian#holiday@group.v.calendar.google.com',
  'Maldives': 'en.maldivian#holiday@group.v.calendar.google.com',
  'Mali': 'en.malian#holiday@group.v.calendar.google.com',
  'Malta': 'en.maltese#holiday@group.v.calendar.google.com',
  'Marshall Islands': 'en.marshall_islands#holiday@group.v.calendar.google.com',
  'Martinique': 'en.martinique#holiday@group.v.calendar.google.com',
  'Mauritania': 'en.mauritanian#holiday@group.v.calendar.google.com',
  'Mauritius': 'en.mauritian#holiday@group.v.calendar.google.com',
  'Mayotte': 'en.mayotte#holiday@group.v.calendar.google.com',
  'Mexico': 'en.mexican#holiday@group.v.calendar.google.com',
  'Micronesia': 'en.micronesia#holiday@group.v.calendar.google.com',
  'Moldova': 'en.moldovan#holiday@group.v.calendar.google.com',
  'Monaco': 'en.monaco#holiday@group.v.calendar.google.com',
  'Mongolia': 'en.mongolian#holiday@group.v.calendar.google.com',
  'Montenegro': 'en.montenegrin#holiday@group.v.calendar.google.com',
  'Montserrat': 'en.montserrat#holiday@group.v.calendar.google.com',
  'Morocco': 'en.moroccan#holiday@group.v.calendar.google.com',
  'Mozambique': 'en.mozambican#holiday@group.v.calendar.google.com',
  'Myanmar (Burma)': 'en.myanmar#holiday@group.v.calendar.google.com',
  'Namibia': 'en.namibian#holiday@group.v.calendar.google.com',
  'Nauru': 'en.nauru#holiday@group.v.calendar.google.com',
  'Nepal': 'en.nepalese#holiday@group.v.calendar.google.com',
  'Netherlands': 'en.dutch#holiday@group.v.calendar.google.com',
  'New Caledonia': 'en.new_caledonia#holiday@group.v.calendar.google.com',
  'New Zealand': 'en.new_zealand#holiday@group.v.calendar.google.com',
  'Nicaragua': 'en.nicaraguan#holiday@group.v.calendar.google.com',
  'Niger': 'en.niger#holiday@group.v.calendar.google.com',
  'Nigeria': 'en.nigerian#holiday@group.v.calendar.google.com',
  'Northern Mariana Islands': 'en.northern_mariana_islands#holiday@group.v.calendar.google.com',
  'North Korea': 'en.north_korea#holiday@group.v.calendar.google.com',
  'North Macedonia': 'en.north_macedonia#holiday@group.v.calendar.google.com',
  'Norway': 'en.norwegian#holiday@group.v.calendar.google.com',
  'Oman': 'en.oman#holiday@group.v.calendar.google.com',
  'Pakistan': 'en.pakistani#holiday@group.v.calendar.google.com',
  'Palau': 'en.palau#holiday@group.v.calendar.google.com',
  'Panama': 'en.panamanian#holiday@group.v.calendar.google.com',
  'Papua New Guinea': 'en.papua_new_guinea#holiday@group.v.calendar.google.com',
  'Paraguay': 'en.paraguayan#holiday@group.v.calendar.google.com',
  'Peru': 'en.peruvian#holiday@group.v.calendar.google.com',
  'Philippines': 'en.philippines#holiday@group.v.calendar.google.com',
  'Poland': 'en.polish#holiday@group.v.calendar.google.com',
  'Portugal': 'en.portuguese#holiday@group.v.calendar.google.com',
  'Puerto Rico': 'en.puerto_rico#holiday@group.v.calendar.google.com',
  'Qatar': 'en.qatar#holiday@group.v.calendar.google.com',
  'Romania': 'en.romanian#holiday@group.v.calendar.google.com',
  'Russia': 'en.russian#holiday@group.v.calendar.google.com',
  'Rwanda': 'en.rwandan#holiday@group.v.calendar.google.com',
  'Réunion': 'en.reunion#holiday@group.v.calendar.google.com',
  'Samoa': 'en.samoan#holiday@group.v.calendar.google.com',
  'San Marino': 'en.san_marino#holiday@group.v.calendar.google.com',
  'Saudi Arabia': 'en.saudiarabian#holiday@group.v.calendar.google.com',
  'Senegal': 'en.senegalese#holiday@group.v.calendar.google.com',
  'Serbia': 'en.serbian#holiday@group.v.calendar.google.com',
  'Seychelles': 'en.seychelles#holiday@group.v.calendar.google.com',
  'Sierra Leone': 'en.sierra_leone#holiday@group.v.calendar.google.com',
  'Singapore': 'en.singapore#holiday@group.v.calendar.google.com',
  'Sint Maarten': 'en.sint_maarten#holiday@group.v.calendar.google.com',
  'Slovakia': 'en.slovak#holiday@group.v.calendar.google.com',
  'Slovenia': 'en.slovenian#holiday@group.v.calendar.google.com',
  'Solomon Islands': 'en.solomon_islands#holiday@group.v.calendar.google.com',
  'Somalia': 'en.somalian#holiday@group.v.calendar.google.com',
  'South Africa': 'en.south_africa#holiday@group.v.calendar.google.com',
  'South Korea': 'en.south_korea#holiday@group.v.calendar.google.com',
  'South Sudan': 'en.south_sudan#holiday@group.v.calendar.google.com',
  'Spain': 'en.spanish#holiday@group.v.calendar.google.com',
  'Sri Lanka': 'en.sri_lanka#holiday@group.v.calendar.google.com',
  'St. Barthélemy': 'en.st_barthelemy#holiday@group.v.calendar.google.com',
  'St. Helena': 'en.st_helena#holiday@group.v.calendar.google.com',
  'St. Kitts & Nevis': 'en.st_kitts_nevis#holiday@group.v.calendar.google.com',
  'St. Lucia': 'en.st_lucia#holiday@group.v.calendar.google.com',
  'St. Martin': 'en.st_martin#holiday@group.v.calendar.google.com',
  'St. Pierre & Miquelon': 'en.st_pierre_miquelon#holiday@group.v.calendar.google.com',
  'St. Vincent & Grenadines': 'en.st_vincent_grenadines#holiday@group.v.calendar.google.com',
  'Sudan': 'en.sudan#holiday@group.v.calendar.google.com',
  'Suriname': 'en.surinamese#holiday@group.v.calendar.google.com',
  'Sweden': 'en.swedish#holiday@group.v.calendar.google.com',
  'Switzerland': 'en.swiss#holiday@group.v.calendar.google.com',
  'Syria': 'en.syrian#holiday@group.v.calendar.google.com',
  'São Tomé & Príncipe': 'en.sao_tome_principe#holiday@group.v.calendar.google.com',
  'Taiwan': 'en.taiwan#holiday@group.v.calendar.google.com',
  'Tajikistan': 'en.tajikistan#holiday@group.v.calendar.google.com',
  'Tanzania': 'en.tanzanian#holiday@group.v.calendar.google.com',
  'Thailand': 'en.thai#holiday@group.v.calendar.google.com',
  'Timor-Leste': 'en.timor_leste#holiday@group.v.calendar.google.com',
  'Togo': 'en.togolese#holiday@group.v.calendar.google.com',
  'Tonga': 'en.tongan#holiday@group.v.calendar.google.com',
  'Trinidad & Tobago': 'en.trinidad_tobago#holiday@group.v.calendar.google.com',
  'Tunisia': 'en.tunisian#holiday@group.v.calendar.google.com',
  'Turkey': 'en.turkish#holiday@group.v.calendar.google.com',
  'Turkmenistan': 'en.turkmenistan#holiday@group.v.calendar.google.com',
  'Turks & Caicos Islands': 'en.turks_caicos_islands#holiday@group.v.calendar.google.com',
  'Tuvalu': 'en.tuvalu#holiday@group.v.calendar.google.com',
  'U.S. Virgin Islands': 'en.us_virgin_islands#holiday@group.v.calendar.google.com',
  'Uganda': 'en.ugandan#holiday@group.v.calendar.google.com',
  'Ukraine': 'en.ukrainian#holiday@group.v.calendar.google.com',
  'United Arab Emirates': 'en.united_arab_emirates#holiday@group.v.calendar.google.com',
  'United Kingdom': 'en.uk#holiday@group.v.calendar.google.com',
  'United States': 'en.usa#holiday@group.v.calendar.google.com',
  'Uruguay': 'en.uruguayan#holiday@group.v.calendar.google.com',
  'Uzbekistan': 'en.uzbekistan#holiday@group.v.calendar.google.com',
  'Vanuatu': 'en.vanuatu#holiday@group.v.calendar.google.com',
  'Venezuela': 'en.venezuelan#holiday@group.v.calendar.google.com',
  'Vietnam': 'en.vietnamese#holiday@group.v.calendar.google.com',
  'Wallis & Futuna': 'en.wallis_futuna#holiday@group.v.calendar.google.com',
  'Yemen': 'en.yemeni#holiday@group.v.calendar.google.com',
  'Zambia': 'en.zambian#holiday@group.v.calendar.google.com',
  'Zimbabwe': 'en.zimbabwean#holiday@group.v.calendar.google.com',
};

const TIME_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];

export default function WeekScreen() {
    const navigation = useNavigation();
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
    const { colors, theme } = useTheme();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [selectedCountry, setSelectedCountry] = useState('India');
    const scrollViewRef = useRef<ScrollView>(null);
    const currentTimeLineY = useRef(new Animated.Value(0)).current;
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [popupEvents, setPopupEvents] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

    const formatDate = (date: number) => {
        return date.toString().padStart(2, '0');
    };

    useEffect(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = day - firstDayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - diff);
        weekStart.setHours(0, 0, 0, 0);
        setCurrentWeekStart(weekStart);
        setCurrentYear(weekStart.getFullYear());
    }, [firstDayOfWeek]);

    useEffect(() => {
        setCurrentYear(currentWeekStart.getFullYear());
    }, [currentWeekStart]);

    useEffect(() => {
        const updateTimeLine = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            const orderIndex = TIME_ORDER.indexOf(hours);
            const totalMinutes = (orderIndex * 60) + minutes;
            const yPosition = (totalMinutes / 60) * HOUR_HEIGHT;
            currentTimeLineY.setValue(yPosition);
        };

        updateTimeLine();
        const interval = setInterval(updateTimeLine, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            const now = new Date();
            const hours = now.getHours();
            const orderIndex = TIME_ORDER.indexOf(hours);
            const scrollY = Math.max(0, (orderIndex - 2) * HOUR_HEIGHT);
            scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
        }, 100);
    }, [currentWeekStart]);

    useFocusEffect(
        React.useCallback(() => {
            loadEvents();
            loadFirstDay();
            loadSelectedCountry();
        }, [])
    );

    const loadEvents = async () => {
        const data = await loadData('events');
        if (data) setEvents(data);
    };

    const loadFirstDay = async () => {
        try {
            const day = await AsyncStorage.getItem('firstDayOfWeek');
            if (day) {
                setFirstDayOfWeek(parseInt(day));
            }
        } catch (error) {
            console.log('Error loading first day:', error);
        }
    };

    const loadSelectedCountry = async () => {
        try {
            const country = await AsyncStorage.getItem('selectedCountry');
            if (country) {
                setSelectedCountry(country);
                fetchHolidays(country);
            } else {
                fetchHolidays('India');
            }
        } catch (error) {
            console.log('Error loading country:', error);
            fetchHolidays('India');
        }
    };

    const fetchHolidays = async (countryName: string) => {
        try {
            const calendarId = COUNTRY_CALENDAR_IDS[countryName];
            if (!calendarId) {
                setHolidays([]);
                return;
            }

            const encodedCalendarId = encodeURIComponent(calendarId);
            const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?key=${API_KEY}&timeMin=2024-01-01T00:00:00Z&timeMax=2030-12-31T23:59:59Z&maxResults=1000`;

            const res = await fetch(API_URL);
            const data = await res.json();

            if (data.items) {
                const formattedHolidays = data.items.map((item: any) => ({
                    date: item.start.date,
                    name: item.summary,
                }));
                setHolidays(formattedHolidays);
            }
        } catch (err) {
            console.log('Error fetching holidays:', err);
            setHolidays([]);
        }
    };

    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const handleSwipe = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;

            if (translationX > SWIPE_THRESHOLD) {
                goToPreviousWeek();
            } else if (translationX < -SWIPE_THRESHOLD) {
                goToNextWeek();
            }
        }
    };

    const goToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);
    };

    const goToToday = () => {
        const today = new Date();
        const day = today.getDay();
        const diff = day - firstDayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - diff);
        weekStart.setHours(0, 0, 0, 0);
        setCurrentWeekStart(weekStart);
    };

    const parseTime = (timeString: string) => {
        if (!timeString) return 0;

        try {
            const [time, period] = timeString.trim().split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (isNaN(hours) || isNaN(minutes)) return 0;

            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            return hours * 60 + minutes;
        } catch (error) {
            console.log('Error parsing time:', timeString, error);
            return 0;
        }
    };

    const getTimeLabel = (hour24: number) => {
        if (hour24 === 0) return '12 AM';
        if (hour24 < 12) return `${hour24} AM`;
        if (hour24 === 12) return '12 PM';
        return `${hour24 - 12} PM`;
    };

    const getEventPosition = (event: any) => {
        if (event.allDay || event.isHoliday) {
            return { top: 0, height: 40 };
        }

        try {
            const startMinutes = parseTime(event.startTime);
            const endMinutes = parseTime(event.endTime);
            
            const startHour = Math.floor(startMinutes / 60);
            const startMinutesInHour = startMinutes % 60;
            const startOrderIndex = TIME_ORDER.indexOf(startHour);
            
            const endHour = Math.floor(endMinutes / 60);
            const endMinutesInHour = endMinutes % 60;
            const endOrderIndex = TIME_ORDER.indexOf(endHour);
            
            const top = (startOrderIndex * 60 + startMinutesInHour) * (HOUR_HEIGHT / 60);
            const bottom = (endOrderIndex * 60 + endMinutesInHour) * (HOUR_HEIGHT / 60);
            const height = Math.max(bottom - top, 30);

            return { top, height };
        } catch (error) {
            console.log('Error calculating event position:', error);
            return { top: 0, height: 40 };
        }
    };

    const shouldShowEventOnDate = (event: any, targetDateString: string) => {
        const eventStart = new Date(event.startDate.split('T')[0]);
        const eventEnd = new Date(event.endDate.split('T')[0]);
        const targetDate = new Date(targetDateString);
        
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        // For non-repeating events
        if (event.repeat === 'Does not repeat' || event.repeat === 'does_not') {
            return targetDate >= eventStart && targetDate <= eventEnd;
        }
        
        // For repeating events - must start on or before target date
        if (targetDate < eventStart) {
            return false;
        }
        
        const diffTime = targetDate.getTime() - eventStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Every day repeat
        if (event.repeat === 'every_day' || event.repeat.toLowerCase().includes('daily')) {
            return true;
        }
        
        // Every week repeat (7 days)
        if (event.repeat === 'every_week' || event.repeat.toLowerCase().includes('week')) {
            return diffDays % 7 === 0;
        }
        
        // Every month repeat (same date)
        if (event.repeat === 'every_month' || event.repeat.toLowerCase().includes('month')) {
            return eventStart.getDate() === targetDate.getDate();
        }
        
        // Every year repeat (same date and month)
        if (event.repeat === 'every_year' || event.repeat.toLowerCase().includes('year')) {
            return eventStart.getDate() === targetDate.getDate() && 
                   eventStart.getMonth() === targetDate.getMonth();
        }
        
        return false;
    };

    const getEventsForDay = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];

        const dayEvents = events.filter((e) => {
            if (!e.startDate || !e.endDate) return false;
            return shouldShowEventOnDate(e, dateString);
        });

        const dayHolidays = holidays
            .filter((h) => h.date === dateString)
            .map((h, index) => ({
                id: `holiday-${h.date}-${index}`,
                title: h.name,
                date: h.date,
                allDay: true,
                isHoliday: true,
                startTime: '12:00 AM',
                endTime: '11:59 PM',
            }));

        return [...dayHolidays, ...dayEvents];
    };

    const groupEventsByTimeSlot = (dayEvents: any[]) => {
        const allDayEvents: any[] = [];
        const timedEvents: any[] = [];

        dayEvents.forEach(event => {
            let eventStart = event.startDate;
            let eventEnd = event.endDate;

            if (eventStart && eventStart.includes('T')) {
                eventStart = eventStart.split('T')[0];
            }
            if (eventEnd && eventEnd.includes('T')) {
                eventEnd = eventEnd.split('T')[0];
            }
            const isMultiDay = eventStart !== eventEnd;
            if (event.allDay || event.isHoliday || isMultiDay) {
                allDayEvents.push(event);
            } else {
                timedEvents.push(event);
            }
        });

        timedEvents.sort((a, b) => {
            const aStart = parseTime(a.startTime);
            const bStart = parseTime(b.startTime);
            return aStart - bStart;
        });

        const groups: any[][] = [];

        timedEvents.forEach(event => {
            const eventStart = parseTime(event.startTime);
            const eventEnd = parseTime(event.endTime);

            let addedToGroup = false;

            for (let group of groups) {
                const hasOverlap = group.some(e => {
                    const eStart = parseTime(e.startTime);
                    const eEnd = parseTime(e.endTime);
                    return (eventStart < eEnd && eventEnd > eStart);
                });

                if (hasOverlap) {
                    group.push(event);
                    addedToGroup = true;
                    break;
                }
            }

            if (!addedToGroup) {
                groups.push([event]);
            }
        });

        return { allDayEvents, groups };
    };

    const handleEditEvent = (event: any) => {
        if (event.isHoliday) {
            router.push({
                pathname: '/holidayDetails',
                params: {
                    title: event.title,
                    date: event.date,
                    alert: event.alert || "All-day",
                }
            });
            return;
        }
        router.push({
            pathname: '/editEvent',
            params: {
                eventId: event.id,
                title: event.title || '',
                description: event.description || '',
                startDate: event.startDate || event.date,
                endDate: event.endDate || event.date,
                startTime: event.startTime || '12:00 PM',
                endTime: event.endTime || '01:00 PM',
                allDay: String(event.allDay || false),
                repeat: event.repeat || 'Does not repeat',
                reminders: JSON.stringify(event.reminders || ['At a time of event']),
            }
        });
    };

    const handleLongPress = (events: any[]) => {
        setPopupEvents(events);
        setShowEventPopup(true);
    };

    const weekDays = getWeekDays();
    const dayWidth = (SCREEN_WIDTH - TIME_COLUMN_WIDTH) / 7;
    const today = new Date().toISOString().split('T')[0];

    const getWeekRange = () => {
        const start = weekDays[0];
        const end = weekDays[6];

        const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

        if (startMonth === endMonth) {
            return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
        } else {
            return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Text style={[styles.menuIcon, { color: colors.textPrimary }]}>☰</Text>
                    </TouchableOpacity>

                    <Text style={[styles.yearText, { color: colors.textPrimary }]}>
                        {currentYear}
                    </Text>

                    <View style={styles.rightIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/search')}
                        >
                            <Feather
                                name="search"
                                size={22}
                                color={theme === 'dark' ? colors.white : colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <View style={[styles.dateBox]}>
                            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                                {formatDate(new Date().getDate())}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.weekRangeHeader, { backgroundColor: colors.cardBackground }]}>
                    <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
                        <Feather name="chevron-left" size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goToToday} style={styles.weekRangeButton}>
                        <Text style={[styles.weekRangeText, { color: colors.textPrimary }]}>
                            {getWeekRange()}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
                        <Feather name="chevron-right" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.weekHeader, { backgroundColor: colors.cardBackground }]}>
                    <View style={{ width: TIME_COLUMN_WIDTH }} />
                    {weekDays.map((date, index) => {
                        const dateString = date.toISOString().split('T')[0];
                        const isToday = dateString === today;
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                            <View key={index} style={[styles.dayHeader, { width: dayWidth }]}>
                                <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                                    {dayName}
                                </Text>
                                <View style={[
                                    styles.dateCircle,
                                    isToday && { backgroundColor: colors.primary }
                                ]}>
                                    <Text style={[
                                        styles.dateNumber,
                                        { color: isToday ? '#FFFFFF' : colors.textPrimary }
                                    ]}>
                                        {date.getDate()}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <PanGestureHandler onHandlerStateChange={handleSwipe}>
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.timeGrid}>
                                <View style={styles.timeColumn}>
                                    {TIME_ORDER.map((hour, i) => (
                                        <View key={i} style={[styles.timeSlot, { height: HOUR_HEIGHT }]}>
                                            <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                                                {getTimeLabel(hour)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.daysContainer}>
                                    {weekDays.map((date, dayIndex) => {
                                        const dayEvents = getEventsForDay(date);
                                        const { allDayEvents, groups } = groupEventsByTimeSlot(dayEvents);
                                        const dateString = date.toISOString().split('T')[0];
                                        const isToday = dateString === today;

                                        return (
                                            <View key={dayIndex} style={[styles.dayColumn, { width: dayWidth }]}>
                                                {TIME_ORDER.map((hour, i) => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.hourLine,
                                                            {
                                                                height: HOUR_HEIGHT,
                                                                borderBottomColor: colors.textTertiary + '20',
                                                                borderBottomWidth: 1,
                                                            }
                                                        ]}
                                                    />
                                                ))}

                                                {dayIndex < 6 && (
                                                    <View style={[
                                                        styles.verticalLine,
                                                        { borderRightColor: colors.textTertiary + '30' }
                                                    ]} />
                                                )}

                                                {allDayEvents.map((event, idx) => (
                                                    <TouchableOpacity
                                                        key={`allday-${idx}`}
                                                        style={[
                                                            styles.allDayEventBlock,
                                                            {
                                                                top: idx * 44,
                                                                backgroundColor: (event.isHoliday ? '#FF6B6B' : event.color || colors.primary) + '30',
                                                                borderLeftColor: event.isHoliday ? '#FF6B6B' : event.color || colors.primary,
                                                                width: dayWidth - 4,
                                                            }
                                                        ]}
                                                        onPress={() => handleEditEvent(event)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text
                                                            style={[styles.eventBlockTitle, { color: colors.textPrimary }]}
                                                            numberOfLines={1}
                                                        >
                                                            {event.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}

                                                {groups.map((group, groupIdx) => {
                                                    const visibleCount = Math.min(2, group.length);
                                                    const hasMore = group.length > 2;

                                                    return (
                                                        <View key={`group-${groupIdx}`}>
                                                            {group.slice(0, 2).map((event, eventIdx) => {
                                                                const { top, height } = getEventPosition(event);
                                                                const columnWidth = visibleCount === 1 ? dayWidth - 4 : (dayWidth - 4) / 2;
                                                                const leftOffset = eventIdx * columnWidth;

                                                                return (
                                                                    <TouchableOpacity
                                                                        key={`event-${event.id}-${eventIdx}`}
                                                                        style={[
                                                                            styles.eventBlock,
                                                                            {
                                                                                top,
                                                                                height,
                                                                                left: leftOffset + 2,
                                                                                width: columnWidth - 4,
                                                                                backgroundColor: (event.color || colors.primary) + '30',
                                                                                borderLeftColor: event.color || colors.primary,
                                                                            }
                                                                        ]}
                                                                        onPress={() => handleEditEvent(event)}
                                                                        onLongPress={() => handleLongPress(group)}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <Text
                                                                            style={[styles.eventBlockTitle, { color: colors.textPrimary }]}
                                                                            numberOfLines={1}
                                                                        >
                                                                            {event.title}
                                                                        </Text>
                                                                        <Text
                                                                            style={[styles.eventBlockTime, { color: colors.textSecondary }]}
                                                                            numberOfLines={1}
                                                                        >
                                                                            {event.startTime}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}

                                                            {hasMore && (
                                                                <TouchableOpacity
                                                                    style={[
                                                                        styles.moreEventsIndicator,
                                                                        {
                                                                            top: getEventPosition(group[1]).top + getEventPosition(group[1]).height + 4,
                                                                            right: 4,
                                                                            backgroundColor: colors.primary,
                                                                        }
                                                                    ]}
                                                                    onPress={() => handleLongPress(group)}
                                                                    activeOpacity={0.7}
                                                                >
                                                                    <Text style={styles.moreEventsText}>+{group.length - 2}</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}

                                                {isToday && (
                                                    <Animated.View
                                                        style={[
                                                            styles.currentTimeLine,
                                                            {
                                                                top: currentTimeLineY,
                                                                backgroundColor: '#FF5252',
                                                            }
                                                        ]}
                                                    >
                                                        <View style={styles.currentTimeDot} />
                                                    </Animated.View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </PanGestureHandler>

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/addEvent")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>

                <Modal
                    visible={showEventPopup}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowEventPopup(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowEventPopup(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                    Events
                                </Text>
                                <TouchableOpacity onPress={() => setShowEventPopup(false)}>
                                    <Feather name="x" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={popupEvents}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.popupEventItem, { borderLeftColor: item.isHoliday ? '#FF6B6B' : item.color || colors.primary }]}
                                        onPress={() => {
                                            setShowEventPopup(false);
                                            handleEditEvent(item);
                                        }}
                                    >
                                        <Text style={[styles.popupEventTitle, { color: colors.textPrimary }]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.popupEventTime, { color: colors.textSecondary }]}>
                                            {item.allDay ? t('all_day') : `${item.startTime} - ${item.endTime}`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </GestureHandlerRootView>
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
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    menuButton: {
        padding: 8,
    },
    menuIcon: {
        fontSize: 24,
        fontWeight: '600',
    },
    yearText: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
    },
    dateBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    weekRangeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    navButton: {
        padding: 8,
    },
    weekRangeButton: {
        flex: 1,
        alignItems: 'center',
    },
    weekRangeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    weekHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 8,
    },
    dayHeader: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayName: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateNumber: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    timeGrid: {
        flexDirection: 'row',
    },
    timeColumn: {
        width: TIME_COLUMN_WIDTH,
        paddingTop: HOUR_HEIGHT / 2,
    },
    timeSlot: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    daysContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    dayColumn: {
        position: 'relative',
    },
    hourLine: {
        borderBottomWidth: 1,
    },
    verticalLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        borderRightWidth: 1,
    },
    eventBlock: {
        position: 'absolute',
        borderLeftWidth: 3,
        borderRadius: 4,
        padding: 4,
        overflow: 'hidden',
    },
    allDayEventBlock: {
        position: 'absolute',
        left: 2,
        height: 40,
        borderLeftWidth: 3,
        borderRadius: 4,
        padding: 4,
        overflow: 'hidden',
    },
    eventBlockTitle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    eventBlockTime: {
        fontSize: 9,
    },
    moreEventsIndicator: {
        position: 'absolute',
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreEventsText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    currentTimeLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentTimeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        marginLeft: -4,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: SCREEN_WIDTH * 0.85,
        maxHeight: 400,
        borderRadius: 12,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    popupEventItem: {
        paddingVertical: 12,
        paddingLeft: 12,
        borderLeftWidth: 4,
        marginBottom: 8,
        borderRadius: 4,
    },
    popupEventTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    popupEventTime: {
        fontSize: 12,
    },
});