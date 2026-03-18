import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { PurchasesPackage, PurchasesOffering } from "react-native-purchases";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/providers/ThemeProvider";
import { usePremium } from "@/hooks/usePremium";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@/services/revenueCat";

const FEATURES = [
  "Sınırsız özel cümle ekle",
  "Sınırsız quiz",
  "Tüm kategorilere erişim",
  "Auto-mode sınırsız kullan",
  "Kaynak dil TTS desteği",
];

interface PackageOption {
  pkg: PurchasesPackage;
  label: string;
  badge?: string;
}

export default function PaywallScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { refresh } = usePremium();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  async function loadOfferings() {
    setLoading(true);
    try {
      const current = await getOfferings();
      if (!current) {
        setLoading(false);
        return;
      }
      setOffering(current);

      const opts: PackageOption[] = [];

      // Paketleri belirli sırayla göster
      const monthly = current.monthly;
      const annual = current.annual;
      // Ömürlük için availablePackages içinde ara
      const lifetime = current.availablePackages.find(
        (p) => p.packageType === "LIFETIME" || p.identifier.includes("lifetime")
      );

      if (monthly) opts.push({ pkg: monthly, label: "Aylık" });
      if (annual) opts.push({ pkg: annual, label: "Yıllık", badge: "En Popüler" });
      if (lifetime) opts.push({ pkg: lifetime, label: "Ömürlük", badge: "En İyi Değer" });

      setPackages(opts);
      // Varsayılan seçim: yıllık
      const defaultPkg = annual ?? monthly ?? lifetime;
      if (defaultPkg) setSelectedPkg(defaultPkg);
    } catch (e) {
      console.error("Offerings load error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!selectedPkg) return;
    setPurchasing(true);
    try {
      const result = await purchasePackage(selectedPkg);
      if (result.userCancelled) {
        // Kullanıcı vazgeçti, sessizce kapat
      } else if (result.success) {
        await refresh();
        Alert.alert(
          "Premium Aktif!",
          "Tüm premium özelliklere erişebilirsin.",
          [{ text: "Harika!", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Hata", result.error ?? "Satın alma başarısız oldu.");
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.isPremium) {
        await refresh();
        Alert.alert(
          "Geri Yüklendi!",
          "Premium satın alman geri yüklendi.",
          [{ text: "Tamam", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Bulunamadı", "Bu hesapta aktif bir premium satın alma bulunamadı.");
      }
    } catch {
      Alert.alert("Hata", "Satın almalar geri yüklenirken bir sorun oluştu.");
    } finally {
      setRestoring(false);
    }
  }

  const s = styles(colors);

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.premiumAccent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Kapat butonu */}
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={s.closeTxt}>✕</Text>
        </TouchableOpacity>

        {/* Başlık */}
        <LinearGradient
          colors={["#8B5CF6", "#4DA3FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.badge}
        >
          <Text style={s.badgeTxt}>PREMIUM</Text>
        </LinearGradient>

        <Text style={s.title}>Renkli Diller'i{"\n"}tam açıkla</Text>
        <Text style={s.subtitle}>Dil öğrenmeye sınır yok</Text>

        {/* Özellik listesi */}
        <View style={s.featureList}>
          {FEATURES.map((f) => (
            <View key={f} style={s.featureRow}>
              <Text style={s.featureCheck}>✓</Text>
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Paket seçimi */}
        {packages.length > 0 ? (
          <View style={s.packages}>
            {packages.map(({ pkg, label, badge }) => {
              const isSelected = selectedPkg?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[s.packageCard, isSelected && s.packageCardSelected]}
                  onPress={() => setSelectedPkg(pkg)}
                  activeOpacity={0.8}
                >
                  {badge && (
                    <View style={s.packageBadge}>
                      <Text style={s.packageBadgeTxt}>{badge}</Text>
                    </View>
                  )}
                  <Text style={[s.packageLabel, isSelected && s.packageLabelSelected]}>
                    {label}
                  </Text>
                  <Text style={[s.packagePrice, isSelected && s.packagePriceSelected]}>
                    {pkg.product.priceString}
                  </Text>
                  {pkg.product.subscriptionPeriod && (
                    <Text style={s.packagePeriod}>
                      {pkg.packageType === "ANNUAL" ? "/yıl" : pkg.packageType === "MONTHLY" ? "/ay" : "tek seferlik"}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={s.offlineNote}>
            <Text style={s.offlineNoteTxt}>
              Fiyat bilgisi yüklenemedi. İnternet bağlantını kontrol et.
            </Text>
          </View>
        )}

        {/* Satın al butonu */}
        <TouchableOpacity
          style={[s.purchaseBtn, (!selectedPkg || purchasing) && { opacity: 0.6 }]}
          onPress={handlePurchase}
          disabled={!selectedPkg || purchasing}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#8B5CF6", "#4DA3FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.purchaseBtnGradient}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.purchaseBtnTxt}>Premium'a Geç</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Geri yükle */}
        <TouchableOpacity style={s.restoreBtn} onPress={handleRestore} disabled={restoring}>
          {restoring ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Text style={s.restoreTxt}>Satın almayı geri yükle</Text>
          )}
        </TouchableOpacity>

        {/* Yasal notlar */}
        <Text style={s.legalTxt}>
          Abonelikler her dönem sonunda otomatik yenilenir. İstediğin zaman App Store veya Google Play üzerinden iptal edebilirsin.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function styles(colors: ReturnType<typeof import("@/providers/ThemeProvider").useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      padding: 24,
      paddingBottom: 40,
      alignItems: "center",
    },
    closeBtn: {
      alignSelf: "flex-end",
      padding: 8,
    },
    closeTxt: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    badge: {
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 6,
      marginTop: 8,
      marginBottom: 16,
    },
    badgeTxt: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
      letterSpacing: 1.5,
    },
    title: {
      fontSize: 30,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: 38,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 8,
      marginBottom: 24,
      textAlign: "center",
    },
    featureList: {
      width: "100%",
      marginBottom: 28,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    featureCheck: {
      color: colors.premiumAccent,
      fontSize: 16,
      fontWeight: "700",
      marginRight: 12,
      width: 20,
      textAlign: "center",
    },
    featureText: {
      fontSize: 15,
      color: colors.textPrimary,
      flex: 1,
    },
    packages: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginBottom: 24,
    },
    packageCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
      position: "relative",
    },
    packageCardSelected: {
      borderColor: colors.premiumAccent,
      backgroundColor: colors.surfaceSecondary,
    },
    packageBadge: {
      position: "absolute",
      top: -10,
      backgroundColor: colors.premiumAccent,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    packageBadgeTxt: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "700",
    },
    packageLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      marginTop: 8,
    },
    packageLabelSelected: {
      color: colors.premiumAccent,
    },
    packagePrice: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.textPrimary,
      marginTop: 4,
    },
    packagePriceSelected: {
      color: colors.premiumAccent,
    },
    packagePeriod: {
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 2,
    },
    offlineNote: {
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 24,
      width: "100%",
    },
    offlineNoteTxt: {
      color: colors.textSecondary,
      textAlign: "center",
      fontSize: 14,
    },
    purchaseBtn: {
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 14,
    },
    purchaseBtnGradient: {
      paddingVertical: 18,
      alignItems: "center",
    },
    purchaseBtnTxt: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
    },
    restoreBtn: {
      paddingVertical: 10,
      marginBottom: 16,
    },
    restoreTxt: {
      color: colors.textSecondary,
      fontSize: 14,
      textDecorationLine: "underline",
    },
    legalTxt: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: 16,
    },
  });
}
