import { posthog } from "@/lib/posthog";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", { subscription_id: id });
  }, [id]);

  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/(auth)/sign-in">
        Go Back
      </Link>
    </View>
  );
};

export default SubscriptionDetails;
