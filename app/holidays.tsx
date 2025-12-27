import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BannerAdSize,
  GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../contexts/ThemeContext';
import AdsManager from '../services/adsManager';
import NotificationService from '../services/NotificationService';

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

const SELECTED_COUNTRY_KEY = 'selectedCountry';

export default function Holidays() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);

  // Load saved country from AsyncStorage or params
  useEffect(() => {
    const loadCountry = async () => {
      try {
        // First check if country is passed in params
        if (params.country) {
          const countryName = Array.isArray(params.country) ? params.country[0] : params.country;
          setSelectedCountry(countryName);
          // Save to AsyncStorage
          await AsyncStorage.setItem(SELECTED_COUNTRY_KEY, countryName);
        } else {
          // Load from AsyncStorage
          const savedCountry = await AsyncStorage.getItem(SELECTED_COUNTRY_KEY);
          if (savedCountry) {
            setSelectedCountry(savedCountry);
          }
        }
      } catch (error) {
        console.log('Error loading country:', error);
      }
    };
    loadCountry();
  }, [params.country]);

  useEffect(() => {
    const config = AdsManager.getBannerConfig('home');
    setBannerConfig(config);
  }, []);

  const handleBackPress = async () => {
    await AdsManager.showBackButtonAd('language');
    if (params?.from === "/") {
      router.replace("/");
    } else {
      router.back();
    }
  };
  
  const API_KEY = "AIzaSyCbk3aJTWGqJZVHtb3SR7OqzUFEc9Cewe0";

  const formatDate = (rawDate: string, lang: string) => {
    const date = new Date(rawDate);
    return date.toLocaleDateString(
      lang === 'hi' ? 'hi-IN' : 'en-IN',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      setError(null);
      try {
        const calendarId = COUNTRY_CALENDAR_IDS[selectedCountry];
        const currentYear = new Date().getFullYear();
        
        if (!calendarId) {
          setError(`Holidays not available for ${selectedCountry}`);
          setLoading(false);
          return;
        }

        const encodedCalendarId = encodeURIComponent(calendarId);
        const API_URL =
          `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events` +
          `?key=${API_KEY}` +
          `&timeMin=${currentYear}-01-01T00:00:00Z` +
          `&timeMax=${currentYear + 3}-12-31T23:59:59Z` +
          `&maxResults=1000` +
          `&singleEvents=true` +
          `&orderBy=startTime` +
          `&hl=${i18n.language === 'hi' ? 'hi' : 'en'}`;

        console.log('Fetching holidays for:', selectedCountry);
        console.log('API URL:', API_URL);

        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.error) {
          console.error('API Error:', data.error);
          setError(`Error: ${data.error.message}`);
          setLoading(false);
          return;
        }

        if (data.items && data.items.length > 0) {
          console.log(`Found ${data.items.length} holidays`);
          const formatted = data.items.map((item: any) => {
            NotificationService.scheduleFestivalNotification(
              item.id,
              item.summary,
              item.start.date
            );

            return {
              date: formatDate(item.start.date, i18n.language),
              name: item.summary,
            };
          });
          setHolidays(formatted);
        } else {
          console.log('No holidays found');
          setHolidays([]);
        }
      } catch (err) {
        console.error("Error fetching holidays:", err);
        setError("Failed to load holidays. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHolidays();
  }, [selectedCountry, i18n.language]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t("holiday")} - {selectedCountry}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
        </View>
      ) : holidays.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>
            No holidays found for {selectedCountry}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {holidays.map((holiday, index) => (
            <View key={index} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.redBar, { backgroundColor: '#FF433A' }]} />
              <View style={styles.textSection}>
                <Text style={[styles.date, { color: '#FF433A' }]}>{holiday.date}</Text>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{holiday.name}</Text>
                <Text style={[styles.subText, { color: colors.textTertiary }]}>{t("allday")}</Text>
              </View>
              <Text style={[styles.never, { color: colors.textTertiary }]}>{t("never")}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      {bannerConfig?.show && (
        <View style={styles.stickyAdContainer}>
          <GAMBannerAd
            unitId={bannerConfig.id}
            sizes={[BannerAdSize.FULL_BANNER]}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  redBar: {
    width: 4,
  },
  textSection: {
    flex: 1,
    padding: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  subText: {
    fontSize: 12,
    marginTop: 4,
  },
  never: {
    alignSelf: 'center',
    marginRight: 12,
    fontSize: 12,
  },
  stickyAdContainer: {
    alignItems: 'center',
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});