import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-success text-primary text-5xl font-sans-bold">
        Home
      </Text>
      <Link href="/onboarding" className="mt-4 font-sans-bold  rounded bg-primary text-white p-4">Go to Onboarding</Link>
      <Link href="/(auth)/sign-in" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">SignIn</Link>
      <Link href="/(auth)/sign-up" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">SignUp</Link>
      <Link href="/subscriptions/Spotify" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">Spotify Subscriptions</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: {
          id: "Netflix"
        }
      }} className="mt-4 font-sans-bold rounded bg-primary text-white p-4">Netflix Subscriptions</Link>
    </SafeAreaView>
  );
}