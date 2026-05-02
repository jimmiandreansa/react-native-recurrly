import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { posthog } from "@/lib/posthog";
import { useUser } from "@clerk/expo";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    HOME_USER.name;

  const avatarSource =
    user?.imageUrl != null && user.imageUrl.length > 0
      ? { uri: user.imageUrl }
      : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <CreateSubscriptionModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={addSubscription}
      />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name">{displayName}</Text>
              </View>
              <Pressable
                onPress={() => setCreateOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
                hitSlop={12}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
              if (isExpanding) {
                posthog.capture("subscription_card_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                  subscription_billing: item.billing,
                });
              }
            }}
          />
        )}
        extraData={`${expandedSubscriptionId ?? ""}-${subscriptions.length}`}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-20"
      />
    </SafeAreaView>
  );
}
