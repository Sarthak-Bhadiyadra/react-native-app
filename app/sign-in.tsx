import { useAuth, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { posthogLogs } from "@/lib/posthog-logs";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn.password({
        emailAddress,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (signIn.status === "complete" && signIn.createdSessionId) {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setError(finalizeError.message || "Failed to start session.");
          setLoading(false);
          return;
        }
        posthog?.capture("user_signed_in");
        posthogLogs.signInCompleted();
        router.replace("/(tabs)");
      } else {
        // Additional verification required (e.g. 2FA) — not handled in this basic flow.
        setError("Additional verification is required.");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">SubTrack</Text>
                <Text className="auth-wordmark-sub">Subscription Manager</Text>
              </View>
            </View>
            <Image
              source={images.splashPattern}
              className="h-40 w-40 opacity-80"
              resizeMode="contain"
            />
          </View>

          <View className="mt-10 items-center">
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to keep track of your subscriptions and never miss a renewal.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className="auth-input"
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className="auth-input"
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {error ? (
                <Text className="auth-error">{error}</Text>
              ) : null}

              <TouchableOpacity
                className="auth-button"
                onPress={onSignInPress}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Don&apos;t have an account?</Text>
            <Link href="/sign-up" className="auth-link">
              Sign up
            </Link>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
