import AdsManager from "@/services/adsManager";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from '../../contexts/ThemeContext';
import { loadData, saveData } from '../../utils/storage';

declare global {
  var firstDayChanged: ((day: number) => void) | undefined;
}
export { };
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

export default function CalendarScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
  const { colors, theme } = useTheme();
  const router = useRouter();
  const { setCurrentYear } = useTheme();
  const [showMonthEvents, setShowMonthEvents] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const { t, i18n } = useTranslation();
  const lightNoEventImg = require("../../assets/images/no-events.png");
  const darkNoEventImg = require("../../assets/images/dark-no-event.png");

  const params = useLocalSearchParams();
  const [calendarKey, setCalendarKey] = useState(0);

  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);

  const [currentMonth, setCurrentMonth] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

  // Load Banner Ad Config
  useEffect(() => {
    const config = AdsManager.getBannerConfig('home');
    setBannerConfig(config);
  }, []);

  useEffect(() => {
    if (params.refresh && params.resetToToday === 'true') {
      console.log('📅 Resetting calendar to today');

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      setSelectedDate(todayString);
      setCurrentMonth({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      });
      setCurrentYear(today.getFullYear());
      setShowMonthEvents(false);
      setCalendarKey(prev => prev + 1);

      console.log('✅ Calendar reset complete:', todayString);
    }
  }, [params.refresh, params.resetToToday]);


  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.6],
        }),
      },
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const generateRecurringDates = (event: any, endDate: Date) => {
    const dates: string[] = [];
    const startDateStr = event.startDate.split('T')[0];
    const start = new Date(startDateStr + 'T00:00:00');
    const repeatType = event.repeat;

    if (!repeatType || repeatType === 'Does not repeat' || repeatType === 'does_not') {
      return [startDateStr];
    }

    let current = new Date(start);
    const maxIterations = 3650; // 10 years max
    let iterations = 0;

    while (current <= endDate && iterations < maxIterations) {
      dates.push(current.toISOString().split('T')[0]);
      iterations++;

      switch (repeatType) {
        case 'Everyday':
        case 'everyday':
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;

        case 'Every week':
        case 'every_week':
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;

        case 'Every month':
        case 'every_month':
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;

        case 'Every year':
        case 'every_year':
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;

        default:
          return [startDateStr];
      }
    }

    return dates;
  };

  useEffect(() => {
    LocaleConfig.locales['custom'] = {
      monthNames: [
        t('January'),
        t('February'),
        t('March'),
        t('April'),
        t('May'),
        t('June'),
        t('July'),
        t('August'),
        t('September'),
        t('October'),
        t('November'),
        t('December')
      ],
      monthNamesShort: [
        t('January').substring(0, 3),
        t('February').substring(0, 3),
        t('March').substring(0, 3),
        t('April').substring(0, 3),
        t('May').substring(0, 3),
        t('June').substring(0, 3),
        t('July').substring(0, 3),
        t('August').substring(0, 3),
        t('September').substring(0, 3),
        t('October').substring(0, 3),
        t('November').substring(0, 3),
        t('December').substring(0, 3)
      ],
      dayNames: [
        t('Sunday'),
        t('Monday'),
        t('Tuesday'),
        t('Wednesday'),
        t('Thursday'),
        t('Friday'),
        t('Saturday')
      ],
      dayNamesShort: [
        t('Sunday').substring(0, 3),
        t('Monday').substring(0, 3),
        t('Tuesday').substring(0, 3),
        t('Wednesday').substring(0, 3),
        t('Thursday').substring(0, 3),
        t('Friday').substring(0, 3),
        t('Saturday').substring(0, 3)
      ],
      today: t('Today')
    };

    LocaleConfig.defaultLocale = 'custom';
    setRefreshKey(prev => prev + 1);
  }, [i18n.language, t]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    // loadFirstDay();
    setShowMonthEvents(true);
    loadSelectedCountry();
  }, []);
  useEffect(() => {
    global.firstDayChanged = (day: number) => {
      setFirstDayOfWeek(day);
      setRefreshKey(prev => prev + 1);
    };

    return () => {
      global.firstDayChanged = undefined;
    };
  }, []);

  const loadSelectedCountry = async () => {
    try {
      const country = await AsyncStorage.getItem('selectedCountry');
      console.log('📅 Calendar - Loading country:', country);

      if (country) {
        setSelectedCountry(country);
        console.log('✅ Fetching holidays for:', country);
        fetchHolidays(country);
      } else {
        console.log('⚠️ No saved country, using India');
        setSelectedCountry('India');
        fetchHolidays('India');
      }
    } catch (error) {
      console.log('❌ Error loading country:', error);
      fetchHolidays('India');
    }
  };


  const fetchHolidays = async (countryName: string) => {
    setLoadingHolidays(true);
    try {
      const calendarId = COUNTRY_CALENDAR_IDS[countryName];
      console.log('🔍 Calendar ID for', countryName, ':', calendarId);

      if (!calendarId) {
        console.log(`❌ No calendar found for ${countryName}`);
        setHolidays([]);
        setLoadingHolidays(false);
        return;
      }

      const encodedCalendarId = encodeURIComponent(calendarId);
      const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?key=${API_KEY}&timeMin=2024-01-01T00:00:00Z&timeMax=2030-12-31T23:59:59Z&maxResults=1000&singleEvents=true&orderBy=startTime`;

      console.log('📡 Fetching from API...');
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data.error) {
        console.log('❌ API Error:', data.error.message);
        setHolidays([]);
        setLoadingHolidays(false);
        return;
      }

      if (data.items) {
        console.log(`✅ Found ${data.items.length} holidays for ${countryName}`);
        console.log('First 3 holidays:', data.items.slice(0, 3).map(i => ({
          date: i.start.date,
          name: i.summary
        })));

        const formattedHolidays = data.items.map((item: any) => ({
          date: item.start.date,
          name: item.summary,
        }));
        setHolidays(formattedHolidays);
      } else {
        console.log('⚠️ No holidays found');
        setHolidays([]);
      }
    } catch (err) {
      console.log('❌ Error fetching holidays:', err);
      setHolidays([]);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const getRepeatDisplayText = (repeat: string) => {
    if (!repeat) return t('never');

    switch (repeat.toLowerCase()) {
      case 'does not repeat':
      case 'does_not':
        return t('never');
      case 'everyday':
      case 'daily':
        return t('everyday');
      case 'every week':
      case 'every_week':
      case 'weekly':
        return t('every_week');
      case 'every month':
      case 'every_month':
      case 'monthly':
        return t('every_month');
      case 'every year':
      case 'every_year':
      case 'yearly':
        return t('every_year');
      default:
        return t('never');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      t('delete_event_title'),
      t('delete_event_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const events = await loadData('events') || [];
              const updatedEvents = events.filter((e: any) => e.id !== eventId);
              await saveData('events', updatedEvents);
              setMenuVisible(null);
              setEvents(updatedEvents);
              console.log('Event deleted successfully');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  const handleShareEvent = (event: any) => {
    Alert.alert('Share', `Sharing: ${event.title}`);
    setMenuVisible(null);
  };
  useEffect(() => {
    if (!selectedDate || holidays.length === 0) return;
    setShowMonthEvents(false);
  }, [selectedDate, holidays]);

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
        const newFirstDay = parseInt(day);
        console.log('Calendar - Loading first day:', newFirstDay);
        setFirstDayOfWeek(newFirstDay);
        setRefreshKey(prev => prev + 1);

        const data = await loadData('events');
        if (data) setEvents(data);
      }
    } catch (error) {
      console.log('Error loading first day:', error);
    }
  };

  const getMonthEvents = () => {
    const { month, year } = currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const allEvents: any[] = [];

    events.forEach((event) => {
      const repeatType = event.repeat;
      const eventStartDate = event.startDate.split('T')[0];
      const eventStart = new Date(eventStartDate + 'T00:00:00');

      if (!repeatType || repeatType === 'Does not repeat' || repeatType === 'does_not') {
        const eventStartMonth = eventStart.getMonth() + 1;
        const eventStartYear = eventStart.getFullYear();

        if (event.allDay) {
          if (eventStartMonth === month && eventStartYear === year) {
            allEvents.push(event);
          }
        } else {
          const end = new Date(event.endDate.split('T')[0] + 'T00:00:00');
          if (eventStart <= lastDay && end >= firstDay) {
            allEvents.push(event);
          }
        }
        return;
      }
      let hasEventInMonth = false;
      if (eventStart > lastDay) {
        return;
      }

      switch (repeatType) {
        case 'Everyday':
        case 'everyday':
        case 'daily':
          hasEventInMonth = eventStart <= lastDay;
          break;

        case 'Every week':
        case 'every_week':
        case 'weekly':
          const eventWeekday = eventStart.getDay();
          let current = new Date(Math.max(firstDay.getTime(), eventStart.getTime()));

          while (current <= lastDay) {
            if (current.getDay() === eventWeekday) {
              hasEventInMonth = true;
              break;
            }
            current.setDate(current.getDate() + 1);
          }
          break;

        case 'Every month':
        case 'every_month':
        case 'monthly':
          const eventDate = eventStart.getDate();
          const daysInMonth = lastDay.getDate();

          if (eventDate <= daysInMonth) {
            hasEventInMonth = true;
          }
          break;

        case 'Every year':
        case 'every_year':
        case 'yearly':
          if (eventStart.getMonth() === month - 1) {
            hasEventInMonth = true;
          }
          break;
      }

      if (hasEventInMonth) {
        allEvents.push(event);
      }
    });
    const monthHolidays = holidays
      .filter((h) => h.date.startsWith(`${year}-${String(month).padStart(2, "0")}`))
      .map((h, index) => ({
        id: `holiday-${h.date}-${index}`,
        title: h.name,
        date: h.date,
        allDay: true,
        isHoliday: true,
      }));

    return [...monthHolidays, ...allEvents];
  };

  const getMarkedDates = () => {
    const marked: any = {};
    const eventDotsByDate: any = {};

    const formatDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const { month, year } = currentMonth;
    const startRange = new Date(year, month - 4, 1);
    const endRange = new Date(year, month + 2, 0);

    events.forEach((event) => {
      const eventColor = event.color || '#0267FF';
      const repeatType = event.repeat;
      const eventStartDate = event.startDate.split('T')[0];
      const eventStart = new Date(eventStartDate + 'T00:00:00');

      // Non-repeating events
      if (!repeatType || repeatType === 'Does not repeat' || repeatType === 'does_not') {
        if (!eventDotsByDate[eventStartDate]) {
          eventDotsByDate[eventStartDate] = [];
        }
        eventDotsByDate[eventStartDate].push(eventColor);
        return;
      }

      // Repeating events - generate dates within visible range only
      let current = new Date(Math.max(eventStart.getTime(), startRange.getTime()));

      while (current <= endRange) {
        // Use the helper function to avoid timezone issues
        const dateString = formatDateString(current);

        // Check if this date matches the repeat pattern
        let shouldMark = false;

        switch (repeatType) {
          case 'Everyday':
          case 'everyday':
          case 'daily':
            shouldMark = current >= eventStart;
            break;

          case 'Every week':
          case 'every_week':
          case 'weekly':
            shouldMark = current >= eventStart && current.getDay() === eventStart.getDay();
            break;

          case 'Every month':
          case 'every_month':
          case 'monthly':
            shouldMark = current >= eventStart && current.getDate() === eventStart.getDate();
            break;

          case 'Every year':
          case 'every_year':
          case 'yearly':
            shouldMark = current >= eventStart &&
              current.getMonth() === eventStart.getMonth() &&
              current.getDate() === eventStart.getDate();
            break;
        }

        if (shouldMark) {
          if (!eventDotsByDate[dateString]) {
            eventDotsByDate[dateString] = [];
          }
          eventDotsByDate[dateString].push(eventColor);
        }

        // Move to next day
        current.setDate(current.getDate() + 1);
      }
    });

    // Add holiday dots
    holidays.forEach((h) => {
      if (!marked[h.date]) {
        marked[h.date] = { marked: true, dots: [{ color: "#FF5252" }] };
      }
    });

    // Add event dots (max 2 dots per date)
    Object.keys(eventDotsByDate).forEach((dateString) => {
      const eventColors = eventDotsByDate[dateString];
      const uniqueColors = [...new Set(eventColors)]; // Remove duplicates
      const firstEventColor = uniqueColors[0];
      const secondEventColor = uniqueColors[1];

      if (!marked[dateString]) {
        marked[dateString] = {
          marked: true,
          dots: [{ color: firstEventColor }]
        };
      } else {
        // Holiday already exists, add event dot
        if (marked[dateString].dots && marked[dateString].dots.length < 2) {
          marked[dateString].dots.push({ color: firstEventColor });
        }
      }

      // Add second dot if multiple events
      if (secondEventColor && marked[dateString].dots.length < 2) {
        marked[dateString].dots.push({ color: secondEventColor });
      }
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marked;
  };


  const getTodayEvents = () => {
    const selected = selectedDate;
    const selectedDateOnly = selected.split('T')[0];
    const selectedD = new Date(selectedDateOnly + 'T00:00:00');
    const allEvents: any[] = [];

    // Filter user events with repeat logic
    events.forEach((event) => {
      const repeatType = event.repeat;
      const eventStartDate = event.startDate.split('T')[0];
      const eventStart = new Date(eventStartDate + 'T00:00:00');

      if (selectedD < eventStart) {
        return;
      }

      if (!repeatType || repeatType === 'Does not repeat' || repeatType === 'does_not') {
        if (event.allDay) {
          if (eventStartDate === selectedDateOnly) {
            allEvents.push(event);
          }
        } else {
          const start = new Date(event.startDate.split('T')[0] + 'T00:00:00');
          const end = new Date(event.endDate.split('T')[0] + 'T00:00:00');
          if (selectedD >= start && selectedD <= end) {
            allEvents.push(event);
          }
        }
        return;
      }
      let shouldShow = false;

      switch (repeatType) {
        case 'Everyday':
        case 'everyday':
        case 'daily':
          shouldShow = true;
          break;

        case 'Every week':
        case 'every_week':
        case 'weekly':
          shouldShow = selectedD.getDay() === eventStart.getDay();
          break;

        case 'Every month':
        case 'every_month':
        case 'monthly':
          shouldShow = selectedD.getDate() === eventStart.getDate();
          break;

        case 'Every year':
        case 'every_year':
        case 'yearly':
          shouldShow = selectedD.getMonth() === eventStart.getMonth() &&
            selectedD.getDate() === eventStart.getDate();
          break;
      }

      if (shouldShow) {
        allEvents.push(event);
      }
    });

    const todayHolidays = holidays
      .filter((h) => h.date === selectedDateOnly)
      .map((h, index) => ({
        id: `holiday-${h.date}-${index}`,
        title: h.name,
        date: h.date,
        allDay: true,
        isHoliday: true,
      }));

    return [...todayHolidays, ...allEvents];
  };


  const handleEditEvent = (event: any) => {
    setMenuVisible(null);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* STICKY CALENDAR HEADER */}
      <View style={[styles.calendarContainer, { backgroundColor: colors.background }]}>
        <Calendar
          key={`${theme}-${firstDayOfWeek}-${refreshKey}-${i18n.language}-${calendarKey}`}
          firstDay={firstDayOfWeek}
          current={selectedDate}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setShowMonthEvents(false);
          }}
          markedDates={getMarkedDates()}
          onMonthChange={(month) => {
            setCurrentMonth({
              month: month.month,
              year: month.year,
            });
            setCurrentYear(month.year);
            setShowMonthEvents(true);
          }}
          enableSwipeMonths={true}
          style={{ backgroundColor: colors.background }}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.textPrimary,
            textSectionTitleDisabledColor: colors.textTertiary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
            dayTextColor: colors.textPrimary,
            textDisabledColor: colors.textTertiary,
            dotColor: colors.primary,
            selectedDotColor: '#ffffff',
            arrowColor: colors.primary,
            disabledArrowColor: colors.textTertiary,
            monthTextColor: colors.textPrimary,
            indicatorColor: colors.primary,
            'stylesheet.day.basic': {
              base: {
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              },
              text: {
                marginTop: 4,
                fontSize: 16,
                fontFamily: 'System',
                fontWeight: '300',
                color: colors.textPrimary,
              },
              selected: {
                backgroundColor: colors.primary,
                borderRadius: 16,
              },
              today: {
                backgroundColor: 'transparent',
              },
              todayText: {
                color: colors.primary,
                fontWeight: 'bold',
              },
              sunday: {
                color: '#FF5252',
              },
            },
          }}
          dayComponent={({ date, state, marking }: any) => {
            const isSunday = new Date(date.dateString).getDay() === 0;
            const isSelected = date.dateString === selectedDate;
            const isToday = date.dateString === new Date().toISOString().split('T')[0];

            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(date.dateString);
                  setShowMonthEvents(false);
                }}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: isSelected
                      ? '#ffffff'
                      : state === 'disabled'
                        ? colors.textTertiary
                        : isSunday
                          ? '#FF5252'
                          : isToday
                            ? colors.primary
                            : colors.textPrimary,
                    fontWeight: isToday ? 'bold' : '400',
                  }}
                >
                  {date.day}
                </Text>
                {marking?.dots && marking.dots.length > 0 && (
                  <View style={{ flexDirection: "row", position: "absolute", bottom: 3 }}>
                    {marking.dots.map((dot, index) => (
                      <View
                        key={index}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: isSelected ? '#ffffff' : dot.color,
                          marginHorizontal: 1,
                        }}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* SCROLLABLE EVENT LIST */}
      <ScrollView style={styles.eventsScrollView}>
        <View style={[styles.eventsList, { backgroundColor: colors.background }]}>
          {(showMonthEvents ? getMonthEvents() : getTodayEvents()).length > 0 ? (
            (showMonthEvents ? getMonthEvents() : getTodayEvents()).map((event, index) => (
              <View key={`${event.id}-${index}`} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: '/viewEvent',
                      params: {
                        eventId: event.id,
                        title: event.title || '',
                        description: event.description || '',
                        startDate: event.startDate || event.date,
                        endDate: event.endDate || event.date,
                        startTime: event.startTime || '12:00 PM',
                        endTime: event.endTime || '01:00 PM',
                        allDay: String(event.allDay || false),
                        repeat: event.repeat || 'does_not',
                        reminders: JSON.stringify(event.reminders || ['at_time']),
                        color: event.color || (event.isHoliday ? '#FF6B6B' : '#0267FF'),
                        isHoliday: String(event.isHoliday || false),
                      }
                    });
                  }}
                >
                  <View
                    style={[
                      styles.eventDateBar,
                      {
                        backgroundColor: event.isHoliday
                          ? '#FF6B6B'
                          : event.color || colors.primary,
                      },
                    ]}
                  />
                  <View style={styles.eventContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.eventTime, { color: colors.primary }]}>
                        {selectedDate}
                      </Text>
                      <Text style={[styles.eventRepeat, { color: colors.textTertiary, fontSize: 12 }]}>
                        {getRepeatDisplayText(event.repeat || (event.isHoliday ? 'does_not' : ''))}
                      </Text>
                    </View>

                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                      {event.title}
                    </Text>

                    <Text style={[styles.eventTime, { color: colors.textTertiary }]}>
                      {event.isHoliday ? t('all_day') : `${event.startTime} - ${event.endTime}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Image
                source={theme === "dark" ? darkNoEventImg : lightNoEventImg}
                style={{ width: 140, height: 140, marginBottom: 12 }}
                resizeMode="contain"
              />

              <Text
                style={[
                  styles.noDataText,
                  { color: colors.textTertiary, fontSize: 16 }
                ]}
              >
                {t("no_event_yet")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB BUTTON */}
      <View style={{ position: "absolute", right: 16, bottom: 80 }}>
        <Animated.View
          style={[
            styles.pulseRing,
            pulseStyle,
            { backgroundColor: colors.primary },
          ]}
        />
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/addEvent")}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
  },
  eventsScrollView: {
    flex: 1,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
  },
  eventDateBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  stickyAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    marginTop: 6,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
  },
  eventRepeatContainer: {
    justifyContent: 'center',
    paddingRight: 12,
    paddingLeft: 8,
  },
  eventRepeat: {
    justifyContent: "center",
    alignItems: 'center',
    textAlign: 'center',
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topPosition: {
    paddingTop: 10,
  },
  bottomPosition: {
    paddingBottom: 10,
  },

  eventRepeatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
  },
  pulseRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  eventMenuContainer: {
    position: 'relative',
    paddingTop: 8,
    paddingRight: 8,
  },
  menuButton: {
    padding: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 0,
    right: 30,
    width: 130,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
});