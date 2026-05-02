import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import "@/global.css";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function subscriptionSearchText(s: Subscription): string {
  return [
    s.name,
    s.plan,
    s.category,
    s.paymentMethod,
    s.id,
    s.status,
    s.billing,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter((s) =>
      subscriptionSearchText(s).includes(q),
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="list-head mb-1">
        <Text className="list-title">Subscriptions</Text>
      </View>
      <Text className="mb-3 text-base font-sans-medium text-muted-foreground">
        Search by name, plan, category, or payment method.
      </Text>
      <TextInput
        className="auth-input mb-4"
        value={query}
        onChangeText={setQuery}
        placeholder="Search subscriptions…"
        placeholderTextColor="rgba(0,0,0,0.45)"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel="Search subscriptions"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={`${expandedSubscriptionId ?? ""}-${subscriptions.length}`}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-24"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text className="home-empty-state">
            {query.trim()
              ? "No subscriptions match your search."
              : "No subscriptions yet."}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
