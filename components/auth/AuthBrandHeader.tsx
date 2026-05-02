import { branding } from "@/constants/branding";
import { Text, View } from "react-native";

export function AuthBrandHeader() {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">{branding.appInitial}</Text>
        </View>
        <View>
          <Text className="auth-wordmark">{branding.appName}</Text>
          <Text className="auth-wordmark-sub">{branding.tagline}</Text>
        </View>
      </View>
    </View>
  );
}
