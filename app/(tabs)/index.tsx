import "@/global.css";
import { Link, useRouter } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useUser } from "@clerk/expo";
import { useEffect } from "react";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscription from "@/components/UpcomingSubscription";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
import { posthog } from "@/lib/posthog";
import { posthogLogs } from "@/lib/posthog-logs";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  const handleSignOut = async () => {
    await signOut();
    posthog?.capture("user_signed_out", {
      source: "home",
    });
    posthog?.reset();
    router.replace('/sign-in');
  };

  const handlePress = (id: string) => {
    const isExpanding = expandedSubscriptionId !== id;
    if (isExpanding) {
      posthog?.capture("subscription_expanded", {
        source: "home_dashboard",
      });
      posthogLogs.subscriptionExpanded();
    }
    setExpandedSubscriptionId(isExpanding ? id : null);
  }

  // const handleExpandSubscription = (id: string) => {
  //   setExpandedSubscriptionId(id)
  // }

  // const handleCollapseSubscription = () => {
  //   setExpandedSubscriptionId(null)
  // }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => {
          return <>
            <View className="home-header">
              <View className="home-user">
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="home-avatar" />
                ) : (
                  <View className="home-avatar items-center justify-center rounded-full bg-accent">
                    <Text className="text-2xl font-sans-extrabold text-background">
                      {(user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "U").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text className="home-user-name">
                  {isLoaded && user
                    ? user.firstName || user.fullName || user.emailAddresses[0]?.emailAddress
                    : 'Loading...'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleSignOut}>
                <Text className="text-primary font-semibold">Sign Out</Text>
              </TouchableOpacity>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Your Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcomming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscription {...item as UpcomingSubscription} />}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state" >No Upcoming Subscriptions</Text>}
              />
            </View>
            <ListHeading title="All Subscriptions" />

          </>
        }}
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => {
          return <SubscriptionCard {...item} expanded={expandedSubscriptionId === item?.id} onPress={() => handlePress(item?.id)} />
        }}
        keyExtractor={(item) => item?.id}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state" >No Subscriptions</Text>}
        contentContainerClassName="pb-10"
      />
    </SafeAreaView>
  );
}