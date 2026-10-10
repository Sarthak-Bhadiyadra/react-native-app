import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    posthog?.capture("user_signed_out", {
      source: "settings",
    });
    posthog?.reset();
    router.replace("/sign-in");
  };

  const displayName = user?.fullName || user?.firstName || "User";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const avatar = user?.imageUrl;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="mb-6 text-3xl font-sans-bold text-primary">Settings</Text>

      <View className="rounded-3xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-4">
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              className="size-16 rounded-full"
            />
          ) : (
            <View className="size-16 items-center justify-center rounded-full bg-accent">
              <Text className="text-xl font-sans-extrabold text-background">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-xl font-sans-bold text-primary">
              {isLoaded ? displayName : "Loading..."}
            </Text>
            {email ? (
              <Text className="text-sm font-sans-medium text-muted-foreground">
                {email}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="mt-6 items-center rounded-2xl bg-primary py-4"
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text className="font-sans-bold text-background">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
