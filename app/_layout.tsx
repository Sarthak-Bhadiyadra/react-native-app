import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import "../global.css";
import { useEffect, useRef } from "react";
import { posthog } from "../lib/posthog";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const router = useRouter();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      identifiedUserIdRef.current = null;
      return;
    }

    if (
      !isLoaded ||
      !isUserLoaded ||
      !user?.id ||
      identifiedUserIdRef.current === user.id
    ) {
      return;
    }

    posthog?.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.fullName ? { full_name: user.fullName } : {}),
      },
    });
    identifiedUserIdRef.current = user.id;
  }, [
    isLoaded,
    isSignedIn,
    isUserLoaded,
    user?.id,
    user?.primaryEmailAddress?.emailAddress,
    user?.fullName,
  ]);

  useEffect(() => {
    if (!isLoaded) return;

    // Keep the native splash visible until we know the auth state so the
    // protected home screen never flashes before the redirect.
    SplashScreen.hideAsync();

    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // While auth state is unknown, render nothing (splash stays on screen).
  if (!isLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  })

  // SplashScreen stays visible until fonts and Clerk auth state are ready.
  // RootLayoutNav hides it once isLoaded is true.
  if(!fontsLoaded) return null;
  const content = <RootLayoutNav />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>{content}</PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}
