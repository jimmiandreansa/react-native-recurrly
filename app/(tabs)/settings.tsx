import { styled } from "nativewind";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { posthog } from "@/lib/posthog";
import { useClerk, useUser } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    primaryEmail?.split("@")[0] ||
    "Account";

  const onLogOut = () => {
    Alert.alert(
      "Log out?",
      "You will return to the sign-in screen and need your password to get back in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            posthog.capture("user_signed_out");
            posthog.reset();
            void signOut();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="mb-2 text-2xl font-sans-bold text-primary">Settings</Text>
      <Text className="mb-6 text-base font-sans-medium text-muted-foreground">
        Account and preferences
      </Text>
      <View className="mb-6 rounded-2xl border border-border bg-card p-4">
        <Text className="mb-1 text-xs font-sans-semibold uppercase tracking-wide text-muted-foreground">
          Signed in as
        </Text>
        <Text className="text-lg font-sans-bold text-primary">{displayName}</Text>
        {primaryEmail ? (
          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            {primaryEmail}
          </Text>
        ) : null}
      </View>
      <Text className="mb-2 text-lg font-sans-bold text-primary">Session</Text>
      <Text className="mb-3 text-sm font-sans-medium text-muted-foreground">
        Log out to test sign-in, sign-up, and email verification from scratch.
      </Text>
      <Pressable
        onPress={onLogOut}
        className="overflow-hidden rounded-2xl"
        accessibilityRole="button"
        accessibilityLabel="Log out"
        accessibilityHint="Ends your session and opens the sign-in screen"
      >
        <View className="items-center bg-primary py-4">
          <Text className="font-sans-bold text-background">Log out</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
